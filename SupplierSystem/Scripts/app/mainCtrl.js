/// <reference path="Config.ts" />
/// <reference path="ListService.ts" />
/// <reference path="../typings/angularjs/angular-resource.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="app.models.ts" />
/// <reference path="dataSvc.ts" />
var App;
(function (App) {
    "use strict";

    var mainCtrl = (function () {
        function mainCtrl($scope, dataService, listService) {
            var _this = this;
            this.$scope = $scope;
            this.dataService = dataService;
            this.listService = listService;
            this.getFormDigest = function () {
                _this.listService.getFormDigest().then(function (value) {
                    _this.$scope.formDigestValue = value;
                }).catch(function (mesage) {
                    alert("failed request " + mesage);
                });
            };
            this.activate = function (userName) {
                _this.$scope.userName = userName;
                _this.$scope.$apply();
            };
            this.addFields = function (remainigLists) {
                if (typeof _this.$scope.listInfo == undefined) {
                    _this.listService.getLists().then(function (listInfo) {
                        _this.$scope.listInfo = listInfo;
                        _this.addFields(remainigLists);
                    });
                } else {
                    remainigLists.forEach(function (title, index) {
                        var id = Enumerable.From(_this.$scope.listInfo).Where(function (info) {
                            return info.Title === title;
                        }).Select(function (list) {
                            return list.Id;
                        }).SingleOrDefault(null);

                        if (id == null)
                            return;

                        console.log('adding field to list ' + id);

                        var fieldData = [];

                        if (title === App.Constants.LIST.category)
                            fieldData = App.Constants.FieldsConfig.Category;
                        else if (title === App.Constants.LIST.supplier)
                            fieldData = App.Constants.FieldsConfig.Supplier;
                        else if (title === App.Constants.LIST.product)
                            fieldData = App.Constants.FieldsConfig.Product;

                        _this.listService.addFields(id, fieldData).then(function (inserted) {
                            console.log('fields inserted');
                            if (index == remainigLists.length - 1) {
                                _this.loadExternalData();
                            }
                        }).catch(function (message) {
                            console.log(message);
                            alert(message);
                        });
                    });
                }
            };
            $scope.title = "Supply System with Angular";
            $scope.userName = '';
            $scope.review = false;
            $scope.addFields = this.addFields;

            this.displayUserName();
            this.createAppWebLists();
            this.createReview();
        }
        mainCtrl.prototype.displayUserName = function () {
            var _this = this;
            this.dataService.getUserName().then(function (username) {
                _this.$scope.userName = username;
            }).catch(function (message) {
                alert(message);
            });
        };

        mainCtrl.prototype.loadExternalData = function () {
            var _this = this;
            this.dataService.LoadExternal().then(function (data) {
                _this.dataService.addData(data).then(function (resp) {
                    console.log("data inserted");
                    _this.loadListData();
                });
            });
        };

        mainCtrl.prototype.loadListData = function () {
            var _this = this;
            this.dataService.getAll().then(function (listData) {
                console.log(listData);
                var products = [];
                listData.Products.forEach(function (item) {
                    var product = new App.Product(item.ProductID, item.ProductName, item.SupplierID, item.CategoryID);
                    product.resolve(listData.Categories, listData.Suppliers);
                    products.push(product);
                });

                _this.$scope.Products = products;
            });
        };

        mainCtrl.prototype.createAppWebLists = function () {
            var _this = this;
            var listNames = [
                App.Constants.LIST.category,
                App.Constants.LIST.supplier,
                App.Constants.LIST.product
            ];

            this.listService.getLists().then(function (listInfo) {
                _this.$scope.listInfo = listInfo;
                var titles = Enumerable.From(listInfo).Select(function (list) {
                    return list.Title;
                }).ToArray();
                _this.$scope.lists = titles.join(",");
                var remainig = Enumerable.From(listNames).Except(Enumerable.From(titles).Intersect(listNames)).ToArray();

                if (remainig.length > 0) {
                    _this.listService.createLists(remainig).then(function (data) {
                        console.log("Create lists " + remainig.join(", "));
                        _this.listService.getLists().then(function (listInfo) {
                            _this.$scope.listInfo = listInfo;
                            _this.addFields(remainig);
                        }).catch(function (message) {
                            alert("could not load lists " + message);
                        });
                    }).catch(function (message) {
                        alert("could not create lists " + message);
                    });
                } else {
                    console.log(listNames.join(", ") + " lists already exists");
                    _this.loadListData();
                }
            }).catch(function (message) {
                console.log(message);
                alert("couldn't recive list data " + message);
            });
        };

        mainCtrl.prototype.createReview = function () {
            var _this = this;
            this.listService.getHostList(App.Constants.LIST.review).then(function (isAvaialbe) {
                _this.$scope.review = isAvaialbe;
                if (!isAvaialbe) {
                    _this.listService.createHostList(App.Constants.LIST.review).then(function (id) {
                        console.log('Review List Created');
                        _this.$scope.review = true;
                        _this.addReviewFields(id);
                    }).catch(function (message) {
                        alert("could not create list review " + message);
                    });
                }
            });
        };

        mainCtrl.prototype.addReviewFields = function (id) {
            var fields = [
                {
                    displayName: App.Constants.FIELD.review.companyName,
                    name: App.Constants.FIELD.review.companyName,
                    type: SP.FieldType.text
                },
                {
                    displayName: App.Constants.FIELD.review.productName,
                    name: App.Constants.FIELD.review.productName,
                    type: SP.FieldType.text
                }
            ];

            this.listService.addFields(id, fields, true).then(function (success) {
                console.log("Review list fields added");
            }).catch(function (message) {
                console.log(message);
                alert("Review list fields adding fields");
            });
            ;
        };
        mainCtrl.$inject = ["$scope", "dataSvc", "ListService"];
        return mainCtrl;
    })();

    angular.module("app").controller("mainCtrl", mainCtrl);
})(App || (App = {}));

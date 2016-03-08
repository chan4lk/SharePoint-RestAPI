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
                        }).Single();

                        console.log('adding field to list ' + id);

                        var fieldData = [];

                        if (title === App.Constants.LIST.category) {
                            fieldData = [
                                {
                                    displayName: App.Constants.FIELD.category.id,
                                    name: App.Constants.FIELD.category.id,
                                    type: SP.FieldType.integer
                                },
                                {
                                    displayName: App.Constants.FIELD.category.name,
                                    name: App.Constants.FIELD.category.name,
                                    type: SP.FieldType.text
                                }];
                        } else if (title === App.Constants.LIST.supplier) {
                            fieldData = [
                                {
                                    displayName: App.Constants.FIELD.supplier.id,
                                    name: App.Constants.FIELD.supplier.id,
                                    type: SP.FieldType.integer
                                },
                                {
                                    displayName: App.Constants.FIELD.supplier.companyName,
                                    name: App.Constants.FIELD.supplier.companyName,
                                    type: SP.FieldType.text
                                }];
                        } else if (title === App.Constants.LIST.product) {
                            fieldData = [
                                {
                                    displayName: App.Constants.FIELD.product.id,
                                    name: App.Constants.FIELD.product.id,
                                    type: SP.FieldType.integer
                                },
                                {
                                    displayName: App.Constants.FIELD.product.name,
                                    name: App.Constants.FIELD.product.name,
                                    type: SP.FieldType.text
                                },
                                {
                                    displayName: App.Constants.FIELD.product.supplierId,
                                    name: App.Constants.FIELD.product.supplierId,
                                    type: SP.FieldType.integer
                                },
                                {
                                    displayName: App.Constants.FIELD.product.categoryId,
                                    name: App.Constants.FIELD.product.categoryId,
                                    type: SP.FieldType.integer
                                }
                            ];
                        }

                        _this.listService.addFields(id, fieldData).then(function (inserted) {
                            console.log(App.Constants.FIELD.category.id + ' field inserted');
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
                            alert("count not load lists " + message);
                        });
                    }).catch(function (message) {
                        alert("count not create lists " + message);
                    });
                } else {
                    console.log(listNames.join(", ") + "are already exists");
                }
            }).catch(function (message) {
                console.log(message);
                alert("couln't recive list data " + message);
            });
        };

        mainCtrl.prototype.createReview = function () {
            var _this = this;
            this.listService.getHostList(App.Constants.LIST.review).then(function (isAvaialbe) {
                _this.$scope.review = isAvaialbe;
                if (!isAvaialbe) {
                    _this.listService.createHostList(App.Constants.LIST.review).then(function (isCreated) {
                        console.log('Review List Created');
                        _this.$scope.review = isAvaialbe;
                    }).catch(function (message) {
                        alert("count not create lists " + message);
                    });
                }
            });
        };
        mainCtrl.$inject = ["$scope", "dataSvc", "ListService"];
        return mainCtrl;
    })();

    angular.module("app").controller("mainCtrl", mainCtrl);
})(App || (App = {}));

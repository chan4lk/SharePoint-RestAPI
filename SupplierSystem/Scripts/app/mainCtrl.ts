/// <reference path="Config.ts" />
/// <reference path="ListService.ts" />
/// <reference path="../typings/angularjs/angular-resource.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="app.models.ts" />
/// <reference path="dataSvc.ts" />

module App {
    "use strict";

    interface ImainCtrlScope extends ng.IScope {
        title: string;
        Products: Product[];
        userName: string;
        lists: string;
        review: boolean;
        search: any;
        formDigestValue: string;
        listInfo: IListInfo[];
        addFields: (remainigLists: string[]) => void;
        load();
        AddReview();
        clearSearch(sender, args);
    }

    interface ImainCtrl {
        activate: (userName: string) => void;
        loadExternalData();
    }

    class mainCtrl implements ImainCtrl {
        static $inject: string[] = ["$scope", "dataSvc", "ListService"];

        constructor(
            private $scope: ImainCtrlScope,
            private dataService: IDataService,
            private listService: IListService) {

            $scope.title = "Supply System with Angular";
            $scope.userName = '';
            $scope.review = false;
            $scope.addFields = this.addFields;
            $scope.AddReview = () => {
                this.addReview();
            }

            $scope.clearSearch = (sender, args) => {
                this.clearSearch();
            };

            this.displayUserName();
            this.createAppWebLists();
            this.createReview();
        }

        clearSearch() {
            for (var property in this.$scope.search) {
                this.$scope.search[property] = undefined;
            }
        }

        displayUserName() {
            this.dataService.getUserName().then((username) => {
                this.$scope.userName = username;
            }).catch((message) => {
                    alert(message);
                });
        }

        getFormDigest = () => {
            this.listService.getFormDigest()
                .then((value) => {
                    this.$scope.formDigestValue = value;
                })
                .catch((mesage) => {
                    alert("failed request " + mesage);
                });
        }

        activate = (userName: string) => {
            this.$scope.userName = userName;
            this.$scope.$apply();
        }

        loadExternalData() {
            this.dataService.LoadExternal().then((data) => {
                this.dataService.addData(data).then((resp) => {
                    console.log("data inserted");
                    this.loadListData();
                });
            });
        }

        loadListData() {
            this.dataService.getAll().then((listData) => {
                console.log('All the data loaded from odata');
                var products = [];
                listData.Products.forEach((item) => {
                    var product = new Product(item.ProductID, item.ProductName, item.SupplierID, item.CategoryID);
                    product.resolve(listData.Categories, listData.Suppliers);
                    products.push(product);
                });

                this.$scope.Products = products;
            });
        }

        createAppWebLists() {
            var listNames: string[] = [
                Constants.LIST.category,
                Constants.LIST.supplier,
                Constants.LIST.product
            ];

            this.listService.getLists().then((listInfo) => {
                this.$scope.listInfo = listInfo;
                var titles = Enumerable.From(listInfo).Select((list) => { return list.Title; }).ToArray();
                this.$scope.lists = titles.join(",");
                var remainig: string[] = Enumerable.From(listNames).Except(Enumerable
                    .From(titles)
                    .Intersect(listNames)).ToArray();

                if (remainig.length > 0) {
                    this.listService.createLists(remainig)
                        .then((data) => {
                            console.log("Create lists " + remainig.join(", "));
                            this.listService.getLists().then((listInfo) => {
                                this.$scope.listInfo = listInfo;
                                this.addFields(remainig);
                            }).catch((message) => {
                                    alert("could not load lists " + message);
                                });
                        })
                        .catch((message) => {
                            alert("could not create lists " + message);
                        });
                } else {
                    console.log(listNames.join(", ") + " lists already exists");
                    this.loadListData();
                }
            }).catch((message) => {
                    console.log(message);
                    alert("couldn't recive list data " + message);
                });
        }

        createReview() {
            this.listService.getHostList(Constants.LIST.review).then((isAvaialbe) => {
                this.$scope.review = isAvaialbe;
                if (!isAvaialbe) {
                    this.listService.createHostList(Constants.LIST.review).then((id) => {
                        console.log('Review List Created');
                        this.$scope.review = true;
                        this.addReviewFields(id);
                    }).catch((message) => {
                            alert("could not create list review " + message);
                        });
                }
            });
        }

        addReviewFields(id: string) {
            var fields: IFieldData[] = [
                {
                    displayName: Constants.FIELD.review.companyName,
                    name: Constants.FIELD.review.companyName,
                    type: SP.FieldType.text,
                },
                {
                    displayName: Constants.FIELD.review.productName,
                    name: Constants.FIELD.review.productName,
                    type: SP.FieldType.text,
                }
            ];

            this.listService.addFields(id, fields, true).then((success) => {
                console.log("Review list fields added");
            }).catch((message) => {
                    console.log(message);
                    alert("Review list fields adding fields");
                });;
        }

        addReview() {
            var selected: NodeList = document.querySelectorAll('input.review[type="checkbox"]:checked');
            var sucess = 0;
            for (var i = 0; i < selected.length; i++) {
                var item = <HTMLInputElement>selected.item(i);
                var productItem = Enumerable.From(this.$scope.Products)
                    .Where((product) => { return product.ProductID.toString() == item.value; })
                    .SingleOrDefault(null);

                var review: IReview = {
                    ProductName: productItem.ProductName,
                    SupplierName: productItem.CompanyName
                }

                this.dataService.addReview(review)
                    .then((response) => {
                        sucess++;
                        if (sucess === selected.length) alert("Review(s) Added");
                    })
                    .catch((error) => { console.error(error); });

                item.checked = false;
                item.removeAttribute("checked");
            }


        }

        addFields = (remainigLists: string[]) => {
            if (typeof this.$scope.listInfo == undefined) {
                this.listService.getLists().then((listInfo) => {
                    this.$scope.listInfo = listInfo;
                    this.addFields(remainigLists);
                })
            } else {
                var added = 0;
                remainigLists.forEach((title, index) => {

                    var id = Enumerable
                        .From(this.$scope.listInfo)
                        .Where((info) => { return info.Title === title })
                        .Select((list) => { return list.Id; })
                        .SingleOrDefault(null);

                    if (id == null) return;

                    console.log('adding field to list ' + id);

                    var fieldData: IFieldData[] = [];

                    if (title === Constants.LIST.category) fieldData = Constants.FieldsConfig.Category;
                    else if (title === Constants.LIST.supplier) fieldData = Constants.FieldsConfig.Supplier;
                    else if (title === Constants.LIST.product) fieldData = Constants.FieldsConfig.Product;

                    this.listService.addFields(
                        id, fieldData
                        ).then((inserted) => {
                            console.log('fields inserted');
                            added++;
                            if (added == remainigLists.length) {
                                this.loadExternalData();
                            }
                        }).catch((message) => {
                            console.log(message);
                            alert(message);
                        });
                });
            }
        }


    }

    angular.module("app").controller("mainCtrl", mainCtrl);
}
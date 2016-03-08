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
        products: IProduct[];
        categories: ICategory[];
        suppliers: ISupplier[];
        userName: string;
        lists: string;
        review: boolean;
        formDigestValue: string;
        listInfo: IListInfo[];
        addFields: (remainigLists: string[]) => void;
    }

    interface ImainCtrl {
        activate: (userName: string) => void;
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

            this.displayUserName();
            this.createAppWebLists();
            this.createReview();
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
                    this.dataService.LoadExternal().then((data) => {
                        console.log(data);
                    });
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


        addFields = (remainigLists: string[]) => {
            if (typeof this.$scope.listInfo == undefined) {
                this.listService.getLists().then((listInfo) => {
                    this.$scope.listInfo = listInfo;
                    this.addFields(remainigLists);
                })
            } else {
                remainigLists.forEach((title, index) => {

                    var id = Enumerable
                        .From(this.$scope.listInfo)
                        .Where((info) => { return info.Title === title })
                        .Select((list) => { return list.Id; })
                        .SingleOrDefault(null);

                    if (id == null) return;

                    console.log('adding field to list ' + id);

                    var fieldData: IFieldData[] = [];

                    if (title === Constants.LIST.category) {
                        fieldData = [
                            {
                                displayName: Constants.FIELD.category.id,
                                name: Constants.FIELD.category.id,
                                type: SP.FieldType.integer
                            },
                            {
                                displayName: Constants.FIELD.category.name,
                                name: Constants.FIELD.category.name,
                                type: SP.FieldType.text
                            }];
                    } else if (title === Constants.LIST.supplier) {
                        fieldData = [
                            {
                                displayName: Constants.FIELD.supplier.id,
                                name: Constants.FIELD.supplier.id,
                                type: SP.FieldType.integer
                            },
                            {
                                displayName: Constants.FIELD.supplier.companyName,
                                name: Constants.FIELD.supplier.companyName,
                                type: SP.FieldType.text
                            }];
                    } else if (title === Constants.LIST.product) {
                        fieldData = [
                            {
                                displayName: Constants.FIELD.product.id,
                                name: Constants.FIELD.product.id,
                                type: SP.FieldType.integer
                            },
                            {
                                displayName: Constants.FIELD.product.name,
                                name: Constants.FIELD.product.name,
                                type: SP.FieldType.text
                            },
                            {
                                displayName: Constants.FIELD.product.supplierId,
                                name: Constants.FIELD.product.supplierId,
                                type: SP.FieldType.integer
                            },
                            {
                                displayName: Constants.FIELD.product.categoryId,
                                name: Constants.FIELD.product.categoryId,
                                type: SP.FieldType.integer
                            },
                        ];
                    }

                    this.listService.addFields(
                        id, fieldData
                        ).then((inserted) => {
                            console.log('fields inserted');
                            this.dataService.LoadExternal().then((data) => {
                                console.log(data);
                            });
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
/// <reference path="../typings/caml/camljs.d.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="app.models.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
var App;
(function (App) {
    "use strict";

    var DataService = (function () {
        function DataService($http, $q, baseSvc) {
            this.$http = $http;
            this.$q = $q;
            this.baseSvc = baseSvc;
            this.context = SP.ClientContext.get_current();
        }
        DataService.prototype.getUserName = function () {
            var deffered = this.$q.defer();
            var name = '';
            var web = this.context.get_web();
            this.context.load(web.get_currentUser());
            this.context.executeQueryAsync(function (sender, args) {
                var name = web.get_currentUser().get_userId();
                deffered.resolve(name);
            }, function (sender, args) {
                deffered.reject(args.get_message());
            });

            return deffered.promise;
        };

        DataService.prototype.getProducts = function () {
            var deffered = this.$q.defer();
            return deffered.promise;
        };

        DataService.prototype.getCategories = function () {
            var deffered = this.$q.defer();

            return deffered.promise;
        };

        DataService.prototype.getSuppliers = function () {
            var deffered = this.$q.defer();

            return deffered.promise;
        };

        DataService.prototype.getAll = function () {
            var deffered = this.$q.defer();

            return deffered.promise;
        };

        DataService.prototype.LoadExternal = function () {
            var _this = this;
            var deffered = this.$q.defer();
            var urls = [
                App.Constants.URL.category,
                App.Constants.URL.supplier,
                App.Constants.URL.product
            ];

            this.baseSvc.proxyRequest(App.Constants.URL.supplier).then(function (supplierData) {
                _this.baseSvc.proxyRequest(App.Constants.URL.category).then(function (categoryData) {
                    _this.baseSvc.proxyRequest(App.Constants.URL.product).then(function (productData) {
                        var data = {
                            Products: productData,
                            Categories: categoryData,
                            Suppliers: supplierData
                        };

                        deffered.resolve(data);
                    }).catch(onError);
                }).catch(onError);
            }).catch(onError);

            var onError = function (message) {
                deffered.reject(message);
            };

            return deffered.promise;
        };

        DataService.prototype.addData = function (data) {
            var _this = this;
            var deffered = this.$q.defer();
            var productURL = App.Constants.URL.appweb + "/_api/lists/getbytitle('" + App.Constants.LIST.product + "')/items";
            var categoryURL = App.Constants.URL.appweb + "/_api/lists/getbytitle('" + App.Constants.LIST.category + "')/items";
            var supplierURL = App.Constants.URL.appweb + "/_api/lists/getbytitle('" + App.Constants.LIST.supplier + "')/items";

            var productPromise = this.$q.when(false);
            var categoryPromise = this.$q.when(false);
            var suppierPromise = this.$q.when(false);

            data.Products.forEach(function (product) {
                var data = {
                    '__metadata': { 'type': 'SP.Data.ProductListItem' },
                    'ProductID': product.ProductID,
                    'ProductName': product.ProductName,
                    'CategoryID': product.CategoryID,
                    'SupplierID': product.SupplierID
                };

                productPromise = productPromise.then(function (result) {
                    return _this.addItem(data, productURL);
                });
            });

            data.Categories.forEach(function (category) {
                var data = {
                    '__metadata': { 'type': 'SP.Data.CategoryListItem' },
                    'CategoryID': category.ID,
                    'CategoryName': category.Name
                };

                categoryPromise = categoryPromise.then(function (result) {
                    return _this.addItem(data, categoryURL);
                });
            });

            data.Suppliers.forEach(function (supplier) {
                var data = {
                    '__metadata': { 'type': 'SP.Data.SupplierListItem' },
                    'SupplierID': supplier.ID,
                    'CompanyName': supplier.CompanyName
                };

                suppierPromise = suppierPromise.then(function (result) {
                    return _this.addItem(data, supplierURL);
                });
            });

            this.$q.all([productPromise, categoryPromise, suppierPromise]).then(function (oks) {
                deffered.resolve(true);
            }).catch(function (error) {
                deffered.reject(false);
            });

            return deffered.promise;
        };

        DataService.prototype.addItem = function (data, url) {
            var deffered = this.$q.defer();

            this.baseSvc.postRequest(url, data).then(function (resp) {
                deffered.resolve(resp);
            }).catch(function (message) {
                deffered.reject(message);
            });

            return deffered.promise;
        };

        DataService.prototype.loadData = function () {
            var deffered = this.$q.defer();

            return deffered.promise;
        };

        DataService.prototype.addReview = function (review) {
            var deffered = this.$q.defer();

            return deffered.promise;
        };
        DataService.$inject = ["$http", "$q", "baseService"];
        return DataService;
    })();

    angular.module("app").service("dataSvc", DataService);
})(App || (App = {}));

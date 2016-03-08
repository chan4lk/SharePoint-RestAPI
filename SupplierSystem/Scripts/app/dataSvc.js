/// <reference path="../typings/caml/camljs.d.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="app.models.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
var App;
(function (App) {
    "use strict";

    var DataService = (function () {
        function DataService($http, $q) {
            this.$http = $http;
            this.$q = $q;
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
            var products = new Array();
            var lists = this.context.get_web().get_lists();
            var list = lists.getByTitle(App.Constants.LIST.product);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);
            var items = list.getItems(query);
            this.context.load(items, App.Utils.Include([
                App.Constants.FIELD.product.id,
                App.Constants.FIELD.product.name,
                App.Constants.FIELD.product.categoryId,
                App.Constants.FIELD.product.supplierId
            ]));

            this.context.executeQueryAsync(function (sender, args) {
                var count = items.get_count();
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values = item.get_fieldValues();
                    products.push(App.Product.From(values));
                }

                deffered.resolve(products);
            }, function (sender, args) {
                deffered.reject(args.get_message());
            });

            return deffered.promise;
        };

        DataService.prototype.getCategories = function () {
            var categories = [];
            var deffered = this.$q.defer();
            var lists = this.context.get_web().get_lists();
            var list = lists.getByTitle(App.Constants.LIST.category);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);
            var items = list.getItems(query);
            this.context.load(items, App.Utils.Include([
                App.Constants.FIELD.category.id,
                App.Constants.FIELD.category.name
            ]));

            this.context.executeQueryAsync(function (sender, args) {
                var count = items.get_count();
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values = item.get_fieldValues();
                    categories.push(App.Category.From(values));
                }

                deffered.resolve(categories);
            }, function (sender, args) {
                deffered.reject(args.get_message());
            });

            return deffered.promise;
        };

        DataService.prototype.getSuppliers = function () {
            var suppliers = [];
            var deffered = this.$q.defer();
            var lists = this.context.get_web().get_lists();
            var list = lists.getByTitle(App.Constants.LIST.supplier);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);
            var items = list.getItems(query);
            this.context.load(items, App.Utils.Include([
                App.Constants.FIELD.supplier.id,
                App.Constants.FIELD.supplier.companyName
            ]));

            this.context.executeQueryAsync(function (sender, args) {
                var count = items.get_count();
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values = item.get_fieldValues();
                    suppliers.push(App.Supplier.From(values));
                }

                deffered.resolve(suppliers);
            }, function (sender, args) {
                deffered.reject(args.get_message());
            });

            return deffered.promise;
        };

        DataService.prototype.getAll = function () {
            var deffered = this.$q.defer();

            var products = new Array();
            var categories = new Array();
            var suppliers = new Array();

            var lists = this.context.get_web().get_lists();

            var productList = lists.getByTitle(App.Constants.LIST.product);
            var categoryList = lists.getByTitle(App.Constants.LIST.category);
            var supplierList = lists.getByTitle(App.Constants.LIST.supplier);

            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);

            var productitems = productList.getItems(query);
            this.context.load(productitems, App.Utils.Include([
                App.Constants.FIELD.product.id,
                App.Constants.FIELD.product.name,
                App.Constants.FIELD.product.categoryId,
                App.Constants.FIELD.product.supplierId
            ]));

            var supplierItems = supplierList.getItems(query);
            this.context.load(supplierItems, App.Utils.Include([
                App.Constants.FIELD.supplier.id,
                App.Constants.FIELD.supplier.companyName
            ]));

            var categoryItems = categoryList.getItems(query);
            this.context.load(categoryItems, App.Utils.Include([
                App.Constants.FIELD.category.id,
                App.Constants.FIELD.category.name
            ]));

            this.context.executeQueryAsync(function (sender, args) {
                var count = productitems.get_count();
                for (var i = 0; i < count; i++) {
                    var item = productitems.itemAt(i);
                    var values = item.get_fieldValues();
                    products.push(App.Product.From(values));
                }

                count = categoryItems.get_count();
                for (var i = 0; i < count; i++) {
                    var item = productitems.itemAt(i);
                    var values = item.get_fieldValues();
                    products.push(App.Product.From(values));
                }

                deffered.resolve(products);
            }, function (sender, args) {
                deffered.reject(args.get_message());
            });

            return deffered.promise;
        };

        DataService.prototype.LoadExternal = function () {
            var _this = this;
            var deffered = this.$q.defer();
            var promises = this.$q.when(false);
            var urls = [
                App.Constants.URL.category,
                App.Constants.URL.supplier,
                App.Constants.URL.product
            ];

            this.loadOData(App.Constants.URL.supplier).then(function (supplierData) {
                _this.loadOData(App.Constants.URL.category).then(function (categoryData) {
                    _this.loadOData(App.Constants.URL.product).then(function (productData) {
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

        DataService.prototype.loadOData = function (url) {
            var deffered = this.$q.defer();

            this.$http({
                url: "../_api/SP.WebProxy.invoke",
                method: App.Constants.HTTP.POST,
                data: JSON.stringify({
                    "requestInfo": {
                        "__metadata": { "type": "SP.WebRequestInfo" },
                        "Url": url,
                        "Method": "GET",
                        "Headers": {
                            "results": [{
                                    "__metadata": { "type": "SP.KeyValue" },
                                    "Key": "Accept",
                                    "Value": "application/json;odata=verbose",
                                    "ValueType": "Edm.String"
                                }]
                        }
                    }
                }),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": App.Constants.FormDigest
                }
            }).then(function (data) {
                deffered.resolve(data);
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
        DataService.$inject = ["$http", "$q"];
        return DataService;
    })();

    angular.module("app").service("dataSvc", DataService);
})(App || (App = {}));

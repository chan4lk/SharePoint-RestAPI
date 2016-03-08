/// <reference path="../typings/caml/camljs.d.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="app.models.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />

module App {
    "use strict";       

    export interface IDataService {
        getProducts: () => ng.IPromise<IProduct[]>;
        getCategories: () => ng.IPromise<ICategory[]>;
        getSuppliers: () => ng.IPromise<ISupplier[]>;
        getUserName: () => ng.IPromise<string>;
        addData(): ng.IPromise<boolean>;
        loadData(): ng.IPromise<IListData>;
        addReview(review: IReview): ng.IPromise<boolean>;
    }

    class DataService implements IDataService {
        static $inject: string[] = ["$http", "$q"];
        context: SP.ClientContext;
        productItems: SP.ListItemCollection;
        categoryItems: SP.ListItemCollection;
        SupplierItems: SP.ListItemCollection;

        constructor(
            private $http: ng.IHttpService,
            private $q: ng.IQService) {
            this.context = SP.ClientContext.get_current();
        }

        getUserName(): ng.IPromise<string> {
            var deffered = this.$q.defer();
            var name = '';
            var web = this.context.get_web();
            this.context.load(web.get_currentUser());
            this.context.executeQueryAsync((sender: any, args: SP.ClientRequestSucceededEventArgs) => {
                var name = web.get_currentUser().get_userId();
                deffered.resolve(name);
            }, (sender, args) => {
                deffered.reject(args.get_message());
            });

            return deffered.promise;

        }

        getProducts() : ng.IPromise<IProduct[]> {
            var deffered = this.$q.defer();
            var products: IProduct[] = new Array();
            var lists = this.context.get_web().get_lists();
            var list = lists.getByTitle(Constants.LIST.product);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);
            var items = list.getItems(query);
            this.context.load(items, Utils.Include([
                Constants.FIELD.product.id,
                Constants.FIELD.product.name,
                Constants.FIELD.product.categoryId,
                Constants.FIELD.product.supplierId,
            ])); 

            this.context.executeQueryAsync((sender, args) => {
                var count = items.get_count();
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values: IProduct = item.get_fieldValues();
                    products.push(Product.From(values));
                }

                deffered.resolve(products);

            }, (sender, args) => {
                deffered.reject(args.get_message());
            });
        
            return deffered.promise;
        }

        getCategories(): ng.IPromise<ICategory[]> {
            var categories: ICategory[] = [];
            var deffered = this.$q.defer();
            var lists = this.context.get_web().get_lists();
            var list = lists.getByTitle(Constants.LIST.category);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);
            var items = list.getItems(query);
            this.context.load(items, Utils.Include([
                Constants.FIELD.category.id,
                Constants.FIELD.category.name,
            ]));

            this.context.executeQueryAsync((sender, args) => {
                var count = items.get_count();
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values: ICategory = item.get_fieldValues();
                    categories.push(Category.From(values));
                }

                deffered.resolve(categories);

            }, (sender, args) => {
                    deffered.reject(args.get_message());
                });

            return deffered.promise;
        }

        getSuppliers(): ng.IPromise<ISupplier[]> {
            var suppliers: ISupplier[] = [];
            var deffered = this.$q.defer();
            var lists = this.context.get_web().get_lists();
            var list = lists.getByTitle(Constants.LIST.supplier);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);
            var items = list.getItems(query);
            this.context.load(items, Utils.Include([
                Constants.FIELD.supplier.id,
                Constants.FIELD.supplier.companyName,
            ]));

            this.context.executeQueryAsync((sender, args) => {
                var count = items.get_count();
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values: ISupplier = item.get_fieldValues();
                    suppliers.push(Supplier.From(values));
                }

                deffered.resolve(suppliers);

            }, (sender, args) => {
                    deffered.reject(args.get_message());
                });

            return deffered.promise;
        }

        getAll(): ng.IPromise<IListData> {
            var deffered = this.$q.defer();

            var products: IProduct[] = new Array();
            var categories: IProduct[] = new Array();
            var suppliers: IProduct[] = new Array();

            var lists = this.context.get_web().get_lists();

            var productList = lists.getByTitle(Constants.LIST.product);
            var categoryList = lists.getByTitle(Constants.LIST.category);
            var supplierList = lists.getByTitle(Constants.LIST.supplier);

            var query = new SP.CamlQuery();
            var xml = new CamlBuilder().View().ToString();
            query.set_viewXml(xml);

            var productitems = productList.getItems(query);
            this.context.load(productitems, Utils.Include([
                Constants.FIELD.product.id,
                Constants.FIELD.product.name,
                Constants.FIELD.product.categoryId,
                Constants.FIELD.product.supplierId,
            ]));

            var supplierItems = supplierList.getItems(query);
            this.context.load(supplierItems, Utils.Include([
                Constants.FIELD.supplier.id,
                Constants.FIELD.supplier.companyName,
            ]));

            var categoryItems = categoryList.getItems(query);
            this.context.load(categoryItems, Utils.Include([
                Constants.FIELD.category.id,
                Constants.FIELD.category.name,
            ]));

            this.context.executeQueryAsync((sender, args) => {
                var count = productitems.get_count();
                for (var i = 0; i < count; i++) {
                    var item = productitems.itemAt(i);
                    var values: IProduct = item.get_fieldValues();
                    products.push(Product.From(values));
                }

                count = categoryItems.get_count();
                for (var i = 0; i < count; i++) {
                    var item = productitems.itemAt(i);
                    var values: IProduct = item.get_fieldValues();
                    products.push(Product.From(values));
                }

                deffered.resolve(products);

            }, (sender, args) => {
                    deffered.reject(args.get_message());
                });

            return deffered.promise;
        }

        addData(): ng.IPromise<boolean> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }

        loadData() : ng.IPromise<IListData> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }

        addReview(review: IReview): ng.IPromise<boolean> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }
    }

    angular.module("app").service("dataSvc", DataService);
}
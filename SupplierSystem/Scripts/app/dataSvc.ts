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
        LoadExternal(): ng.IPromise<IListData>
        loadData(): ng.IPromise<IListData>;
        addReview(review: IReview): ng.IPromise<boolean>;
        addData(data: IListData): ng.IPromise<boolean>;
    }

    class DataService implements IDataService {
        static $inject: string[] = ["$http", "$q", "baseService"];
        context: SP.ClientContext;
        productItems: SP.ListItemCollection;
        categoryItems: SP.ListItemCollection;
        SupplierItems: SP.ListItemCollection;

        constructor(
            private $http: ng.IHttpService,
            private $q: ng.IQService,
            private baseSvc: IbaseService) {
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

        getProducts(): ng.IPromise<IProduct[]> {
            var deffered = this.$q.defer();
            return deffered.promise;
        }

        getCategories(): ng.IPromise<ICategory[]> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }

        getSuppliers(): ng.IPromise<ISupplier[]> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }

        getAll(): ng.IPromise<IListData> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }

        LoadExternal(): ng.IPromise<IListData> {
            var deffered = this.$q.defer();
            var urls = [
                Constants.URL.category,
                Constants.URL.supplier,
                Constants.URL.product
            ];

            this.baseSvc.proxyRequest<ISupplier[]>(Constants.URL.supplier).then((supplierData) => {
                this.baseSvc.proxyRequest<ICategory[]>(Constants.URL.category).then((categoryData) => {
                    this.baseSvc.proxyRequest<IProduct[]>(Constants.URL.product).then((productData) => {
                        var data: IListData =
                            {
                                Products: productData,
                                Categories: categoryData,
                                Suppliers: supplierData
                            };

                        deffered.resolve(data);
                    }).catch(onError);
                }).catch(onError);
            }).catch(onError);

            var onError = (message) => {
                deffered.reject(message);
            }

            return deffered.promise;
        }

        addData(data: IListData): ng.IPromise<boolean> {
            var deffered = this.$q.defer();
            var productURL = Constants.URL.appweb + "/_api/lists/getbytitle('" + Constants.LIST.product + "')/items";
            var categoryURL = Constants.URL.appweb + "/_api/lists/getbytitle('" + Constants.LIST.category + "')/items";
            var supplierURL = Constants.URL.appweb + "/_api/lists/getbytitle('" + Constants.LIST.supplier + "')/items";

            var productPromise = this.$q.when(false);
            var categoryPromise = this.$q.when(false);
            var suppierPromise = this.$q.when(false);
            
            data.Products.forEach((product) => {

                var data = {
                    '__metadata': { 'type': 'SP.Data.ProductListItem' },
                    'ProductID': product.ProductID,
                    'ProductName': product.ProductName,
                    'CategoryID': product.CategoryID,
                    'SupplierID': product.SupplierID
                }

                productPromise = productPromise.then((result) => { return this.addItem(data, productURL); });

            });

            data.Categories.forEach((category) => {

                var data = {
                    '__metadata': { 'type': 'SP.Data.CategoryListItem' },
                    'CategoryID': category.ID,
                    'CategoryName': category.Name
                }

                categoryPromise = categoryPromise.then((result) => { return this.addItem(data, categoryURL); });

            });

            data.Suppliers.forEach((supplier) => {

                var data = {
                    '__metadata': { 'type': 'SP.Data.SupplierListItem' },
                    'SupplierID': supplier.ID,
                    'CompanyName': supplier.CompanyName
                }

                suppierPromise = suppierPromise.then((result) => { return this.addItem(data, supplierURL); });

            });

            this.$q.all([productPromise, categoryPromise, suppierPromise]).then((oks) => {
                deffered.resolve(true);
            }).catch((error) => {
                deffered.reject(false);
            });

            return deffered.promise;
        }

        addItem(data: any, url: string): ng.IPromise<boolean> {
            var deffered = this.$q.defer();

            this.baseSvc.postRequest<any, any>(url, data)
                .then((resp) => {
                    deffered.resolve(resp);
                })
                .catch((message) => {
                    deffered.reject(message);
                });

            return deffered.promise;
        }

        loadData(): ng.IPromise<IListData> {
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
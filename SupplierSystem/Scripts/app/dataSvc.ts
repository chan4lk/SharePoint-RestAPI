/// <reference path="executorService.ts" />
/// <reference path="baseService.ts" />
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
        getAll(): ng.IPromise<IListData>;
        LoadExternal(): ng.IPromise<IListData>
        loadData(): ng.IPromise<IListData>;
        addReview(review: IReview): ng.IPromise<boolean>;
        addData(data: IListData): ng.IPromise<boolean>;
    }

    class DataService implements IDataService {
        static $inject: string[] = ["$http", "$q", "baseService", "executorService"];
        context: SP.ClientContext;
        productItems: SP.ListItemCollection;
        categoryItems: SP.ListItemCollection;
        SupplierItems: SP.ListItemCollection;
        productURL: string;
        categoryURL: string;
        supplierURL: string;
        reviewURL: string;
        constructor(
            private $http: ng.IHttpService,
            private $q: ng.IQService,
            private baseSvc: IbaseService,
            private execSvc: IExecutorService) {

            this.context = SP.ClientContext.get_current();
            this.productURL = Constants.URL.appweb
            + "/_api/lists/getbytitle('"
            + Constants.LIST.product
            + "')/items?$select=ProductID,CategoryID,SupplierID,ProductName";

            this.categoryURL = Constants.URL.appweb
            + "/_api/lists/getbytitle('"
            + Constants.LIST.category
            + "')/items?$select=CategoryID,CategoryName";

            this.supplierURL = Constants.URL.appweb
            + "/_api/lists/getbytitle('"
            + Constants.LIST.supplier
            + "')/items?$select=SupplierID,CompanyName";

            this.reviewURL = Constants.URL.appweb
            + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('"
            + Constants.LIST.review
            + "')/items?@target='"
            + Constants.URL.hostWeb
            + "'";

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
            return this.getItems<IProduct[]>(this.productURL);
        }

        getCategories(): ng.IPromise<ICategory[]> {
            return this.getItems<ICategory[]>(this.categoryURL);
        }

        getSuppliers(): ng.IPromise<ISupplier[]> {
            return this.getItems<ISupplier[]>(this.supplierURL);
        }

        getAll(): ng.IPromise<IListData> {
            var deffered = this.$q.defer();

            this.$q.all([this.getProducts(), this.getCategories(), this.getSuppliers()])
                .then((resp) => {
                    var data: IListData = {
                        Products: resp[0],
                        Categories: resp[1],
                        Suppliers: resp[2]
                    }

                    deffered.resolve(data);
                }).catch((error) => {
                    deffered.reject(error);
                });;

            return deffered.promise;
        }

        getItems<T>(url: string): ng.IPromise<T> {
            var deffered = this.$q.defer();
            this.baseSvc.getRequest<any>(url)
                .then((resp) => {
                    deffered.resolve(resp.data.d.results);
                }).catch((error) => {
                    deffered.reject(error);
                });

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

                productPromise = productPromise
                    .then((result) => {
                        return this.addItem(data, this.productURL);
                    });

            });

            data.Categories.forEach((category) => {

                var data = {
                    '__metadata': { 'type': 'SP.Data.CategoryListItem' },
                    'CategoryID': category.CategoryID,
                    'CategoryName': category.CategoryName
                }

                categoryPromise = categoryPromise
                    .then((result) => {
                        return this.addItem(data, this.categoryURL);
                    });

            });

            data.Suppliers.forEach((supplier) => {

                var data = {
                    '__metadata': { 'type': 'SP.Data.SupplierListItem' },
                    'SupplierID': supplier.SupplierID,
                    'CompanyName': supplier.CompanyName
                }

                suppierPromise = suppierPromise
                    .then((result) => {
                        return this.addItem(data, this.supplierURL);
                    });

            });

            this.$q.all([productPromise, categoryPromise, suppierPromise])
                .then((oks) => {
                    deffered.resolve(true);
                }).catch((error) => {
                    deffered.reject(false);
                });

            return deffered.promise;
        }

        addItem(data: any, url: string): ng.IPromise<boolean> {
            return this.baseSvc.postRequest<any, any>(url, data);
        }

        loadData(): ng.IPromise<IListData> {
            var deffered = this.$q.defer();

            return deffered.promise;
        }

        addReview(review: IReview): ng.IPromise<boolean> {
            var data = {
                '__metadata': { 'type': 'SP.Data.ReviewListItem' },
                'ProductName': review.ProductName,
                'CompanyName': review.SupplierName
            }

            return this.execSvc.postRequest(this.reviewURL, data);
        }
    }

    angular.module("app").service("dataSvc", DataService);
}
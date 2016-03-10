///#source 1 1 /Scripts/app/app.module.js
/// <reference path="../typings/angularjs/angular.d.ts" />
// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
var App;
(function (App) {
    "use strict";

    // Create the module and define its dependencies.
    angular.module("app", []);
})(App || (App = {}));

///#source 1 1 /Scripts/app/Utils.js
var App;
(function (App) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.Include = function (items) {
            return "Include(" + items.join(",") + ")";
        };

        Utils.getQueryStringParameter = function (name, url) {
            if (!url)
                url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
            if (!results)
                return null;
            if (!results[2])
                return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };
        return Utils;
    })();
    App.Utils = Utils;
})(App || (App = {}));

///#source 1 1 /Scripts/app/Config.js
// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
var App;
(function (App) {
    "use strict";

    var Constants = (function () {
        function Constants() {
        }
        Object.defineProperty(Constants, "URL", {
            get: function () {
                return {
                    product: "http://services.odata.org/V4/Northwind/Northwind.svc/Products",
                    category: "http://services.odata.org/V4/Northwind/Northwind.svc/Categories",
                    supplier: "http://services.odata.org/V4/Northwind/Northwind.svc/Suppliers",
                    appweb: decodeURIComponent(App.Utils.getQueryStringParameter("SPAppWebUrl")),
                    hostWeb: decodeURIComponent(App.Utils.getQueryStringParameter("SPHostUrl"))
                };
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Constants, "STATUS", {
            get: function () {
                return {
                    OK: 200
                };
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Constants, "FormDigest", {
            get: function () {
                return document.getElementById('__REQUESTDIGEST').value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Constants, "FIELD", {
            get: function () {
                return {
                    supplier: {
                        id: "SupplierID",
                        companyName: "CompanyName"
                    },
                    product: {
                        id: "ProductID",
                        name: "ProductName",
                        supplierId: "SupplierID",
                        categoryId: "CategoryID"
                    },
                    category: {
                        id: "CategoryID",
                        name: "CategoryName"
                    },
                    review: {
                        companyName: "CompanyName",
                        productName: "ProductName"
                    }
                };
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Constants, "LIST", {
            get: function () {
                return {
                    product: 'Product',
                    category: 'Category',
                    supplier: 'Supplier',
                    review: 'Review'
                };
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Constants, "HTTP", {
            get: function () {
                var methods = {
                    GET: 'GET',
                    POST: 'POST',
                    PATCH: 'PATCH',
                    PUT: 'PUT',
                    DELETE: 'DELETE',
                    MERGE: 'MERGE'
                };

                return methods;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Constants, "FieldsConfig", {
            get: function () {
                var category = [
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

                var supplier = [
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

                var product = [
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
                    }
                ];

                return {
                    Product: product,
                    Category: category,
                    Supplier: supplier
                };
            },
            enumerable: true,
            configurable: true
        });
        return Constants;
    })();
    App.Constants = Constants;

    angular.module("app");
})(App || (App = {}));

///#source 1 1 /Scripts/app/app.models.js
var App;
(function (App) {
    var Supplier = (function () {
        function Supplier(id, companyName) {
            this.SupplierID = id;
            this.CompanyName = companyName;
        }
        Supplier.From = function (supplier) {
            return new Supplier(supplier.SupplierID, supplier.CompanyName);
        };
        return Supplier;
    })();
    App.Supplier = Supplier;

    var Category = (function () {
        function Category(id, name) {
            this.CategoryID = id;
            this.CategoryName = name;
        }
        Category.From = function (category) {
            return new Category(category.CategoryID, category.CategoryName);
        };
        return Category;
    })();
    App.Category = Category;

    var Product = (function () {
        function Product(id, productName, supplierId, categoryId) {
            this.ProductID = id;
            this.ProductName = productName;
            this.CategoryID = categoryId;
            this.SupplierID = supplierId;
        }
        Product.From = function (product) {
            return new Product(product.ProductID, product.ProductName, product.SupplierID, product.CategoryID);
        };

        Product.prototype.setCategory = function (categories) {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].CategoryID === this.CategoryID) {
                    this.Category = categories[i];
                    break;
                }
            }

            this.CategoryName = this.Category.CategoryName;
        };

        Product.prototype.setSupplier = function (suppliers) {
            for (var i = 0; i < suppliers.length; i++) {
                if (suppliers[i].SupplierID === this.SupplierID) {
                    this.Supplier = suppliers[i];
                    break;
                }
            }

            this.CompanyName = this.Supplier.CompanyName;
        };

        Product.prototype.resolve = function (categoris, suppliers) {
            this.setCategory(categoris);
            this.setSupplier(suppliers);
        };
        return Product;
    })();
    App.Product = Product;

    var ListData = (function () {
        function ListData(products, categories, suppliers) {
            this.Categories = categories;
            this.Suppliers = suppliers;
            this.Products = products;
        }
        return ListData;
    })();
    App.ListData = ListData;

    var Review = (function () {
        function Review(productName, supplierName) {
            this.ProductName = productName;
            this.SupplierName = supplierName;
        }
        return Review;
    })();
    App.Review = Review;
})(App || (App = {}));

///#source 1 1 /Scripts/app/baseService.js
var App;
(function (App) {
    "use strict";

    baseService.$inject = ["$http", "$q"];

    function baseService($http, $q) {
        var service = {
            getRequest: getData,
            postRequest: postData,
            mergeRequest: mergeData,
            deleteRequest: deleteData,
            proxyRequest: loadOData
        };

        function getData(url) {
            var deffer = $q.defer();
            $http({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                method: App.Constants.HTTP.GET
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        }

        function postData(url, data) {
            var deffer = $q.defer();
            $http({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest
                },
                method: App.Constants.HTTP.POST,
                data: data
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        }

        function mergeData(url, data) {
            var deffer = $q.defer();
            $http({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.MERGE,
                    'IF-Match': '*'
                },
                method: App.Constants.HTTP.POST,
                data: data
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        }

        function deleteData(url) {
            var deffer = $q.defer();
            $http({
                url: url,
                headers: {
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.DELETE
                },
                method: App.Constants.HTTP.POST
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        }

        function loadOData(url) {
            var deffered = $q.defer();

            $http({
                url: "../_api/SP.WebProxy.invoke",
                method: App.Constants.HTTP.POST,
                data: JSON.stringify({
                    "requestInfo": {
                        "__metadata": { "type": "SP.WebRequestInfo" },
                        "Url": url,
                        "Method": App.Constants.HTTP.GET,
                        "Headers": {
                            "results": [{
                                    "__metadata": { "type": "SP.KeyValue" },
                                    "Key": "Content-Type",
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
            }).then(function (resp) {
                var statusCode = resp.data.d.Invoke.StatusCode;

                if (statusCode == App.Constants.STATUS.OK) {
                    var values = JSON.parse(resp.data.d.Invoke.Body).value;
                    deffered.resolve(values);
                } else {
                    deffered.reject(statusCode);
                }
            }).catch(function (message) {
                deffered.reject(message);
            });

            return deffered.promise;
        }

        return service;
    }

    angular.module("app").factory("baseService", baseService);
})(App || (App = {}));

///#source 1 1 /Scripts/app/executorService.js
// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
var App;
(function (App) {
    "use strict";

    executorService.$inject = ["$q"];

    function executorService($q) {
        var service = {
            getRequest: getData,
            postRequest: postData,
            mergeRequest: mergeData,
            deleteRequest: deleteData,
            proxyRequest: loadOData
        };

        function getData(url) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                method: App.Constants.HTTP.GET,
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(response);
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function postData(url, data) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest
                },
                method: App.Constants.HTTP.POST,
                body: JSON.stringify(data),
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(JSON.parse(response.body));
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function mergeData(url, data) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.MERGE,
                    'IF-Match': '*'
                },
                method: App.Constants.HTTP.POST,
                body: JSON.stringify(data),
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(JSON.parse(response.body));
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function deleteData(url) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            this.executor.executeAsync({
                url: url,
                headers: {
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.DELETE
                },
                method: App.Constants.HTTP.POST,
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(response);
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function loadOData(url) {
            var deffered = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);
            executor.executeAsync({
                url: "../_api/SP.WebProxy.invoke",
                method: App.Constants.HTTP.POST,
                body: JSON.stringify({
                    "requestInfo": {
                        "__metadata": { "type": "SP.WebRequestInfo" },
                        "Url": url,
                        "Method": App.Constants.HTTP.GET,
                        "Headers": {
                            "results": [{
                                    "__metadata": { "type": "SP.KeyValue" },
                                    "Key": "Content-Type",
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
                },
                Uint8Array: [],
                success: (function (resp) {
                    var statusCode = resp.data.d.Invoke.StatusCode;

                    if (statusCode == App.Constants.STATUS.OK) {
                        var values = JSON.parse(resp.data.d.Invoke.Body).value;
                        deffered.resolve(values);
                    } else {
                        deffered.reject(statusCode);
                    }
                }),
                error: (function (message) {
                    deffered.reject(message);
                })
            });

            return deffered.promise;
        }

        return service;
    }

    angular.module("app").factory("executorService", executorService);
})(App || (App = {}));

///#source 1 1 /Scripts/app/dataSvc.js
/// <reference path="executorService.ts" />
/// <reference path="baseService.ts" />
/// <reference path="../typings/caml/camljs.d.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="app.models.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
var App;
(function (App) {
    "use strict";

    var DataService = (function () {
        function DataService($http, $q, baseSvc, execSvc) {
            this.$http = $http;
            this.$q = $q;
            this.baseSvc = baseSvc;
            this.execSvc = execSvc;
            this.context = SP.ClientContext.get_current();
            this.productURL = App.Constants.URL.appweb + "/_api/lists/getbytitle('" + App.Constants.LIST.product + "')/items?$select=ProductID,CategoryID,SupplierID,ProductName";

            this.categoryURL = App.Constants.URL.appweb + "/_api/lists/getbytitle('" + App.Constants.LIST.category + "')/items?$select=CategoryID,CategoryName";

            this.supplierURL = App.Constants.URL.appweb + "/_api/lists/getbytitle('" + App.Constants.LIST.supplier + "')/items?$select=SupplierID,CompanyName";

            this.reviewURL = App.Constants.URL.appweb + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('" + App.Constants.LIST.review + "')/items?@target='" + App.Constants.URL.hostWeb + "'";
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
            return this.getItems(this.productURL);
        };

        DataService.prototype.getCategories = function () {
            return this.getItems(this.categoryURL);
        };

        DataService.prototype.getSuppliers = function () {
            return this.getItems(this.supplierURL);
        };

        DataService.prototype.getAll = function () {
            var deffered = this.$q.defer();

            this.$q.all([this.getProducts(), this.getCategories(), this.getSuppliers()]).then(function (resp) {
                var data = {
                    Products: resp[0],
                    Categories: resp[1],
                    Suppliers: resp[2]
                };

                deffered.resolve(data);
            }).catch(function (error) {
                deffered.reject(error);
            });
            ;

            return deffered.promise;
        };

        DataService.prototype.getItems = function (url) {
            var deffered = this.$q.defer();
            this.baseSvc.getRequest(url).then(function (resp) {
                deffered.resolve(resp.data.d.results);
            }).catch(function (error) {
                deffered.reject(error);
            });

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
                    return _this.addItem(data, _this.productURL);
                });
            });

            data.Categories.forEach(function (category) {
                var data = {
                    '__metadata': { 'type': 'SP.Data.CategoryListItem' },
                    'CategoryID': category.CategoryID,
                    'CategoryName': category.CategoryName
                };

                categoryPromise = categoryPromise.then(function (result) {
                    return _this.addItem(data, _this.categoryURL);
                });
            });

            data.Suppliers.forEach(function (supplier) {
                var data = {
                    '__metadata': { 'type': 'SP.Data.SupplierListItem' },
                    'SupplierID': supplier.SupplierID,
                    'CompanyName': supplier.CompanyName
                };

                suppierPromise = suppierPromise.then(function (result) {
                    return _this.addItem(data, _this.supplierURL);
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
            return this.baseSvc.postRequest(url, data);
        };

        DataService.prototype.loadData = function () {
            var deffered = this.$q.defer();

            return deffered.promise;
        };

        DataService.prototype.addReview = function (review) {
            var data = {
                '__metadata': { 'type': 'SP.Data.ReviewListItem' },
                'ProductName': review.ProductName,
                'CompanyName': review.SupplierName
            };

            return this.execSvc.postRequest(this.reviewURL, data);
        };
        DataService.$inject = ["$http", "$q", "baseService", "executorService"];
        return DataService;
    })();

    angular.module("app").service("dataSvc", DataService);
})(App || (App = {}));

///#source 1 1 /Scripts/app/ListService.js
/// <reference path="../typings/linq/linq.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
var App;
(function (App) {
    "use strict";

    var ListService = (function () {
        function ListService($http, $q) {
            this.$http = $http;
            this.$q = $q;
            this.appWebUrl = App.Constants.URL.appweb;
            this.hostWebUrl = App.Constants.URL.hostWeb;
            this.context = SP.ClientContext.get_current();
        }
        ListService.prototype.createLists = function (names) {
            var _this = this;
            var promise = this.$q.when(false);

            names.forEach(function (name) {
                promise = promise.then(function (sucess) {
                    return _this.createList(name);
                });
            });

            return promise;
        };

        ListService.prototype.getHostList = function (title) {
            /// <summary>
            /// Gets the Host list names.
            /// </summary>
            /// <param name="title" type="string">
            /// Title of the list
            /// </param>
            /// <returns type="Promise">
            /// True if exists.
            /// </returns>
            var deffered = this.$q.defer();

            var executor = new SP.RequestExecutor(this.appWebUrl);

            executor.executeAsync({
                url: this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?$select=Title,Id&@target='" + this.hostWebUrl + "'",
                method: App.Constants.HTTP.GET,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
                },
                success: function (data) {
                    var sites = JSON.parse(data.body).d.results;
                    var titles = [];

                    for (var i = 0; i < sites.length; i++) {
                        titles.push(sites[i].Title);
                    }

                    var site = Enumerable.From(sites).Where(function (item) {
                        return item.Title == title;
                    }).Select(function (item) {
                        return item;
                    }).SingleOrDefault(null);

                    if (site != null) {
                        deffered.resolve(site.Id);
                    } else {
                        deffered.resolve(false);
                    }
                },
                error: function (message) {
                    deffered.reject(message.statusCode);
                },
                Uint8Array: []
            });

            return deffered.promise;
        };

        ListService.prototype.createHostList = function (title) {
            var deffered = this.$q.defer();

            var executor = new SP.RequestExecutor(this.appWebUrl);

            executor.executeAsync({
                url: this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?@target='" + this.hostWebUrl + "'",
                method: App.Constants.HTTP.POST,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest
                },
                body: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title
                }),
                success: function (data) {
                    var site = JSON.parse(data.body).d;

                    if (site != null) {
                        deffered.resolve(site.Id);
                    } else {
                        deffered.reject(false);
                    }
                },
                error: function (message) {
                    deffered.reject(message.statusCode);
                },
                Uint8Array: []
            });

            return deffered.promise;
        };

        ListService.prototype.createList = function (title) {
            var sucess = false;
            var deffered = this.$q.defer();
            var requestDigest = App.Constants.FormDigest;

            this.$http({
                url: this.appWebUrl + '/_api/Web/Lists',
                method: App.Constants.HTTP.POST,
                headers: {
                    Accept: 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': requestDigest
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title,
                    'AllowContentTypes': true,
                    'ContentTypesEnabled': true
                })
            }).then(function (resp) {
                var id = resp.data.d.id;
                if (typeof id !== undefined) {
                    deffered.resolve(true);
                }
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.getLists = function () {
            var deffered = this.$q.defer();

            this.$http({
                url: this.appWebUrl + "/_api/Web/Lists",
                method: App.Constants.HTTP.GET,
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).then(function (resp) {
                var results = resp.data.d.results;
                deffered.resolve(results);
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.getFormDigest = function () {
            var deffered = this.$q.defer();

            this.$http({
                url: this.appWebUrl + "/_api/contextInfo",
                method: App.Constants.HTTP.POST,
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).then(function (resp) {
                var results = resp.data.d;
                deffered.resolve(results.GetContextWebInformation.FormDigestValue);
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.addFields = function (listId, fieldData, toHostList) {
            var _this = this;
            var promise = this.$q.when(false);

            fieldData.forEach(function (field) {
                promise = promise.then(function (sucess) {
                    return _this.addField(listId, field, toHostList);
                });
            });

            return promise;
        };

        ListService.prototype.addField = function (id, data, toHostList) {
            var deffered = this.$q.defer();
            var formdigest = App.Constants.FormDigest;
            var url = this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/fields";
            if (toHostList) {
                url = App.Constants.URL.appweb + "/_api/SP.AppContextSite(@target)/web/Lists(guid'" + id + "')/fields?@target='" + App.Constants.URL.hostWeb + "'";
            }

            //this.getFormDigest()
            //    .then((formdigest) => {
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': formdigest,
                    'X-AddField': 'true'
                },
                body: JSON.stringify({
                    '__metadata': { 'type': 'SP.Field' },
                    'FieldTypeKind': data.type,
                    'Title': data.name
                }),
                method: App.Constants.HTTP.POST,
                url: url,
                success: function (response) {
                    var data = response.headers;
                    deffered.resolve(data);
                },
                error: function (message) {
                    deffered.reject(message);
                },
                Uint8Array: []
            });

            //})
            //.catch((message) => {
            //    deffered.reject(message);
            //});
            return deffered.promise;
        };
        ListService.$inject = ["$http", "$q"];
        return ListService;
    })();

    angular.module("app").service("ListService", ListService);
})(App || (App = {}));

///#source 1 1 /Scripts/app/mainCtrl.js
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
                    var added = 0;
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
                            added++;
                            if (added == remainigLists.length) {
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
            $scope.AddReview = function () {
                _this.addReview();
            };
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
                console.log('All the data loaded from odata');
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

        mainCtrl.prototype.addReview = function () {
            var selected = document.querySelectorAll('input.review[type="checkbox"]:checked');
            var sucess = 0;
            for (var i = 0; i < selected.length; i++) {
                var item = selected.item(i);
                var productItem = Enumerable.From(this.$scope.Products).Where(function (product) {
                    return product.ProductID.toString() == item.value;
                }).SingleOrDefault(null);

                var review = {
                    ProductName: productItem.ProductName,
                    SupplierName: productItem.CompanyName
                };

                this.dataService.addReview(review).then(function (response) {
                    sucess++;
                    if (sucess === selected.length)
                        alert("Review(s) Added");
                }).catch(function (error) {
                    console.error(error);
                });

                item.checked = false;
                item.removeAttribute("checked");
            }
        };
        mainCtrl.$inject = ["$scope", "dataSvc", "ListService"];
        return mainCtrl;
    })();

    angular.module("app").controller("mainCtrl", mainCtrl);
})(App || (App = {}));


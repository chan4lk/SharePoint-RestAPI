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
                    DELETE: 'DELETE'
                };

                return methods;
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
            this.ID = id;
            this.CompanyName = companyName;
        }
        Supplier.From = function (supplier) {
            return new Supplier(supplier.ID, supplier.CompanyName);
        };
        return Supplier;
    })();
    App.Supplier = Supplier;

    var Category = (function () {
        function Category(id, name) {
            this.ID = id;
            this.Name = name;
        }
        Category.From = function (category) {
            return new Category(category.ID, category.Name);
        };
        return Category;
    })();
    App.Category = Category;

    var Product = (function () {
        function Product(id, productName, supplierId, categoryId) {
            this.ID = id;
            this.ProductName = productName;
            this.CategoryID = categoryId;
            this.SupplierID = supplierId;
        }
        Product.From = function (product) {
            return new Product(product.ID, product.ProductName, product.SupplierID, product.CategoryID);
        };

        Product.prototype.setCategory = function (categories) {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].ID === this.CategoryID) {
                    this.Category = categories[i];
                    break;
                }
            }
        };

        Product.prototype.setSupplier = function (suppliers) {
            for (var i = 0; i < suppliers.length; i++) {
                if (suppliers[i].ID === this.SupplierID) {
                    this.Supplier = suppliers[i];
                    break;
                }
            }
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

///#source 1 1 /Scripts/app/dataSvc.js
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

        DataService.prototype.addData = function () {
            var deffered = this.$q.defer();

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
            var deffer = this.$q.defer();
            var promises = [];
            for (var i = 0; i < names.length; i++) {
                var promise = this.createList(names[i]);
                promises.push(promise);
            }

            this.$q.all(promises).then(function (oks) {
                var sucessCount = Enumerable.From(oks).Where(function (ok) {
                    return ok;
                }).Count();
                var allOk = sucessCount === oks.length;
                deffer.resolve(allOk);
            }).catch(function (messages) {
                deffer.reject(messages);
            });

            return deffer.promise;
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
                url: this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?$select=Title&@target='" + this.hostWebUrl + "'",
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
                    }).Single();

                    if (site) {
                        deffered.resolve(true);
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
                url: this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?&@target='" + this.hostWebUrl + "'",
                method: App.Constants.HTTP.POST,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title
                }),
                success: function (data) {
                    var sites = JSON.parse(data.body).d.results;

                    var site = Enumerable.From(sites).Where(function (item) {
                        return item.Title == title;
                    }).Single();

                    if (site) {
                        deffered.resolve(true);
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

        ListService.prototype.createList = function (title) {
            var sucess = false;
            var deffered = this.$q.defer();
            var requestDigest = document.getElementById('__REQUESTDIGEST');

            this.$http({
                url: this.appWebUrl + '/_api/Web/Lists',
                method: App.Constants.HTTP.POST,
                headers: {
                    Accept: 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': requestDigest.value
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title
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
            var deffered = this.$q.defer();
            var promises = [];
            for (var i = 0; i < fieldData.length; i++) {
                var promise = this.addField(listId, fieldData[i]);
                promises.push(promise);
            }

            this.$q.all(promises).then(function (oks) {
                var sucessCount = Enumerable.From(oks).Where(function (ok) {
                    return ok;
                }).Count();
                var allOk = sucessCount === oks.length;
                deffered.resolve(allOk);
            }).catch(function (message) {
                deffered.reject(message);
            });

            return deffered.promise;
        };

        ListService.prototype.addField = function (id, data) {
            var _this = this;
            var deffered = this.$q.defer();

            //var formdigest = Constants.FormDigest;
            this.getFormDigest().then(function (formdigest) {
                var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

                executor.executeAsync({
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': formdigest
                    },
                    body: JSON.stringify({
                        '__metadata': { 'type': 'SP.Field' },
                        'Title': data.name,
                        'FieldTypeKind': data.type
                    }),
                    method: App.Constants.HTTP.POST,
                    url: _this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/fields",
                    success: function (response) {
                        var data = JSON.parse(response.body);
                        deffered.resolve(data.d.results);
                    },
                    error: function (message) {
                        deffered.reject(message);
                    },
                    Uint8Array: []
                });
                //this.$http({
                //    url: this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/Fields",
                //    headers: {
                //        Accept: 'application/json;odata=verbose',
                //        'Content-Type': 'application/json;odata=verbose',
                //        'X-RequestDigest': formdigest,
                //        'Cache-Control': 'no-cache'
                //    },
                //    method: Constants.HTTP.POST,
                //    data: JSON.stringify({
                //        '__metadata': { 'type': 'SP.Field' },
                //        'Title': data.name,
                //        'FieldTypeKind': data.type
                //    })
                //})
                //    .then((response) => {
                //        deffered.resolve(response.data.d.results);
                //    })
                //    .catch((message) => {
                //        deffered.reject(message);
                //    });
            }).catch(function (message) {
                deffered.reject(message);
            });

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


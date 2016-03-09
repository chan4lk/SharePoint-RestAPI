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
        return Constants;
    })();
    App.Constants = Constants;

    angular.module("app");
})(App || (App = {}));

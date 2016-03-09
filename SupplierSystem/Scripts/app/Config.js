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

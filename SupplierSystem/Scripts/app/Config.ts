// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
module App {
    "use strict";

    export class Constants {
        static get URL() {
            return {
                product: "http://services.odata.org/V4/Northwind/Northwind.svc/Products",
                category: "http://services.odata.org/V4/Northwind/Northwind.svc/Categories",
                supplier: "http://services.odata.org/V4/Northwind/Northwind.svc/Suppliers",
                appweb: decodeURIComponent(Utils.getQueryStringParameter("SPAppWebUrl")),
                hostWeb: decodeURIComponent(Utils.getQueryStringParameter("SPHostUrl"))
            }
        }

        static get FormDigest() {
            return (<HTMLInputElement>document.getElementById('__REQUESTDIGEST')).value;
        }

        static get FIELD() {
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
          }

        static get LIST() {
            return {
                product: 'Product',
                category: 'Category',
                supplier: 'Supplier',
                review: 'Review'
            };
        }

        static get HTTP() {
            var methods = {
                GET: 'GET',
                POST: 'POST',
                PATCH: 'PATCH',
                PUT: 'PUT',
                DELETE: 'DELETE'
            };

                return methods;
            }
        }

    angular.module("app");
}
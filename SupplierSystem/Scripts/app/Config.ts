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

        static get STATUS() {
            return {
                OK: 200
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
                DELETE: 'DELETE',
                MERGE: 'MERGE'
            };

            return methods;
        }

        static get FieldsConfig() {

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
                },
            ];

            return {
                Product: product,
                Category: category,
                Supplier: supplier
            }
        }
    }


    angular.module("app");
}
declare module SP {

    module Responses {

        export interface Metadata {
            id: string;
            uri: string;
            etag: string;
            type: string;
        }

        export interface Result {
            __metadata: Metadata;
            Id: string;
            Title: string;
        }

        export interface ICreateListResponse {
            d: Result;
        }

        export interface D {
            results: Result[];
        }

        export interface IListResponse {
            d: D;
        }

        export interface GetContextWebInformation {
            __metadata: Metadata;
            FormDigestTimeoutSeconds: number;
            FormDigestValue: string;
            LibraryVersion: string;
            SiteFullUrl: string;
            WebFullUrl: string;
        }

        export interface WebContextInfo {
            GetContextWebInformation: GetContextWebInformation;
        }

        export interface IContextInfo {
            d: WebContextInfo;
        }
    }

}

module App {

    export interface IListResuts {
        __metadata: any;
        Title: string;
        Id: string;
    }

    export interface IFieldData {
        name: string;
        displayName: string;
        type: SP.FieldType;
    }

    export interface IListInfo {
        Id: string;
        Title: string;
    }

    export interface IListData {
        Products: IProduct[];
        Categories: ICategory[];
        Suppliers: ISupplier[];
    }

    export interface IReview {
        ProductName: string;
        SupplierName: string;
    }

    export interface IProduct {
        ProductID: number;
        ProductName: string;
        SupplierID: number;
        CategoryID: number;
    }

    export interface ISupplier {
        SupplierID: number;
        CompanyName: string;
    }

    export interface ICategory {
        CategoryID: number;
        CategoryName: string;
    }
    
    export class Supplier implements ISupplier {
        
        SupplierID: number;
        CompanyName: string;

        constructor(id: number, companyName: string) {
            this.SupplierID = id;
            this.CompanyName = companyName;
        }

        static From(supplier: ISupplier) : Supplier {
            return new Supplier(supplier.SupplierID, supplier.CompanyName);
        }
    }

    export class Category implements ICategory {
        CategoryID: number;
        CategoryName: string;

        constructor(id: number, name: string) {
            this.CategoryID = id;
            this.CategoryName = name;
        }

        static From(category: ICategory): Category {
            return new Category(category.CategoryID, category.CategoryName);
        }
    }

    export class Product implements IProduct {

        public ProductID: number;
        public ProductName: string;
        public SupplierID: number;
        public CategoryID: number;
        public CategoryName: string;
        public CompanyName: string;
        public Supplier: ISupplier;
        public Category: ICategory;

        constructor(id: number,
            productName: string,
            supplierId: number,
            categoryId: number) {
            this.ProductID = id;
            this.ProductName = productName;
            this.CategoryID = categoryId;
            this.SupplierID = supplierId;
        }

        static From(product: IProduct) : Product {
            return new Product(
                product.ProductID,
                product.ProductName,
                product.SupplierID,
                product.CategoryID);
        }

        setCategory(categories: ICategory[]) {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].CategoryID === this.CategoryID) {
                    this.Category = categories[i];
                    break;
                }
            }

            this.CategoryName = this.Category.CategoryName;
        }

        setSupplier(suppliers: ISupplier[]) {
            for (var i = 0; i < suppliers.length; i++) {
                if (suppliers[i].SupplierID === this.SupplierID) {
                    this.Supplier = suppliers[i];
                    break;
                }
            }

            this.CompanyName = this.Supplier.CompanyName;
        }

        resolve(categoris: ICategory[], suppliers: ISupplier[]) {
            this.setCategory(categoris);
            this.setSupplier(suppliers);
        }
    }

    export class ListData implements IListData{
        Products: IProduct[];
        Categories: ICategory[];
        Suppliers: ISupplier[];

        constructor(products: IProduct[], categories: ICategory[], suppliers: ISupplier[]) {
            this.Categories = categories;
            this.Suppliers = suppliers;
            this.Products = products;
        }
    }

    export class Review implements IReview {
        ProductName: string;
        SupplierName: string;

        constructor(productName: string, supplierName: string) {
            this.ProductName = productName;
            this.SupplierName = supplierName;
        }
    }
}
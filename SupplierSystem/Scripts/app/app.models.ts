module App {

    export interface IListResuts {
        __metadata: any;
        Title: string;
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
        ID: number;
        ProductName: string;
        SupplierID: number;
        CategoryID: number;
    }

    export interface ISupplier {
        ID: number;
        CompanyName: string;
    }

    export interface ICategory {
        ID: number;
        Name: string;
    }
    
    export class Supplier implements ISupplier {
        
        ID: number;
        CompanyName: string;

        constructor(id: number, companyName: string) {
            this.ID = id;
            this.CompanyName = companyName;
        }

        static From(supplier: ISupplier) : Supplier {
            return new Supplier(supplier.ID, supplier.CompanyName);
        }
    }

    export class Category implements ICategory {
        ID: number;
        Name: string;

        constructor(id: number, name: string) {
            this.ID = id;
            this.Name = name;
        }

        static From(category: ICategory): Category {
            return new Category(category.ID, category.Name);
        }
    }

    export class Product implements IProduct {

        public ID: number;
        public ProductName: string;
        public SupplierID: number;
        public CategoryID: number;
        public Supplier: ISupplier;
        public Category: ICategory;

        constructor(id: number,
            productName: string,
            supplierId: number,
            categoryId: number) {
            this.ID = id;
            this.ProductName = productName;
            this.CategoryID = categoryId;
            this.SupplierID = supplierId;
        }

        static From(product: IProduct) : Product {
            return new Product(
                product.ID,
                product.ProductName,
                product.SupplierID,
                product.CategoryID);
        }

        setCategory(categories: ICategory[]) {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].ID === this.CategoryID) {
                    this.Category = categories[i];
                    break;
                }
            }
        }

        setSupplier(suppliers: ISupplier[]) {
            for (var i = 0; i < suppliers.length; i++) {
                if (suppliers[i].ID === this.SupplierID) {
                    this.Supplier = suppliers[i];
                    break;
                }
            }
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
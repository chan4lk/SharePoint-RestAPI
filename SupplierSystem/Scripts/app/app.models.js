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

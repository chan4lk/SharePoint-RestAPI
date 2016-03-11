/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../app/app.models.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <chutzpah_reference path="../angular.js" >
var App;
(function (App) {
    describe("Product", function () {
        var product;
        var categories;
        var suppliers;
        var id = 1;

        beforeAll(function () {
            categories = [];
            suppliers = [];
            for (var i = 1; i <= 10; i++) {
                var category = new App.Category(i, 'cat' + i);
                categories.push(category);

                var supplier = new App.Supplier(i, 'supp' + i);
                suppliers.push(supplier);
            }
        });

        beforeEach(function () {
            product = new App.Product(id, 'chai', id, id);
            id++;
        });

        it('categories should have lenth of 10', function () {
            expect(categories.length).toBe(10);
        });

        it("shoud id not eqval 0", function () {
            expect(product.ProductID).toBe(2);
        });

        it("should return product name", function () {
            expect(product.ProductName).toBe("chai");
        });

        it('category should not be undefiened', function () {
            product.resolve(categories, suppliers);
            expect(product.Category).not.toBeUndefined();
        });

        it("should have a supplier with same supplier id", function () {
            product.resolve(categories, suppliers);
            expect(product.Supplier.SupplierID).toEqual(product.SupplierID);
        });

        it("should have a category with same category id", function () {
            product.resolve(categories, suppliers);
            expect(product.Category.CategoryID).toEqual(product.CategoryID);
        });

        it("undefined shold not be true", function () {
            var thing = undefined;
            var isTrue = false;

            if (thing)
                isTrue = true;
            expect(isTrue).not.toBeTruthy();
        });

        it("null shold not be true", function () {
            var thing = null;
            var isTrue = false;

            if (thing)
                isTrue = true;
            expect(isTrue).not.toBeTruthy();
        });

        it("value shold be true", function () {
            var thing = 5;
            var isTrue = false;

            if (thing)
                isTrue = true;
            expect(isTrue).toBeTruthy();
        });

        it("shoud fail this", function () {
            fail("fail this");
        });
    });
})(App || (App = {}));

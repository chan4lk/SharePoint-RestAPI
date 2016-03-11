/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../app/app.models.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <chutzpah_reference path="../angular.js" >

module App {
    describe("Product", () => {

        var product: App.Product;
        var categories: App.ICategory[];
        var suppliers: App.ISupplier[];
        var id: number = 1;

        beforeAll(() => {
            categories = [];
            suppliers = [];
            for (var i = 1; i <= 10; i++) {
                var category = new App.Category(i, 'cat' + i);
                categories.push(category);

                var supplier = new App.Supplier(i, 'supp' + i);
                suppliers.push(supplier);
            }
        });

        beforeEach(() => {
            product = new App.Product(id, 'chai', id, id);
            id++
        });

        it('categories should have lenth of 10', () => {
            expect(categories.length).toBe(10);
        });

        it("shoud id not eqval 0", () => {
            expect(product.ProductID).toBe(2);
        });

        it("should return product name", () => {
            expect(product.ProductName).toBe("chai");
        });

        it('category should not be undefiened', () => {
            product.resolve(categories, suppliers);
            expect(product.Category).not.toBeUndefined();
        });

        it("should have a supplier with same supplier id", () => {
            product.resolve(categories, suppliers);
            expect(product.Supplier.SupplierID).toEqual(product.SupplierID);
        });

        it("should have a category with same category id", () => {
            product.resolve(categories, suppliers);
            expect(product.Category.CategoryID).toEqual(product.CategoryID);
        });

        it("undefined shold not be true", () => {
            var thing = undefined;
            var isTrue = false;

            if (thing) isTrue = true;
            expect(isTrue).not.toBeTruthy();
        });

        it("null shold not be true", () => {
            var thing = null;
            var isTrue = false;

            if (thing) isTrue = true;
            expect(isTrue).not.toBeTruthy();
        });

        it("value shold be true", () => {
            var thing = 5;
            var isTrue = false;

            if (thing) isTrue = true;
            expect(isTrue).toBeTruthy();
        });

        it("shoud fail this", () => {
            fail("fail this");
        });
    });

}

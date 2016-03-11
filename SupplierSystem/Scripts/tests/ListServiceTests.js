/// <reference path="../app/baseService.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../app/ListService.ts" />
var App;
(function (App) {
    "use strict";

    describe("Base Service", function () {
        var baseSvc;
        var baseSvcMock;
        beforeEach(function () {
            angular.mock.module('app');
        });

        beforeEach(function () {
            angular.mock.inject(function (_$filter_, _$q_, _$http_) {
                baseSvcMock = jasmine.createSpyObj("baseService", ["getRequest"]);
                baseSvc = new App.BaseService(_$http_, _$q_);
            });
        });

        it('shoud be initialized', function () {
            expect(baseSvc).toBeDefined();
        });

        it('shoud be Mocked', function () {
            expect(baseSvcMock).toBeDefined();
        });
    });
})(App || (App = {}));

/// <reference path="../app/baseService.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../app/ListService.ts" />

module App {
    "use strict";

    describe("Base Service", () => {

        var baseSvc: App.IbaseService; 
        var baseSvcMock: App.IbaseService; 
        beforeEach(() => {
            angular.mock.module('app');
        });

        beforeEach(() => {
            angular.mock.inject(function (_$filter_, _$q_, _$http_) {
                baseSvcMock = jasmine.createSpyObj("baseService", ["getRequest"]);
                baseSvc = new App.BaseService(_$http_, _$q_);
            });
        });

        it('shoud be initialized', () => {
            expect(baseSvc).toBeDefined();            
        });

        it('shoud be Mocked', () => {
            expect(baseSvcMock).toBeDefined();
        });

    });
}
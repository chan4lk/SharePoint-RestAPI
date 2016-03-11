var App;
(function (App) {
    "use strict";

    var BaseService = (function () {
        function BaseService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        BaseService.prototype.getRequest = function (url) {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                method: App.Constants.HTTP.GET
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        };

        BaseService.prototype.postRequest = function (url, data) {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest
                },
                method: App.Constants.HTTP.POST,
                data: data
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        };

        BaseService.prototype.mergeRequest = function (url, data) {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.MERGE,
                    'IF-Match': '*'
                },
                method: App.Constants.HTTP.POST,
                data: data
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        };

        BaseService.prototype.deleteRequest = function (url) {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers: {
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.DELETE
                },
                method: App.Constants.HTTP.POST
            }).then(function (resp) {
                deffer.resolve(resp);
            }).catch(function (error) {
                deffer.reject(error);
            });

            return deffer.promise;
        };

        BaseService.prototype.proxyRequest = function (url) {
            var deffered = this.$q.defer();

            this.$http({
                url: "../_api/SP.WebProxy.invoke",
                method: App.Constants.HTTP.POST,
                data: JSON.stringify({
                    "requestInfo": {
                        "__metadata": { "type": "SP.WebRequestInfo" },
                        "Url": url,
                        "Method": App.Constants.HTTP.GET,
                        "Headers": {
                            "results": [{
                                    "__metadata": { "type": "SP.KeyValue" },
                                    "Key": "Content-Type",
                                    "Value": "application/json;odata=verbose",
                                    "ValueType": "Edm.String"
                                }]
                        }
                    }
                }),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": App.Constants.FormDigest
                }
            }).then(function (resp) {
                var statusCode = resp.data.d.Invoke.StatusCode;

                if (statusCode == App.Constants.STATUS.OK) {
                    var values = JSON.parse(resp.data.d.Invoke.Body).value;
                    deffered.resolve(values);
                } else {
                    deffered.reject(statusCode);
                }
            }).catch(function (message) {
                deffered.reject(message);
            });

            return deffered.promise;
        };
        BaseService.$inject = ["$http", "$q"];
        return BaseService;
    })();
    App.BaseService = BaseService;

    angular.module("app").service("baseService", BaseService);
})(App || (App = {}));

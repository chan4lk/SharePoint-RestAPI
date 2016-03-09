var App;
(function (App) {
    "use strict";

    baseService.$inject = ["$http", "$q"];

    function baseService($http, $q) {
        var service = {
            getRequest: getData,
            postRequest: postData,
            mergeRequest: mergeData,
            deleteRequest: deleteData,
            proxyRequest: loadOData
        };

        function getData(url) {
            var deffer = $q.defer();
            $http({
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
        }

        function postData(url, data) {
            var deffer = $q.defer();
            $http({
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
        }

        function mergeData(url, data) {
            var deffer = $q.defer();
            $http({
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
        }

        function deleteData(url) {
            var deffer = $q.defer();
            $http({
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
        }

        function loadOData(url) {
            var deffered = $q.defer();

            $http({
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
        }

        return service;
    }

    angular.module("app").factory("baseService", baseService);
})(App || (App = {}));

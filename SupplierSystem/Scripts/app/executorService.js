// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
var App;
(function (App) {
    "use strict";

    executorService.$inject = ["$q"];

    function executorService($q) {
        var service = {
            getRequest: getData,
            postRequest: postData,
            mergeRequest: mergeData,
            deleteRequest: deleteData,
            proxyRequest: loadOData
        };

        function getData(url) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                method: App.Constants.HTTP.GET,
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(response);
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function postData(url, data) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest
                },
                method: App.Constants.HTTP.POST,
                body: JSON.stringify(data),
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(JSON.parse(response.body));
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function mergeData(url, data) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.MERGE,
                    'IF-Match': '*'
                },
                method: App.Constants.HTTP.POST,
                body: JSON.stringify(data),
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(JSON.parse(response.body));
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function deleteData(url) {
            var deffer = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            this.executor.executeAsync({
                url: url,
                headers: {
                    'X-RequestDigest': App.Constants.FormDigest,
                    'X-HTTP-Method': App.Constants.HTTP.DELETE
                },
                method: App.Constants.HTTP.POST,
                Uint8Array: [],
                success: (function (response) {
                    deffer.resolve(response);
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        }

        function loadOData(url) {
            var deffered = $q.defer();
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);
            executor.executeAsync({
                url: "../_api/SP.WebProxy.invoke",
                method: App.Constants.HTTP.POST,
                body: JSON.stringify({
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
                },
                Uint8Array: [],
                success: (function (resp) {
                    var statusCode = resp.data.d.Invoke.StatusCode;

                    if (statusCode == App.Constants.STATUS.OK) {
                        var values = JSON.parse(resp.data.d.Invoke.Body).value;
                        deffered.resolve(values);
                    } else {
                        deffered.reject(statusCode);
                    }
                }),
                error: (function (message) {
                    deffered.reject(message);
                })
            });

            return deffered.promise;
        }

        return service;
    }

    angular.module("app").factory("executorService", executorService);
})(App || (App = {}));

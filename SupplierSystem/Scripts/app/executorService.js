// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
var App;
(function (App) {
    "use strict";

    var ExecutorService = (function () {
        function ExecutorService($q) {
            this.$q = $q;
            this.executor = new SP.RequestExecutor(App.Constants.URL.appweb);
        }
        ExecutorService.prototype.getRequest = function (url) {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
                url: url,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                method: App.Constants.HTTP.GET,
                Uint8Array: [],
                success: (function (response) {
                    if (response.statusCode === App.Constants.STATUS.OK) {
                        var body = JSON.parse(response.body);
                        deffer.resolve(body);
                    } else {
                        deffer.reject(response.statusCode);
                    }
                }),
                error: (function (message) {
                    deffer.reject(message);
                })
            });

            return deffer.promise;
        };

        ExecutorService.prototype.postRequest = function (url, data) {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
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
        };

        ExecutorService.prototype.mergeRequest = function (url, data) {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
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
        };

        ExecutorService.prototype.deleteRequest = function (url) {
            var deffer = this.$q.defer();

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
        };

        ExecutorService.prototype.proxyRequest = function (url) {
            var deffered = this.$q.defer();
            this.executor.executeAsync({
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
        };
        ExecutorService.$inject = ["$q"];
        return ExecutorService;
    })();

    angular.module("app").service("executorService", ExecutorService);
})(App || (App = {}));

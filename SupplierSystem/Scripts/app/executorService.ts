// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
module App {
    "use strict";

    export interface IExecutorService {
        getRequest: <T>(url: string) => ng.IPromise<T>;
        postRequest: <T, U>(url: string, data: T) => ng.IPromise<U>;
        mergeRequest: <T, U>(url: string, data: T) => ng.IPromise<U>;
        deleteRequest: <T>(url: string) => ng.IPromise<T>;
        proxyRequest: <T>(url: string) => ng.IPromise<T>;

    }

    class ExecutorService implements IExecutorService{
        static $inject: string[] = ["$q"];

        private executor: SP.RequestExecutor;

        constructor(private $q: ng.IQService) {
            this.executor = new SP.RequestExecutor(Constants.URL.appweb);
        }

        getRequest<T>(url: string): ng.IPromise<T> {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
                url: url,
                headers:
                {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                },
                method: Constants.HTTP.GET,
                Uint8Array: [],
                success: ((response: SP.ResponseInfo) => {                   
                    if (response.statusCode === Constants.STATUS.OK) {
                        var body:T = JSON.parse(response.body);
                        deffer.resolve(body);
                    } else {
                        deffer.reject(response.statusCode);
                    }
                }),
                error: ((message) => { deffer.reject(message); })
            });

            return deffer.promise;
        }

        postRequest<T, U>(url: string, data: T): ng.IPromise<U> {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
                url: url,
                headers:
                {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': Constants.FormDigest
                },
                method: Constants.HTTP.POST,
                body: JSON.stringify(data),
                Uint8Array: [],
                success: ((response) => { deffer.resolve(JSON.parse(response.body)); }),
                error: ((message) => { deffer.reject(message); })
            });

            return deffer.promise;
        }

        mergeRequest<T, U>(url: string, data: T): ng.IPromise<U> {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
                url: url,
                headers:
                {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': Constants.FormDigest,
                    'X-HTTP-Method': Constants.HTTP.MERGE,
                    'IF-Match': '*'
                },
                method: Constants.HTTP.POST,
                body: JSON.stringify(data),
                Uint8Array: [],
                success: ((response) => { deffer.resolve(JSON.parse(response.body)); }),
                error: ((message) => { deffer.reject(message); })
            });

            return deffer.promise;
        }

        deleteRequest<T>(url: string): ng.IPromise<T> {
            var deffer = this.$q.defer();

            this.executor.executeAsync({
                url: url,
                headers:
                {
                    'X-RequestDigest': Constants.FormDigest,
                    'X-HTTP-Method': Constants.HTTP.DELETE
                },
                method: Constants.HTTP.POST,
                Uint8Array: [],
                success: ((response) => { deffer.resolve(response); }),
                error: ((message) => { deffer.reject(message); })
            });

            return deffer.promise;
        }

        proxyRequest<T>(url: string): ng.IPromise<T> {
            var deffered = this.$q.defer();
            this.executor.executeAsync({
                url: "../_api/SP.WebProxy.invoke",
                method: Constants.HTTP.POST,
                body: JSON.stringify(
                    {
                        "requestInfo": {
                            "__metadata": { "type": "SP.WebRequestInfo" },
                            "Url": url,
                            "Method": Constants.HTTP.GET,
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
                    "X-RequestDigest": Constants.FormDigest
                },
                Uint8Array: [],
                success: ((resp) => {
                    var statusCode: number = resp.data.d.Invoke.StatusCode;

                    if (statusCode == Constants.STATUS.OK) {
                        var values: T = JSON.parse(resp.data.d.Invoke.Body).value;
                        deffered.resolve(values);
                    } else {
                        deffered.reject(statusCode);
                    }
                }),
                error: ((message) => {
                    deffered.reject(message);
                })

            });

            return deffered.promise;
        }

}

angular.module("app").service("executorService", ExecutorService);
}
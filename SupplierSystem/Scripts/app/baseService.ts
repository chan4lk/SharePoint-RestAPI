module App {
    "use strict";

    export interface IbaseService {
        getRequest: <T>(url: string) => ng.IPromise<T>;
        postRequest: <T, U>(url: string, data: T) => ng.IPromise<U>;
        mergeRequest: <T, U>(url: string, data: T) => ng.IPromise<U>;
        deleteRequest: <T>(url: string) => ng.IPromise<T>;
        proxyRequest: <T>(url: string)=> ng.IPromise<T>;

    }

    export class BaseService implements IbaseService {
        static $inject: string[] = ["$http", "$q"];
        constructor(private $http: ng.IHttpService, private $q: ng.IQService){
            
        }

        getRequest<T>(url: string): ng.IPromise<T> {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers:
                {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                },
                method: Constants.HTTP.GET
            }).then((resp) => {
                    deffer.resolve(resp);
                }).catch((error) => {
                    deffer.reject(error);
                });

            return deffer.promise;
        }

        postRequest<T, U>(url: string, data: T): ng.IPromise<U> {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers:
                {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': Constants.FormDigest
                },
                method: Constants.HTTP.POST,
                data: data
            }).then((resp) => {
                    deffer.resolve(resp);
                }).catch((error) => {
                    deffer.reject(error);
                });

            return deffer.promise;
        }

        mergeRequest<T, U>(url: string, data: T): ng.IPromise<U> {
            var deffer = this.$q.defer();
            this.$http({
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
                data: data
            }).then((resp) => {
                    deffer.resolve(resp);
                }).catch((error) => {
                    deffer.reject(error);
                });

            return deffer.promise;
        }

        deleteRequest<T>(url: string): ng.IPromise<T> {
            var deffer = this.$q.defer();
            this.$http({
                url: url,
                headers:
                {
                    'X-RequestDigest': Constants.FormDigest,
                    'X-HTTP-Method': Constants.HTTP.DELETE
                },
                method: Constants.HTTP.POST
            }).then((resp) => {
                    deffer.resolve(resp);
                }).catch((error) => {
                    deffer.reject(error);
                });

            return deffer.promise;
        }

        proxyRequest<T>(url: string): ng.IPromise<T> {
            var deffered = this.$q.defer();

            this.$http({
                url: "../_api/SP.WebProxy.invoke",
                method: Constants.HTTP.POST,
                data: JSON.stringify(
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
                }
            })
                .then((resp) => {
                    var statusCode:number = resp.data.d.Invoke.StatusCode;

                    if (statusCode == Constants.STATUS.OK) {
                        var values: T = JSON.parse(resp.data.d.Invoke.Body).value;
                        deffered.resolve(values);
                    } else {
                        deffered.reject(statusCode);
                    }
                })
                .catch((message) => {
                    deffered.reject(message);
                });

            return deffered.promise;
        }
        
    }

    angular.module("app").service("baseService", BaseService);
}
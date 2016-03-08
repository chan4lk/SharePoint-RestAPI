/// <reference path="../typings/linq/linq.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
var App;
(function (App) {
    "use strict";

    var ListService = (function () {
        function ListService($http, $q) {
            this.$http = $http;
            this.$q = $q;
            this.appWebUrl = App.Constants.URL.appweb;
            this.hostWebUrl = App.Constants.URL.hostWeb;
            this.context = SP.ClientContext.get_current();
        }
        ListService.prototype.createLists = function (names) {
            var deffer = this.$q.defer();
            var promises = [];
            for (var i = 0; i < names.length; i++) {
                var promise = this.createList(names[i]);
                promises.push(promise);
            }

            this.$q.all(promises).then(function (oks) {
                var sucessCount = Enumerable.From(oks).Where(function (ok) {
                    return ok;
                }).Count();
                var allOk = sucessCount === oks.length;
                deffer.resolve(allOk);
            }).catch(function (messages) {
                deffer.reject(messages);
            });

            return deffer.promise;
        };

        ListService.prototype.getHostList = function (title) {
            /// <summary>
            /// Gets the Host list names.
            /// </summary>
            /// <param name="title" type="string">
            /// Title of the list
            /// </param>
            /// <returns type="Promise">
            /// True if exists.
            /// </returns>
            var deffered = this.$q.defer();

            var executor = new SP.RequestExecutor(this.appWebUrl);

            executor.executeAsync({
                url: this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?$select=Title&@target='" + this.hostWebUrl + "'",
                method: App.Constants.HTTP.GET,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
                },
                success: function (data) {
                    var sites = JSON.parse(data.body).d.results;
                    var titles = [];

                    for (var i = 0; i < sites.length; i++) {
                        titles.push(sites[i].Title);
                    }

                    var site = Enumerable.From(sites).Where(function (item) {
                        return item.Title == title;
                    }).Single();

                    if (site) {
                        deffered.resolve(true);
                    } else {
                        deffered.resolve(false);
                    }
                },
                error: function (message) {
                    deffered.reject(message.statusCode);
                },
                Uint8Array: []
            });

            return deffered.promise;
        };

        ListService.prototype.createHostList = function (title) {
            var deffered = this.$q.defer();

            var executor = new SP.RequestExecutor(this.appWebUrl);

            executor.executeAsync({
                url: this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?&@target='" + this.hostWebUrl + "'",
                method: App.Constants.HTTP.POST,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title
                }),
                success: function (data) {
                    var sites = JSON.parse(data.body).d.results;

                    var site = Enumerable.From(sites).Where(function (item) {
                        return item.Title == title;
                    }).Single();

                    if (site) {
                        deffered.resolve(true);
                    } else {
                        deffered.resolve(false);
                    }
                },
                error: function (message) {
                    deffered.reject(message.statusCode);
                },
                Uint8Array: []
            });

            return deffered.promise;
        };

        ListService.prototype.createList = function (title) {
            var sucess = false;
            var deffered = this.$q.defer();
            var requestDigest = document.getElementById('__REQUESTDIGEST');

            this.$http({
                url: this.appWebUrl + '/_api/Web/Lists',
                method: App.Constants.HTTP.POST,
                headers: {
                    Accept: 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': requestDigest.value
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title
                })
            }).then(function (resp) {
                var id = resp.data.d.id;
                if (typeof id !== undefined) {
                    deffered.resolve(true);
                }
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.getLists = function () {
            var deffered = this.$q.defer();

            this.$http({
                url: this.appWebUrl + "/_api/Web/Lists",
                method: App.Constants.HTTP.GET,
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).then(function (resp) {
                var results = resp.data.d.results;
                deffered.resolve(results);
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.getFormDigest = function () {
            var deffered = this.$q.defer();

            this.$http({
                url: this.appWebUrl + "/_api/contextInfo",
                method: App.Constants.HTTP.POST,
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).then(function (resp) {
                var results = resp.data.d;
                deffered.resolve(results.GetContextWebInformation.FormDigestValue);
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.addFields = function (listId, fieldData, toHostList) {
            var deffered = this.$q.defer();
            var promises = [];
            for (var i = 0; i < fieldData.length; i++) {
                var promise = this.addField(listId, fieldData[i]);
                promises.push(promise);
            }

            this.$q.all(promises).then(function (oks) {
                var sucessCount = Enumerable.From(oks).Where(function (ok) {
                    return ok;
                }).Count();
                var allOk = sucessCount === oks.length;
                deffered.resolve(allOk);
            }).catch(function (message) {
                deffered.reject(message);
            });

            return deffered.promise;
        };

        ListService.prototype.addField = function (id, data) {
            var _this = this;
            var deffered = this.$q.defer();

            //var formdigest = Constants.FormDigest;
            this.getFormDigest().then(function (formdigest) {
                var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

                executor.executeAsync({
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': formdigest
                    },
                    body: JSON.stringify({
                        '__metadata': { 'type': 'SP.Field' },
                        'Title': data.name,
                        'FieldTypeKind': data.type
                    }),
                    method: App.Constants.HTTP.POST,
                    url: _this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/fields",
                    success: function (response) {
                        var data = JSON.parse(response.body);
                        deffered.resolve(data.d.results);
                    },
                    error: function (message) {
                        deffered.reject(message);
                    },
                    Uint8Array: []
                });
                //this.$http({
                //    url: this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/Fields",
                //    headers: {
                //        Accept: 'application/json;odata=verbose',
                //        'Content-Type': 'application/json;odata=verbose',
                //        'X-RequestDigest': formdigest,
                //        'Cache-Control': 'no-cache'
                //    },
                //    method: Constants.HTTP.POST,
                //    data: JSON.stringify({
                //        '__metadata': { 'type': 'SP.Field' },
                //        'Title': data.name,
                //        'FieldTypeKind': data.type
                //    })
                //})
                //    .then((response) => {
                //        deffered.resolve(response.data.d.results);
                //    })
                //    .catch((message) => {
                //        deffered.reject(message);
                //    });
            }).catch(function (message) {
                deffered.reject(message);
            });

            return deffered.promise;
        };
        ListService.$inject = ["$http", "$q"];
        return ListService;
    })();

    angular.module("app").service("ListService", ListService);
})(App || (App = {}));

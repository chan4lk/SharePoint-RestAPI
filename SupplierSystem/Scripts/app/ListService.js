/// <reference path="../typings/linq/linq.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
var App;
(function (App) {
    "use strict";

    var ListService = (function () {
        function ListService($q, $execSvc) {
            this.$q = $q;
            this.$execSvc = $execSvc;
            this.appWebUrl = App.Constants.URL.appweb;
            this.hostWebUrl = App.Constants.URL.hostWeb;
            this.context = SP.ClientContext.get_current();
        }
        ListService.prototype.createLists = function (names) {
            var _this = this;
            var promise = this.$q.when(false);

            names.forEach(function (name) {
                promise = promise.then(function (sucess) {
                    return _this.createList(name);
                });
            });

            return promise;
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

            var url = this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?$select=Title,Id&@target='" + this.hostWebUrl + "'";

            this.$execSvc.getRequest(url).then(function (data) {
                var sites = data.d.results;
                var titles = [];

                for (var i = 0; i < sites.length; i++) {
                    titles.push(sites[i].Title);
                }

                var site = Enumerable.From(sites).Where(function (item) {
                    return item.Title == title;
                }).Select(function (item) {
                    return item;
                }).SingleOrDefault(null);

                if (site != null) {
                    deffered.resolve(site.Id);
                } else {
                    deffered.resolve(false);
                }
            }).catch(function (message) {
                deffered.reject(message.statusCode);
            });

            return deffered.promise;
        };

        ListService.prototype.createHostList = function (title) {
            var deffered = this.$q.defer();

            var url = this.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?@target='" + this.hostWebUrl + "'";

            var payload = {
                '__metadata': { 'type': 'SP.List' },
                'BaseTemplate': SP.ListTemplateType.genericList,
                'Description': title + ' list',
                'Title': title
            };

            this.$execSvc.postRequest(url, payload).then(function (data) {
                var site = data.d;
                if (site != null) {
                    deffered.resolve(site.Id);
                } else {
                    deffered.reject(false);
                }
            }).catch(function (message) {
                deffered.reject(message.statusCode);
            });

            return deffered.promise;
        };

        ListService.prototype.createList = function (title) {
            var deffered = this.$q.defer();
            var url = this.appWebUrl + '/_api/Web/Lists';
            var payload = {
                '__metadata': { 'type': 'SP.List' },
                'BaseTemplate': SP.ListTemplateType.genericList,
                'Description': title + ' list',
                'Title': title,
                'AllowContentTypes': true,
                'ContentTypesEnabled': true
            };

            this.$execSvc.postRequest(url, payload).then(function (resp) {
                var id = resp.d.Id;
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
            var url = this.appWebUrl + "/_api/Web/Lists?$select=Title";
            this.$execSvc.getRequest(url).then(function (resp) {
                var results = resp.d.results;
                deffered.resolve(results);
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.getFormDigest = function () {
            var deffered = this.$q.defer();
            var url = this.appWebUrl + "/_api/contextInfo";
            this.$execSvc.postRequest(url, {}).then(function (resp) {
                var results = resp.d;
                deffered.resolve(results.GetContextWebInformation.FormDigestValue);
            }).catch(function (reason) {
                deffered.reject(reason);
            });

            return deffered.promise;
        };

        ListService.prototype.addFields = function (listId, fieldData, toHostList) {
            var _this = this;
            var promise = this.$q.when(false);

            fieldData.forEach(function (field) {
                promise = promise.then(function (sucess) {
                    return _this.addField(listId, field, toHostList);
                });
            });

            return promise;
        };

        ListService.prototype.addField = function (id, data, toHostList) {
            var deffered = this.$q.defer();
            var formdigest = App.Constants.FormDigest;
            var url = this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/fields";
            if (toHostList) {
                url = App.Constants.URL.appweb + "/_api/SP.AppContextSite(@target)/web/Lists(guid'" + id + "')/fields?@target='" + App.Constants.URL.hostWeb + "'";
            }

            //this.getFormDigest()
            //    .then((formdigest) => {
            var executor = new SP.RequestExecutor(App.Constants.URL.appweb);

            executor.executeAsync({
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': formdigest,
                    'X-AddField': 'true'
                },
                body: JSON.stringify({
                    '__metadata': { 'type': 'SP.Field' },
                    'FieldTypeKind': data.type,
                    'Title': data.name
                }),
                method: App.Constants.HTTP.POST,
                url: url,
                success: function (response) {
                    var data = response.headers;
                    deffered.resolve(data);
                },
                error: function (message) {
                    deffered.reject(message);
                },
                Uint8Array: []
            });

            //})
            //.catch((message) => {
            //    deffered.reject(message);
            //});
            return deffered.promise;
        };
        ListService.$inject = ["$q", "executorService"];
        return ListService;
    })();

    angular.module("app").service("ListService", ListService);
})(App || (App = {}));

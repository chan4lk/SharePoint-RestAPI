/// <reference path="../typings/linq/linq.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="../typings/sharepoint/SharePoint.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />

module App {
    "use strict";

    export interface IListService {
        createLists: (name: string[]) => ng.IPromise<boolean>;
        getLists: () => ng.IPromise<IListInfo[]>;
        getHostList(title: string): ng.IPromise<boolean>;
        createHostList(title: string): ng.IPromise<boolean>;
        addFields(listId: string, fieldData: IFieldData[], toHostList?: boolean): ng.IPromise<boolean>;
        getFormDigest(): ng.IPromise<string>;
    }

    class ListService implements IListService {
        static $inject: string[] = ["$http", "$q"];
        context: SP.ClientContext;
        appWebUrl: string = Constants.URL.appweb;
        hostWebUrl: string = Constants.URL.hostWeb;

        constructor(private $http: ng.IHttpService, private $q: ng.IQService) {
            this.context = SP.ClientContext.get_current();
        }

        createLists(names: string[]): ng.IPromise<boolean> {
            var deffer = this.$q.defer();
            var promises: ng.IPromise<boolean>[] = [];
            for (var i = 0; i < names.length; i++) {
                var promise = this.createList(names[i]);
                promises.push(promise);
            }

            this.$q.all(promises).then((oks) => {
                var sucessCount = Enumerable.From(oks).Where((ok: boolean) => { return ok; }).Count();
                var allOk = sucessCount === oks.length;
                deffer.resolve(allOk);

            }).catch((messages) => {
                    deffer.reject(messages);
                });

            return deffer.promise;
        }

        getHostList(title: string): ng.IPromise<boolean> {
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
                url: this.appWebUrl
                + "/_api/SP.AppContextSite(@target)/web/lists?$select=Title&@target='"
                + this.hostWebUrl
                + "'",
                method: Constants.HTTP.GET,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'X-RequestDigest': (<HTMLInputElement>document.getElementById('__REQUESTDIGEST')).value
                },
                success: (data) => {
                    var sites = JSON.parse(data.body).d.results;
                    var titles = [];

                    for (var i = 0; i < sites.length; i++) {
                        titles.push(sites[i].Title);
                    }

                    var site = Enumerable
                        .From(sites)
                        .Where((item: IListResuts) => { 
                                return item.Title == title
                            })
                        .Single();

                    if (site) {
                        deffered.resolve(true);
                    } else {
                        deffered.resolve(false);
                    }

                },
                error: (message) => {
                    deffered.reject(message.statusCode);
                },
                Uint8Array: []

            });

            return deffered.promise;
        }

        createHostList(title: string): ng.IPromise<boolean> {
            var deffered = this.$q.defer();

            var executor = new SP.RequestExecutor(this.appWebUrl);

            executor.executeAsync({
                url: this.appWebUrl
                + "/_api/SP.AppContextSite(@target)/web/lists?&@target='"
                + this.hostWebUrl
                + "'",
                method: Constants.HTTP.POST,
                headers: {
                    "Accept": "application/json; odata=verbose",
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': (<HTMLInputElement>document.getElementById('__REQUESTDIGEST')).value
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': SP.ListTemplateType.genericList,
                    'Description': title + ' list',
                    'Title': title,
                }),
                success: (data) => {
                    var sites = JSON.parse(data.body).d.results;

                    var site = Enumerable
                        .From(sites)
                        .Where((item: IListResuts) => { 
                                return item.Title == title
                            })
                        .Single();

                    if (site) {
                        deffered.resolve(true);
                    } else {
                        deffered.resolve(false);
                    }

                },
                error: (message) => {
                    deffered.reject(message.statusCode);
                },
                Uint8Array: []

            });

            return deffered.promise;
        }

        createList(title: string): ng.IPromise<boolean> {
            var sucess = false;
            var deffered = this.$q.defer();
            var requestDigest = Constants.FormDigest;

            this.$http({
                url: this.appWebUrl + '/_api/Web/Lists',
                method: Constants.HTTP.POST,
                headers:
                {
                    Accept: 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': requestDigest
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.List' },
                    'BaseTemplate': 100,
                    'Description': title + ' list',
                    'Title': title,
                    'AllowContentTypes': true,
                    'ContentTypesEnabled': true,
                })

            }).then((resp) => {
                    var id = resp.data.d.id;
                    if (typeof id !== undefined) {
                        deffered.resolve(true);
                    }
                }).catch((reason) => {
                    deffered.reject(reason);
                });

            return deffered.promise;
        }

        getLists(): ng.IPromise<IListInfo[]> {
            var deffered = this.$q.defer();

            this.$http({
                url: this.appWebUrl + "/_api/Web/Lists",
                method: Constants.HTTP.GET,
                headers:
                {
                    Accept: "application/json;odata=verbose"
                }
            }).then((resp) => {
                    var results: IListInfo[] = resp.data.d.results;
                    deffered.resolve(results);
                }).catch((reason) => {
                    deffered.reject(reason);
                });

            return deffered.promise;
        }

        getFormDigest(): ng.IPromise<string> {
            var deffered = this.$q.defer();

            this.$http({
                url: this.appWebUrl + "/_api/contextInfo",
                method: Constants.HTTP.POST,
                headers:
                {
                    Accept: "application/json;odata=verbose"
                }
            }).then((resp) => {
                    var results = resp.data.d;
                    deffered.resolve(results.GetContextWebInformation.FormDigestValue);
                }).catch((reason) => {
                    deffered.reject(reason);
                });

            return deffered.promise;
        }

        addFields(listId: string, fieldData: IFieldData[], toHostList?: boolean): ng.IPromise<boolean> {
            var promise = this.$q.when<boolean>(false);

            fieldData.forEach((field) => {
                promise = promise.then((sucess) => { return this.addField(listId, field); });
            });

            return promise;

        }

        addField(id: string, data: IFieldData): ng.IPromise<boolean> {
            var deffered = this.$q.defer();
            var formdigest = Constants.FormDigest;
            //this.getFormDigest()
            //    .then((formdigest) => {
                    var executor = new SP.RequestExecutor(Constants.URL.appweb);

                    executor.executeAsync({
                        headers: {
                            'Accept': 'application/json;odata=verbose',
                            'Content-Type': 'application/json;odata=verbose',
                            'X-RequestDigest': formdigest,
                        },
                        body: JSON.stringify({
                            '__metadata': { 'type': 'SP.Field' },
                            'FieldTypeKind': data.type,
                            'Title': data.name
                        }),
                        method: Constants.HTTP.POST,
                        url: this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/fields",
                        success: (response) => {
                            var data = response.headers;
                            deffered.resolve(data);
                        },
                        error: (message) => {
                            deffered.reject(message);
                        },
                        Uint8Array: []
                    });

                //})
                //.catch((message) => {
                //    deffered.reject(message);
                //});

            return deffered.promise;
        }

    }

    angular.module("app").service("ListService", ListService);
}
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
        createHostList(title: string): ng.IPromise<string>;
        addFields(listId: string, fieldData: IFieldData[], toHostList?: boolean): ng.IPromise<boolean>;
        getFormDigest(): ng.IPromise<string>;
    }

    class ListService implements IListService {
        static $inject: string[] = ["$q", "executorService"];
        context: SP.ClientContext;
        appWebUrl: string = Constants.URL.appweb;
        hostWebUrl: string = Constants.URL.hostWeb;

        constructor(private $q: ng.IQService,
            private $execSvc: IExecutorService) {
            this.context = SP.ClientContext.get_current();
        }

        createLists(names: string[]): ng.IPromise<boolean> {
            var promise = this.$q.when(false);

            names.forEach((name) => {
                promise = promise.then((sucess) => { return this.createList(name); });
            });

            return promise;
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

            var url = this.appWebUrl
                + "/_api/SP.AppContextSite(@target)/web/lists?$select=Title,Id&@target='"
                + this.hostWebUrl
                + "'";

            this.$execSvc.getRequest<SP.Responses.IListResponse>(url)
                .then((data) => {
                    var sites = data.d.results;
                    var titles = [];

                    for (var i = 0; i < sites.length; i++) {
                        titles.push(sites[i].Title);
                    }

                    var site = Enumerable
                        .From(sites)
                        .Where((item: IListResuts) => { 
                                return item.Title == title
                            })
                        .Select((item: IListResuts) => { return item; })
                        .SingleOrDefault(null);

                    if (site != null) {
                        deffered.resolve(site.Id);
                    } else {
                        deffered.resolve(false);
                    }

                }).catch((message) => {
                    deffered.reject(message.statusCode);
                });

            return deffered.promise;
        }

        createHostList(title: string): ng.IPromise<string> {
            var deffered = this.$q.defer();

            var url = this.appWebUrl
                + "/_api/SP.AppContextSite(@target)/web/lists?@target='"
                + this.hostWebUrl
                + "'";

            var payload = {
                '__metadata': { 'type': 'SP.List' },
                'BaseTemplate': SP.ListTemplateType.genericList,
                'Description': title + ' list',
                'Title': title
            };

            this.$execSvc.postRequest(url, payload)
                .then((data: any) => {
                    var site = data.d;
                    if (site != null) {
                        deffered.resolve(site.Id);
                    } else {
                        deffered.reject(false);
                    }
                }).catch((message) => {
                    deffered.reject(message.statusCode);
                });

            return deffered.promise;
        }

        createList(title: string): ng.IPromise<boolean> {
            var deffered = this.$q.defer();
            var url = this.appWebUrl + '/_api/Web/Lists';
            var payload = {
                '__metadata': { 'type': 'SP.List' },
                'BaseTemplate': SP.ListTemplateType.genericList,
                'Description': title + ' list',
                'Title': title,
                'AllowContentTypes': true,
                'ContentTypesEnabled': true,
            };

            this.$execSvc.postRequest<any, SP.Responses.ICreateListResponse>(url, payload)
                .then((resp) => {
                    var id = resp.d.Id;
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
            var url = this.appWebUrl + "/_api/Web/Lists?$select=Title";
            this.$execSvc.getRequest<SP.Responses.IListResponse>(url)
                .then((resp) => {
                    var results: IListInfo[] = resp.d.results;
                    deffered.resolve(results);
                }).catch((reason) => {
                    deffered.reject(reason);
                });

            return deffered.promise;
        }

        getFormDigest(): ng.IPromise<string> {
            var deffered = this.$q.defer();
            var url = this.appWebUrl + "/_api/contextInfo";
            this.$execSvc.postRequest <any, SP.Responses.IContextInfo>(url, {}).then((resp) => {
                    var results = resp.d;
                    deffered.resolve(results.GetContextWebInformation.FormDigestValue);
                }).catch((reason) => {
                    deffered.reject(reason);
                });

            return deffered.promise;
        }

        addFields(listId: string, fieldData: IFieldData[], toHostList?: boolean): ng.IPromise<boolean> {

            var promise = this.$q.when<boolean>(false);

            fieldData.forEach((field) => {
                promise = promise.then((sucess) => { return this.addField(listId, field, toHostList); });
            });

            return promise;

        }

        addField(id: string, data: IFieldData, toHostList?: boolean): ng.IPromise<boolean> {
            var deffered = this.$q.defer();
            var formdigest = Constants.FormDigest;
            var url = this.appWebUrl + "/_api/Web/Lists(guid'" + id + "')/fields";
            if (toHostList) {
                url = Constants.URL.appweb
                + "/_api/SP.AppContextSite(@target)/web/Lists(guid'" + id + "')/fields?@target='"
                + Constants.URL.hostWeb + "'";
            }

            //this.getFormDigest()
            //    .then((formdigest) => {
            var executor = new SP.RequestExecutor(Constants.URL.appweb);

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
                method: Constants.HTTP.POST,
                url: url,
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
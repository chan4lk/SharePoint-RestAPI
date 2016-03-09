<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/SP.RequestExecutor.js"></script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <script src="../Scripts/underscore-min.js"></script>

    <!-- Angular -->
    <script src="../Scripts/angular.min.js"></script>

    <!-- Bootstrap -->
    <link href="../Content/bootstrap.min.css" rel="stylesheet" />

    <!-- Optional theme -->
    <link href="../Content/bootstrap-theme.min.css" rel="stylesheet" />

    <!-- Latest compiled and minified JavaScript -->
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Supplier System
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div class="container" style="margin-top: 60px" data-ng-app="app">
        <div data-ng-controller="mainCtrl">
            {{title}}   
        <div class="row clearfix">
            <div class="col-md-12-">
                <form id="search_form" class="form-inline" action="javascript:alert( 'success!' );">
                    <div class="">
                        <div class="form-group col-md-4">
                            <select id="search_option" class="form-control" data-ng-model="mask">
                                <option value="ProductName" selected="selected">Product Name</option>
                                <option value="CompanyName">Company Name</option>
                                <option value="CategoryName">Category Name</option>
                            </select>
                        </div>
                        <div class="form-group col-md-4">
                            <input type="text" name="search" data-ng-model="search[mask]" id="search_text" class="form-control" placeholder="Search" required />
                        </div>
                        <div class="form-group col-md-2">
                            <input type="checkbox" class="form-control" ng-model="isOnline" id="search_online" />
                        </div>
                        <div class="form-group col-md-2" ng-show="isOnline">
                            <input id="search_btn" type="button" class="btn btn-default" value="Search" ng-click="seach()"/>
                        </div>
                    </div>
                </form>
            </div>
        </div>
            <div class="row">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Product Name</th>
                            <th>Company Name</th>
                            <th>Category Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-ng-repeat="product in Products | filter: search">
                            <td>
                                <input type="checkbox" value="{{product.ProductID}}" /></td>
                            <td>{{product.ProductName}}</td>
                            <td>{{product.CompanyName}}</td>
                            <td>{{product.CategoryName}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="loading" ng-show="!Products" class="lead">
                Loading...
            </div>
            <div class="row">
                <input type="button" class="btn btn-default pull-right" id="Button1" data-ng-if="review" value="Review" />
            </div>
        </div>
    </div>
    <!-- ng-controller -->
    <!-- Add your JavaScript to the following file -->
    <script src="../Scripts/camljs.js"></script>
    <script src="../Scripts/linq.min.js"></script>
    <script src="../Scripts/app/app.js"></script>
</asp:Content>

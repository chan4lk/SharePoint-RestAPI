var App;
(function (App) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.Include = function (items) {
            return "Include(" + items.join(",") + ")";
        };

        Utils.getQueryStringParameter = function (name, url) {
            if (!url)
                url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
            if (!results)
                return null;
            if (!results[2])
                return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };
        return Utils;
    })();
    App.Utils = Utils;
})(App || (App = {}));

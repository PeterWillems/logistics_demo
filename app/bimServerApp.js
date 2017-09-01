var app = angular.module("bimServerApp", ["ngMaterial"]);

app.directive("example", function () {
    return {
        templateUrl: function (element, attribute) {
            return 'docs/example.html';
        }
    };
});

app.directive("treeview", function () {
    return {
        templateUrl: function (element, attribute) {
            return 'docs/treeview.html';
        }
    };
});
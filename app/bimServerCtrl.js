app.controller("bimServerCtrl", function ($scope, $mdSidenav) {
    $scope.tree = null;

    $scope.models = [];
    $scope.getModels = function () {
        var address = "https://thisisanexperimentalserver.com";
        var client = new BimServerClient(address);
        client.init(function () {
            client.login("leon.vanberlo@tno.nl", "leon", function () {
                client.call("ServiceInterface", "getAllProjects", {
                    onlyTopLevel: true,
                    onlyActive: true
                }, function (projects) {
                    var totalFound = 0;
                    projects.forEach(function (project) {
                        if (project.lastRevisionId != -1) {
                            console.log(project);
                            var model = {
                                name: project.name,
                                href: "docs/example.html?address=" + encodeURIComponent(address) + "&token=" + client.token + "&poid=" + project.oid + "&roid=" + project.lastRevisionId,
                                address: decodeURIComponent(address),
                                token: client.token,
                                poid: project.oid,
                                roid: project.lastRevisionId
                            };
                            $scope.models.push(model);
                        }
                    });
                });
            }, function (error) {
                console.error(error);
                status.textContent = error.message;
            });
        });
    };
    $scope.getModels();
    $scope.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
    $scope.openRightMenu = function () {
        $mdSidenav('right').toggle();
    };
    $scope.model_name = "";
    $scope.model_id = "";
    $scope.ifc_types = [];
    $scope.bimSurfer = null;
    $scope.loadModel = function (name, a, t, p, r) {
        require(["bimsurfer/src/BimSurfer", "bimsurfer/src/StaticTreeRenderer", "bimsurfer/src/MetaDataRenderer", "bimsurfer/lib/domReady!"], function (BimSurfer) {
            var bimSurfer = new BimSurfer({
                domNode: "viewerContainer"
            });
            $scope.bimSurfer = bimSurfer;
            $scope.model_name = name;
            $scope.model_id = r;
            $scope.tree = undefined;
            $scope.ifc_types = [];
            bimSurfer.on("loading-finished", function () {
                bimSurfer.getTypes().forEach(function (ifc_type) {
                    $scope.ifc_types.push(ifc_type);
                });
            });
            bimSurfer.load({
                bimserver: a,
                token: t,
                poid: p,
                roid: r,
                schema: "ifc2x3tc1" // < TODO: Deduce automatically
            }).then(function (model) {
                model.getTree().then(function (tree) {
                    $scope.tree = tree;
                });
            });
        });
    };

    $scope.element_name = null;
    $scope.element = {};
    $scope.selectElement = function (data) {
        console.log(data);
        var selected = [$scope.model_id + ":" + data.id];
        $scope.bimSurfer.viewFit({
            ids: selected,
            animate: true
        });
        $scope.bimSurfer.setSelection({
            ids: selected,
            clear: true,
            selected: true
        });
        $scope.element_name = data.name;
        var elem = {oid: data.id};
        ["GlobalId", "Name", "OverallWidth", "OverallHeight", "Tag"].forEach(function (k) {
            var fn = elem["get" + k];
            if (fn) {
               $scope.element.k = fn.apply(elem);
            }
        });
    };
});

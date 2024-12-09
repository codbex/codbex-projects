const viewData = {
    id: 'codbex-projects-Reports-ProjectReport-print',
    label: 'Print',
    link: '/services/web/codbex-projects/gen/project/ui/Reports/ProjectReport/dialog-print/index.html',
    perspective: 'Reports',
    view: 'ProjectReport',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}
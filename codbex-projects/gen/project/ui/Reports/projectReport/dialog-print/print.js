const viewData = {
    id: 'codbex-projects-Reports-projectReport-print',
    label: 'Print',
    link: '/services/web/codbex-projects/gen/project/ui/Reports/projectReport/dialog-print/index.html',
    perspective: 'Reports',
    view: 'projectReport',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}
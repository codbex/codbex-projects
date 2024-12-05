const viewData = {
    id: 'codbex-projects-Reports-expenseReport-print',
    label: 'Print',
    link: '/services/web/codbex-projects/gen/expense/ui/Reports/expenseReport/dialog-print/index.html',
    perspective: 'Reports',
    view: 'expenseReport',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}
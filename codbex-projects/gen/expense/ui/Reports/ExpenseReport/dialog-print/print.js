const viewData = {
    id: 'codbex-projects-Reports-ExpenseReport-print',
    label: 'Print',
    link: '/services/web/codbex-projects/gen/expense/ui/Reports/ExpenseReport/dialog-print/index.html',
    perspective: 'Reports',
    view: 'ExpenseReport',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}
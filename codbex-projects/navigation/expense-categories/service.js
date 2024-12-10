const navigationData = {
    id: 'expense-categories-navigation',
    label: "Expense Categories",
    group: "configurations",
    order: 300,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/ExpenseCategory/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

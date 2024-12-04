/*
 * Generated by Eclipse Dirigible based on model and template.
 *
 * Do not modify the content as it may be re-generated again.
 */
const navigationData = {
	id: 'codbex-projects-expense',
	label: 'Expense Report',
	group: 'reports',
	link: '/services/web/codbex-projects/gen/expense/ui/Reports/expenseReport/index.html',
	order: 999,
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
	exports.getNavigation = function () {
		return navigationData;
	}
}

export { getNavigation }
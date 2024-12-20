const navigationData = {
    id: 'cost-categories-navigation',
    label: "Cost Categories ",
    group: "configurations",
    order: 200,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/CostCategory/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

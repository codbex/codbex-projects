const navigationData = {
    id: 'status-types-navigation',
    label: "Status Types",
    group: "metadata",
    order: 1800,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/StatusType/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

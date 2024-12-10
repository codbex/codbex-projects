const navigationData = {
    id: 'resource-navigation',
    label: "Resource",
    group: "configurations",
    order: 600,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/ResourceType/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

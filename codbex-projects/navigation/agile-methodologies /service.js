const navigationData = {
    id: 'agile-methodologies-navigation',
    label: "Agile Methodologies ",
    group: "configurations",
    order: 100,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/AgileMethodology/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

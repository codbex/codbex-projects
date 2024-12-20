const navigationData = {
    id: 'stakeholder-types-navigation',
    label: "Stakeholder Types",
    group: "reference data",

    order: 1900,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/StakeHolderType/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

const navigationData = {
    id: 'iteration-lengths-navigation',
    label: "Iteration Lengths",
    group: "configurations",
    order: 400,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/IterationLenght/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

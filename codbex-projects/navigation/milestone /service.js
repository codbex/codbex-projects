const navigationData = {
    id: 'milestone-navigation',
    label: "Milestone",
    group: "projects",
    order: 300,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Milestone/Milestone/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

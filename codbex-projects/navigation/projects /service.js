const navigationData = {
    id: 'projects-navigation',
    label: "Projects",
    group: "projects",
    order: 100,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Project/Project/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

const navigationData = {
    id: 'deliverables-navigation',
    label: "Deliverables",
    group: "projects",
    order: 200,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Deliverable/Deliverable/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

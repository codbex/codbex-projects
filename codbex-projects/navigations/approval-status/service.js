const navigationData = {
    id: 'approval-status-navigation',
    label: "Approval Status",
    group: "reference data",
    order: 2000,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/ApprovalStatus/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

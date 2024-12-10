const navigationData = {
    id: 'member-roles-navigation',
    label: "Member roles",
    group: "configurations",
    order: 500,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Settings/MemberRole/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }

const widgetData = {
    id: 'deliverable-status-widget',
    label: 'Deliverable Status',
    link: '/services/web/codbex-projects/widgets/deliverable-status/index.html',
    redirectViewId: "deliverable-navigation",
    size: "large"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

export { getWidget }

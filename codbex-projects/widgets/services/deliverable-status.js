const widgetData = {
    id: 'deliverable-status',
    label: 'Deliverable Status',
    link: '/services/web/codbex-projects/widgets/subviews/deliverable-status.html',
    lazyLoad: true,
    size: "medium"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

// export { getWidget }

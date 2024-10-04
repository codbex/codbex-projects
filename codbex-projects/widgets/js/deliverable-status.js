angular.module('deliverable-status', ['ideUI', 'ideView'])
    .controller('DeliverableStatus', ['$scope', '$http', '$document', function ($scope, $http, $document) {
        $scope.state = {
            isBusy: true,
            error: false,
            busyText: "Loading...",
        };

        const projectServiceUrl = "/services/ts/codbex-projects/widgets/api/ProjectService.ts/projectData";
        $http.get(projectServiceUrl)
            .then(function (response) {
                const projectData = response.data;
                angular.element($document[0]).ready(async function () {
                    if (projectData) {
                        // Doughnut Chart Data
                        const doughnutData = {
                            labels: ['Done', 'In Progress', 'DevelopingFeature', 'Deprecated', 'Research'],
                            datasets: [{
                                data: [projectData.TasksProgressDone, projectData.TasksProgressInProgress, projectData.TasksProgressDevelopingFeature, projectData.TasksDeprecated, projectData.TasksResearch],
                                backgroundColor: ['#36a2eb', '#ff6384', '#3643eb', '#40e2eb', '#bb6384']
                            }]
                        };

                        // Doughnut Chart Configuration
                        const doughnutOptions = {
                            responsive: true,
                            maintainAspectRatio: false,
                            legend: {
                                position: 'bottom'
                            },
                            title: {
                                display: true,
                                text: 'Deliverable Status'
                            },
                            animation: {
                                animateScale: true,
                                animateRotate: true
                            }
                        };

                        // Initialize Doughnut Chart
                        const doughnutChartCtx = $document[0].getElementById('doughnutChart').getContext('2d');
                        const doughnutChart = new Chart(doughnutChartCtx, {
                            type: 'doughnut',
                            data: doughnutData,
                            options: doughnutOptions
                        });

                        // Update state to indicate loading is complete
                        $scope.$apply(function () {
                            $scope.state.isBusy = false;
                        });
                    }
                });


            });
    }]);

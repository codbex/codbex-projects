angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Forecast';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.ForecastDateFrom) {
				params.entity.ForecastDateFrom = new Date(params.entity.ForecastDateFrom);
			}
			if (params?.entity?.ForecastDateTo) {
				params.entity.ForecastDateTo = new Date(params.entity.ForecastDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProject = params.optionsProject;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.ForecastedCost !== undefined) {
				filter.$filter.equals.ForecastedCost = entity.ForecastedCost;
			}
			if (entity.ForecastDateFrom) {
				filter.$filter.greaterThanOrEqual.ForecastDate = entity.ForecastDateFrom;
			}
			if (entity.ForecastDateTo) {
				filter.$filter.lessThanOrEqual.ForecastDate = entity.ForecastDateTo;
			}
			if (entity.Description) {
				filter.$filter.contains.Description = entity.Description;
			}
			if (entity.EarnedValue !== undefined) {
				filter.$filter.equals.EarnedValue = entity.EarnedValue;
			}
			if (entity.CostPerformanceIndex !== undefined) {
				filter.$filter.equals.CostPerformanceIndex = entity.CostPerformanceIndex;
			}
			if (entity.SchedulePerformanceIndex !== undefined) {
				filter.$filter.equals.SchedulePerformanceIndex = entity.SchedulePerformanceIndex;
			}
			if (entity.Project !== undefined) {
				filter.$filter.equals.Project = entity.Project;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Forecast-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
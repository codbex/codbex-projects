angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.VarianceAnalysis';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.AnalysisDateFrom) {
				params.entity.AnalysisDateFrom = new Date(params.entity.AnalysisDateFrom);
			}
			if (params?.entity?.AnalysisDateTo) {
				params.entity.AnalysisDateTo = new Date(params.entity.AnalysisDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
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
			if (entity.Project !== undefined) {
				filter.$filter.equals.Project = entity.Project;
			}
			if (entity.PlannedCost !== undefined) {
				filter.$filter.equals.PlannedCost = entity.PlannedCost;
			}
			if (entity.ActualCost !== undefined) {
				filter.$filter.equals.ActualCost = entity.ActualCost;
			}
			if (entity.CostVariance !== undefined) {
				filter.$filter.equals.CostVariance = entity.CostVariance;
			}
			if (entity.AnalysisDateFrom) {
				filter.$filter.greaterThanOrEqual.AnalysisDate = entity.AnalysisDateFrom;
			}
			if (entity.AnalysisDateTo) {
				filter.$filter.lessThanOrEqual.AnalysisDate = entity.AnalysisDateTo;
			}
			if (entity.Reason) {
				filter.$filter.contains.Reason = entity.Reason;
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
			messageHub.closeDialogWindow("VarianceAnalysis-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
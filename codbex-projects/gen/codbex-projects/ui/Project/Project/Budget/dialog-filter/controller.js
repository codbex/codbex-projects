angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Budget';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
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
			if (entity.InitialBudget !== undefined) {
				filter.$filter.equals.InitialBudget = entity.InitialBudget;
			}
			if (entity.CostEstimation !== undefined) {
				filter.$filter.equals.CostEstimation = entity.CostEstimation;
			}
			if (entity.ContingencyReserves !== undefined) {
				filter.$filter.equals.ContingencyReserves = entity.ContingencyReserves;
			}
			if (entity.ManagementReserves !== undefined) {
				filter.$filter.equals.ManagementReserves = entity.ManagementReserves;
			}
			if (entity.IsApproved !== undefined && entity.isIsApprovedIndeterminate === false) {
				filter.$filter.equals.IsApproved = entity.IsApproved;
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
			messageHub.closeDialogWindow("Budget-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
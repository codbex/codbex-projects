angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Cost';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.CommitmentDateFrom) {
				params.entity.CommitmentDateFrom = new Date(params.entity.CommitmentDateFrom);
			}
			if (params?.entity?.CommitmentDateTo) {
				params.entity.CommitmentDateTo = new Date(params.entity.CommitmentDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProject = params.optionsProject;
			$scope.optionsCostCategory = params.optionsCostCategory;
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
			if (entity.ActualCost !== undefined) {
				filter.$filter.equals.ActualCost = entity.ActualCost;
			}
			if (entity.CostCategory !== undefined) {
				filter.$filter.equals.CostCategory = entity.CostCategory;
			}
			if (entity.Description) {
				filter.$filter.contains.Description = entity.Description;
			}
			if (entity.CommitmentDateFrom) {
				filter.$filter.greaterThanOrEqual.CommitmentDate = entity.CommitmentDateFrom;
			}
			if (entity.CommitmentDateTo) {
				filter.$filter.lessThanOrEqual.CommitmentDate = entity.CommitmentDateTo;
			}
			if (entity.IsCommitted !== undefined && entity.isIsCommittedIndeterminate === false) {
				filter.$filter.equals.IsCommitted = entity.IsCommitted;
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
			messageHub.closeDialogWindow("Cost-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
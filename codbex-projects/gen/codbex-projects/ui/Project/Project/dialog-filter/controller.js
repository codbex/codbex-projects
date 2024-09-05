angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Project';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.StartingDateFrom) {
				params.entity.StartingDateFrom = new Date(params.entity.StartingDateFrom);
			}
			if (params?.entity?.StartingDateTo) {
				params.entity.StartingDateTo = new Date(params.entity.StartingDateTo);
			}
			if (params?.entity?.EndDateFrom) {
				params.entity.EndDateFrom = new Date(params.entity.EndDateFrom);
			}
			if (params?.entity?.EndDateTo) {
				params.entity.EndDateTo = new Date(params.entity.EndDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsMilestonePeriod = params.optionsMilestonePeriod;
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
			if (entity.Description) {
				filter.$filter.contains.Description = entity.Description;
			}
			if (entity.Employee !== undefined) {
				filter.$filter.equals.Employee = entity.Employee;
			}
			if (entity.StartingDateFrom) {
				filter.$filter.greaterThanOrEqual.StartingDate = entity.StartingDateFrom;
			}
			if (entity.StartingDateTo) {
				filter.$filter.lessThanOrEqual.StartingDate = entity.StartingDateTo;
			}
			if (entity.EndDateFrom) {
				filter.$filter.greaterThanOrEqual.EndDate = entity.EndDateFrom;
			}
			if (entity.EndDateTo) {
				filter.$filter.lessThanOrEqual.EndDate = entity.EndDateTo;
			}
			if (entity.MilestonePeriod !== undefined) {
				filter.$filter.equals.MilestonePeriod = entity.MilestonePeriod;
			}
			if (entity.Version !== undefined) {
				filter.$filter.equals.Version = entity.Version;
			}
			if (entity.Notes) {
				filter.$filter.contains.Notes = entity.Notes;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Project-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
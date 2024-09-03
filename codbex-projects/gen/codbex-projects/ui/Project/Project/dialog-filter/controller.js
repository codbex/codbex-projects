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
			if (params?.entity?.TickPeriodFrom) {
				params.entity.TickPeriodFrom = new Date(params.entity.TickPeriodFrom);
			}
			if (params?.entity?.TickPeriodTo) {
				params.entity.TickPeriodTo = new Date(params.entity.TickPeriodTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsResource = params.optionsResource;
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
			if (entity.Asassignee) {
				filter.$filter.contains.Asassignee = entity.Asassignee;
			}
			if (entity.StartingDateFrom) {
				filter.$filter.greaterThanOrEqual.StartingDate = entity.StartingDateFrom;
			}
			if (entity.StartingDateTo) {
				filter.$filter.lessThanOrEqual.StartingDate = entity.StartingDateTo;
			}
			if (entity.TickPeriodFrom) {
				filter.$filter.greaterThanOrEqual.TickPeriod = entity.TickPeriodFrom;
			}
			if (entity.TickPeriodTo) {
				filter.$filter.lessThanOrEqual.TickPeriod = entity.TickPeriodTo;
			}
			if (entity.Version !== undefined) {
				filter.$filter.equals.Version = entity.Version;
			}
			if (entity.Resource !== undefined) {
				filter.$filter.equals.Resource = entity.Resource;
			}
			if (entity.Notes) {
				filter.$filter.contains.Notes = entity.Notes;
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
			messageHub.closeDialogWindow("Project-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
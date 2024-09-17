angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Settings.AgileMethodologyProperty';
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
			$scope.optionsAgileMethodologyType = params.optionsAgileMethodologyType;
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
			if (entity.AgileMethodologyType !== undefined) {
				filter.$filter.equals.AgileMethodologyType = entity.AgileMethodologyType;
			}
			if (entity.IterationLength !== undefined) {
				filter.$filter.equals.IterationLength = entity.IterationLength;
			}
			if (entity.PlanningFrequency) {
				filter.$filter.contains.PlanningFrequency = entity.PlanningFrequency;
			}
			if (entity.CustomerInvolvementFrequency) {
				filter.$filter.contains.CustomerInvolvementFrequency = entity.CustomerInvolvementFrequency;
			}
			if (entity.ReleaseCadence) {
				filter.$filter.contains.ReleaseCadence = entity.ReleaseCadence;
			}
			if (entity.RetrospectiveFrequency) {
				filter.$filter.contains.RetrospectiveFrequency = entity.RetrospectiveFrequency;
			}
			if (entity.DailyStandup !== undefined && entity.isDailyStandupIndeterminate === false) {
				filter.$filter.equals.DailyStandup = entity.DailyStandup;
			}
			if (entity.BacklogRefinementFrequency) {
				filter.$filter.contains.BacklogRefinementFrequency = entity.BacklogRefinementFrequency;
			}
			if (entity.DefectManagement) {
				filter.$filter.contains.DefectManagement = entity.DefectManagement;
			}
			if (entity.DeploymentFrequency) {
				filter.$filter.contains.DeploymentFrequency = entity.DeploymentFrequency;
			}
			if (entity.TestingIntegration) {
				filter.$filter.contains.TestingIntegration = entity.TestingIntegration;
			}
			if (entity.StakeholderReview) {
				filter.$filter.contains.StakeholderReview = entity.StakeholderReview;
			}
			if (entity.FeatureCompletionCriteria) {
				filter.$filter.contains.FeatureCompletionCriteria = entity.FeatureCompletionCriteria;
			}
			if (entity.DocumentationUpdates) {
				filter.$filter.contains.DocumentationUpdates = entity.DocumentationUpdates;
			}
			if (entity.SustainableVelocity !== undefined) {
				filter.$filter.equals.SustainableVelocity = entity.SustainableVelocity;
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
			messageHub.closeDialogWindow("AgileMethodologyProperty-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
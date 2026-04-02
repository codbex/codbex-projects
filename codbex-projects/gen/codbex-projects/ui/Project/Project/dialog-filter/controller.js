angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
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
		$scope.optionsStatus = params.optionsStatus;
		$scope.optionsAgileMethodology = params.optionsAgileMethodology;
		$scope.optionsIterationLenght = params.optionsIterationLenght;
	}

	$scope.filter = () => {
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
		if (entity.Number) {
			filter.$filter.contains.Number = entity.Number;
		}
		if (entity.Description) {
			filter.$filter.contains.Description = entity.Description;
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
		if (entity.Status !== undefined) {
			filter.$filter.equals.Status = entity.Status;
		}
		if (entity.SponsorName) {
			filter.$filter.contains.SponsorName = entity.SponsorName;
		}
		if (entity.Opportunity) {
			filter.$filter.contains.Opportunity = entity.Opportunity;
		}
		if (entity.Scope) {
			filter.$filter.contains.Scope = entity.Scope;
		}
		if (entity.Version !== undefined) {
			filter.$filter.equals.Version = entity.Version;
		}
		if (entity.Notes) {
			filter.$filter.contains.Notes = entity.Notes;
		}
		if (entity.AgileMethodology !== undefined) {
			filter.$filter.equals.AgileMethodology = entity.AgileMethodology;
		}
		if (entity.IterationLenght !== undefined) {
			filter.$filter.equals.IterationLenght = entity.IterationLenght;
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
		if (entity.SustainableVelocity) {
			filter.$filter.contains.SustainableVelocity = entity.SustainableVelocity;
		}
		Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-projects.Project.Project.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'Project-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
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
		if (entity.Project !== undefined) {
			filter.$filter.equals.Project = entity.Project;
		}
		if (entity.Amount !== undefined) {
			filter.$filter.equals.Amount = entity.Amount;
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
		if (entity.Approval !== undefined && entity.isApprovalIndeterminate === false) {
			filter.$filter.equals.Approval = entity.Approval;
		}
		Dialogs.postMessage({ topic: 'codbex-projects.Project.Budget.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'Budget-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
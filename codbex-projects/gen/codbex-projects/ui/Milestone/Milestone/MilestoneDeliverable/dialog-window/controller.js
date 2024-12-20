angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Milestone.MilestoneDeliverable';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Milestone/MilestoneDeliverableService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "MilestoneDeliverable Details",
			create: "Create MilestoneDeliverable",
			update: "Update MilestoneDeliverable"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProject = params.optionsProject;
			$scope.optionsDeliverable = params.optionsDeliverable;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("MilestoneDeliverable", `Unable to create MilestoneDeliverable: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("MilestoneDeliverable", "MilestoneDeliverable successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("MilestoneDeliverable", `Unable to update MilestoneDeliverable: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("MilestoneDeliverable", "MilestoneDeliverable successfully updated");
			});
		};

		$scope.$watch('entity.Project', function (newValue, oldValue) {
			if (newValue !== undefined && newValue !== null) {
				entityApi.$http.post("/services/ts/codbex-projects/gen/codbex-projects/api/Deliverable/DeliverableService.ts/search", {
					$filter: {
						equals: {
							Project: newValue
						}
					}
				}).then(function (response) {
					$scope.optionsDeliverable = response.data.map(e => {
						return {
							value: e.Id,
							text: e.Name
						}
					});
					if ($scope.action !== 'select' && newValue !== oldValue) {
						$scope.entity.Deliverable = undefined;
					}
				});
			}
		});

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("MilestoneDeliverable-details");
		};

	}]);
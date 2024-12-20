angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Milestone.MilestoneDeliverable';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Milestone/MilestoneDeliverableService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-projects-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Milestone" && e.view === "MilestoneDeliverable" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Milestone" && e.view === "MilestoneDeliverable" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-projects.Milestone.Milestone.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-projects.Milestone.Milestone.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			let Milestone = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.Milestone = Milestone;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("MilestoneDeliverable", `Unable to count MilestoneDeliverable: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("MilestoneDeliverable", `Unable to list/filter MilestoneDeliverable: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("MilestoneDeliverable-details", {
				action: "select",
				entity: entity,
				optionsProject: $scope.optionsProject,
				optionsDeliverable: $scope.optionsDeliverable,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("MilestoneDeliverable-filter", {
				entity: $scope.filterEntity,
				optionsProject: $scope.optionsProject,
				optionsDeliverable: $scope.optionsDeliverable,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("MilestoneDeliverable-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Milestone",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProject: $scope.optionsProject,
				optionsDeliverable: $scope.optionsDeliverable,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("MilestoneDeliverable-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Milestone",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProject: $scope.optionsProject,
				optionsDeliverable: $scope.optionsDeliverable,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete MilestoneDeliverable?',
				`Are you sure you want to delete MilestoneDeliverable? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("MilestoneDeliverable", `Unable to delete MilestoneDeliverable: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProject = [];
		$scope.optionsDeliverable = [];


		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts").then(function (response) {
			$scope.optionsProject = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Deliverable/DeliverableService.ts").then(function (response) {
			$scope.optionsDeliverable = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsProjectValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProject.length; i++) {
				if ($scope.optionsProject[i].value === optionKey) {
					return $scope.optionsProject[i].text;
				}
			}
			return null;
		};
		$scope.optionsDeliverableValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsDeliverable.length; i++) {
				if ($scope.optionsDeliverable[i].value === optionKey) {
					return $scope.optionsDeliverable[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);

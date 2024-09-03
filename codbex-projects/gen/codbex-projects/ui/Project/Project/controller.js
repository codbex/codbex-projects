angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Project';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-projects-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Project" && e.view === "Project" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Project" && e.view === "Project" && e.type === "entity");
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
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
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
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Project", `Unable to count Project: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Project", `Unable to list/filter Project: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.StartingDate) {
							e.StartingDate = new Date(e.StartingDate);
						}
						if (e.TickPeriod) {
							e.TickPeriod = new Date(e.TickPeriod);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Project-details", {
				action: "select",
				entity: entity,
				optionsResource: $scope.optionsResource,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("Project-filter", {
				entity: $scope.filterEntity,
				optionsResource: $scope.optionsResource,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Project-details", {
				action: "create",
				entity: {},
				optionsResource: $scope.optionsResource,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Project-details", {
				action: "update",
				entity: entity,
				optionsResource: $scope.optionsResource,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Project?',
				`Are you sure you want to delete Project? This action cannot be undone.`,
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
							messageHub.showAlertError("Project", `Unable to delete Project: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsResource = [];


		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Project/ResourceService.ts").then(function (response) {
			$scope.optionsResource = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsResourceValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsResource.length; i++) {
				if ($scope.optionsResource[i].value === optionKey) {
					return $scope.optionsResource[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);

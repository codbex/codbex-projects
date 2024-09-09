angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.TaskDependency.TaskDependency';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/TaskDependency/TaskDependencyService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-projects-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "TaskDependency" && e.view === "TaskDependency" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "TaskDependency" && e.view === "TaskDependency" && e.type === "entity");
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
					messageHub.showAlertError("TaskDependency", `Unable to count TaskDependency: '${response.message}'`);
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
						messageHub.showAlertError("TaskDependency", `Unable to list/filter TaskDependency: '${response.message}'`);
						return;
					}
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
			messageHub.showDialogWindow("TaskDependency-details", {
				action: "select",
				entity: entity,
				optionsPredecessorTask: $scope.optionsPredecessorTask,
				optionsSuccessorTask: $scope.optionsSuccessorTask,
				optionsDependencyType: $scope.optionsDependencyType,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("TaskDependency-filter", {
				entity: $scope.filterEntity,
				optionsPredecessorTask: $scope.optionsPredecessorTask,
				optionsSuccessorTask: $scope.optionsSuccessorTask,
				optionsDependencyType: $scope.optionsDependencyType,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("TaskDependency-details", {
				action: "create",
				entity: {},
				optionsPredecessorTask: $scope.optionsPredecessorTask,
				optionsSuccessorTask: $scope.optionsSuccessorTask,
				optionsDependencyType: $scope.optionsDependencyType,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("TaskDependency-details", {
				action: "update",
				entity: entity,
				optionsPredecessorTask: $scope.optionsPredecessorTask,
				optionsSuccessorTask: $scope.optionsSuccessorTask,
				optionsDependencyType: $scope.optionsDependencyType,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete TaskDependency?',
				`Are you sure you want to delete TaskDependency? This action cannot be undone.`,
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
							messageHub.showAlertError("TaskDependency", `Unable to delete TaskDependency: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPredecessorTask = [];
		$scope.optionsSuccessorTask = [];
		$scope.optionsDependencyType = [];


		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Task/TaskService.ts").then(function (response) {
			$scope.optionsPredecessorTask = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Task/TaskService.ts").then(function (response) {
			$scope.optionsSuccessorTask = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/entities/DependencyTypeService.ts").then(function (response) {
			$scope.optionsDependencyType = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsPredecessorTaskValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPredecessorTask.length; i++) {
				if ($scope.optionsPredecessorTask[i].value === optionKey) {
					return $scope.optionsPredecessorTask[i].text;
				}
			}
			return null;
		};
		$scope.optionsSuccessorTaskValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSuccessorTask.length; i++) {
				if ($scope.optionsSuccessorTask[i].value === optionKey) {
					return $scope.optionsSuccessorTask[i].text;
				}
			}
			return null;
		};
		$scope.optionsDependencyTypeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsDependencyType.length; i++) {
				if ($scope.optionsDependencyType[i].value === optionKey) {
					return $scope.optionsDependencyType[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);

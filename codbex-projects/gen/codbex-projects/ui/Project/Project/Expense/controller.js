angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Expense';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ExpenseService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-projects-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Project" && e.view === "Expense" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Project" && e.view === "Expense" && e.type === "entity");
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
		messageHub.onDidReceiveMessage("codbex-projects.Project.Project.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-projects.Project.Project.clearDetails", function (msg) {
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
			let Project = $scope.selectedMainEntityId;
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
			filter.$filter.equals.Project = Project;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Expense", `Unable to count Expense: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Expense", `Unable to list/filter Expense: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
					});

					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Expense-details", {
				action: "select",
				entity: entity,
				optionsProject: $scope.optionsProject,
				optionsEmployee: $scope.optionsEmployee,
				optionsExpenseCategory: $scope.optionsExpenseCategory,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("Expense-filter", {
				entity: $scope.filterEntity,
				optionsProject: $scope.optionsProject,
				optionsEmployee: $scope.optionsEmployee,
				optionsExpenseCategory: $scope.optionsExpenseCategory,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Expense-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Project",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProject: $scope.optionsProject,
				optionsEmployee: $scope.optionsEmployee,
				optionsExpenseCategory: $scope.optionsExpenseCategory,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Expense-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Project",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProject: $scope.optionsProject,
				optionsEmployee: $scope.optionsEmployee,
				optionsExpenseCategory: $scope.optionsExpenseCategory,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Expense?',
				`Are you sure you want to delete Expense? This action cannot be undone.`,
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
							messageHub.showAlertError("Expense", `Unable to delete Expense: '${response.message}'`);
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
		$scope.optionsEmployee = [];
		$scope.optionsExpenseCategory = [];


		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts").then(function (response) {
			$scope.optionsProject = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts").then(function (response) {
			$scope.optionsEmployee = response.data.map(e => {
				return {
					value: e.Id,
					text: e.FirstName
				}
			});
		});

		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/entities/ExpenseCategoryService.ts").then(function (response) {
			$scope.optionsExpenseCategory = response.data.map(e => {
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
		$scope.optionsEmployeeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsEmployee.length; i++) {
				if ($scope.optionsEmployee[i].value === optionKey) {
					return $scope.optionsEmployee[i].text;
				}
			}
			return null;
		};
		$scope.optionsExpenseCategoryValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsExpenseCategory.length; i++) {
				if ($scope.optionsExpenseCategory[i].value === optionKey) {
					return $scope.optionsExpenseCategory[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);

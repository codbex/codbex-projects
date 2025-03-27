angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Project';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Project Details",
			create: "Create Project",
			update: "Update Project"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-projects-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Project" && e.view === "Project" && e.type === "entity");
		});

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

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStatus = [];
				$scope.optionsAgileMethodology = [];
				$scope.optionsIterationLenght = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.StartingDate) {
					msg.data.entity.StartingDate = new Date(msg.data.entity.StartingDate);
				}
				if (msg.data.entity.EndDate) {
					msg.data.entity.EndDate = new Date(msg.data.entity.EndDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsAgileMethodology = msg.data.optionsAgileMethodology;
				$scope.optionsIterationLenght = msg.data.optionsIterationLenght;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsAgileMethodology = msg.data.optionsAgileMethodology;
				$scope.optionsIterationLenght = msg.data.optionsIterationLenght;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.StartingDate) {
					msg.data.entity.StartingDate = new Date(msg.data.entity.StartingDate);
				}
				if (msg.data.entity.EndDate) {
					msg.data.entity.EndDate = new Date(msg.data.entity.EndDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsAgileMethodology = msg.data.optionsAgileMethodology;
				$scope.optionsIterationLenght = msg.data.optionsIterationLenght;
				$scope.action = 'update';
			});
		});

		$scope.serviceStatus = "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts";
		$scope.serviceAgileMethodology = "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts";
		$scope.serviceIterationLenght = "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Project", `Unable to create Project: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Project", "Project successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Project", `Unable to update Project: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Project", "Project successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createStatus = function () {
			messageHub.showDialogWindow("StatusType-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createAgileMethodology = function () {
			messageHub.showDialogWindow("AgileMethodology-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createIterationLenght = function () {
			messageHub.showDialogWindow("IterationLenght-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshStatus = function () {
			$scope.optionsStatus = [];
			$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts").then(function (response) {
				$scope.optionsStatus = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshAgileMethodology = function () {
			$scope.optionsAgileMethodology = [];
			$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts").then(function (response) {
				$scope.optionsAgileMethodology = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshIterationLenght = function () {
			$scope.optionsIterationLenght = [];
			$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts").then(function (response) {
				$scope.optionsIterationLenght = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Period
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);
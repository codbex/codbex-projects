angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Project';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'messageHub', 'ViewParameters', 'entityApi', function ($scope,  $http, messageHub, ViewParameters, entityApi) {

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

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.StartingDate) {
				params.entity.StartingDate = new Date(params.entity.StartingDate);
			}
			if (params.entity.EndDate) {
				params.entity.EndDate = new Date(params.entity.EndDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsStatus = params.optionsStatus;
			$scope.optionsAgileMethodology = params.optionsAgileMethodology;
			$scope.optionsIterationLenght = params.optionsIterationLenght;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					$scope.errorMessage = `Unable to create Project: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Project", "Project successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					$scope.errorMessage = `Unable to update Project: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Project", "Project successfully updated");
			});
		};

		$scope.serviceStatus = "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts";
		
		$scope.optionsStatus = [];
		
		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts").then(function (response) {
			$scope.optionsStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.serviceAgileMethodology = "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts";
		
		$scope.optionsAgileMethodology = [];
		
		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts").then(function (response) {
			$scope.optionsAgileMethodology = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.serviceIterationLenght = "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts";
		
		$scope.optionsIterationLenght = [];
		
		$http.get("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts").then(function (response) {
			$scope.optionsIterationLenght = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Period
				}
			});
		});

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("Project-details");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);
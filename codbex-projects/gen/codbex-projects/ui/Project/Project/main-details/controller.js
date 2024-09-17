angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-projects.Project.Project';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

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
				$scope.optionsAgileMethodologyType = [];
				$scope.optionsAgileMethodologyProperty = [];
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
				$scope.optionsAgileMethodologyType = msg.data.optionsAgileMethodologyType;
				$scope.optionsAgileMethodologyProperty = msg.data.optionsAgileMethodologyProperty;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsAgileMethodologyType = msg.data.optionsAgileMethodologyType;
				$scope.optionsAgileMethodologyProperty = msg.data.optionsAgileMethodologyProperty;
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
				$scope.optionsAgileMethodologyType = msg.data.optionsAgileMethodologyType;
				$scope.optionsAgileMethodologyProperty = msg.data.optionsAgileMethodologyProperty;
				$scope.action = 'update';
			});
		});

		$scope.$watch('entity.AgileMethodologyType', function (newValue, oldValue) {
			if (newValue !== undefined && newValue !== null) {
				entityApi.$http.post("/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyPropertyService.ts/search", {
					$filter: {
						equals: {
							AgileMethodologyType: newValue
						}
					}
				}).then(function (response) {
					$scope.optionsAgileMethodologyProperty = response.data.map(e => {
						return {
							value: e.Id,
							text: e.Name
						}
					});
					if ($scope.action !== 'select' && newValue !== oldValue) {
						$scope.entity.AgileMethodologyProperty = undefined;
					}
				});
			}
		});
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

	}]);
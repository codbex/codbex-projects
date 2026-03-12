angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/ResourceService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete Resource? This action cannot be undone.',
			deleteTitle: 'Delete Resource?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-projects:codbex-projects-model.defaults.yes');
			translated.no = LocaleService.t('codbex-projects:codbex-projects-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-projects:codbex-projects-model.defaults.deleteTitle', { name: '$t(codbex-projects:codbex-projects-model.t.RESOURCE)' });
			translated.deleteConfirm = LocaleService.t('codbex-projects:codbex-projects-model.messages.deleteConfirm', { name: '$t(codbex-projects:codbex-projects-model.t.RESOURCE)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-projects-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Project' && e.view === 'Resource' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Project' && e.view === 'Resource' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'Project',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id,
					selectedMainEntityKey: 'Project',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Project.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Project.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Resource.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Resource.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Resource.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Resource.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
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
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-projects:codbex-projects-model.t.RESOURCE'),
						message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToLF', { name: '$t(codbex-projects:codbex-projects-model.t.RESOURCE)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.RESOURCE'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCount', { name: '$t(codbex-projects:codbex-projects-model.t.RESOURCE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'Resource-details',
				params: {
					action: 'select',
					entity: entity,
					optionsProject: $scope.optionsProject,
					optionsResourceType: $scope.optionsResourceType,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'Resource-filter',
				params: {
					entity: $scope.filterEntity,
					optionsProject: $scope.optionsProject,
					optionsResourceType: $scope.optionsResourceType,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'Resource-details',
				params: {
					action: 'create',
					entity: {
						'Project': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'Project',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsProject: $scope.optionsProject,
					optionsResourceType: $scope.optionsResourceType,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'Resource-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'Project',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsProject: $scope.optionsProject,
					optionsResourceType: $scope.optionsResourceType,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-projects.Project.Resource.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-projects:codbex-projects-model.t.RESOURCE'),
							message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToDelete', { name: '$t(codbex-projects:codbex-projects-model.t.RESOURCE)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProject = [];
		$scope.optionsResourceType = [];


		$http.get('/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts').then((response) => {
			$scope.optionsProject = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Project',
				message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$http.get('/services/ts/codbex-projects/gen/codbex-projects/api/Settings/ResourceTypeService.ts').then((response) => {
			$scope.optionsResourceType = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'ResourceType',
				message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
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
		$scope.optionsResourceTypeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsResourceType.length; i++) {
				if ($scope.optionsResourceType[i].value === optionKey) {
					return $scope.optionsResourceType[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});

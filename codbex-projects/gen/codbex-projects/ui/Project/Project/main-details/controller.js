angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Project successfully created';
		let propertySuccessfullyUpdated = 'Project successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Project Details',
			create: 'Create Project',
			update: 'Update Project'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-projects:codbex-projects-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadSelect', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)' });
			$scope.formHeaders.create = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadCreate', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)' });
			$scope.formHeaders.update = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-projects-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'Project' && e.view === 'Project' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Project.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStatus = [];
				$scope.optionsAgileMethodology = [];
				$scope.optionsIterationLenght = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Project.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.StartingDate) {
					data.entity.StartingDate = new Date(data.entity.StartingDate);
				}
				if (data.entity.EndDate) {
					data.entity.EndDate = new Date(data.entity.EndDate);
				}
				$scope.entity = data.entity;
				$scope.optionsStatus = data.optionsStatus;
				$scope.optionsAgileMethodology = data.optionsAgileMethodology;
				$scope.optionsIterationLenght = data.optionsIterationLenght;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Project.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStatus = data.optionsStatus;
				$scope.optionsAgileMethodology = data.optionsAgileMethodology;
				$scope.optionsIterationLenght = data.optionsIterationLenght;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-projects.Project.Project.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.StartingDate) {
					data.entity.StartingDate = new Date(data.entity.StartingDate);
				}
				if (data.entity.EndDate) {
					data.entity.EndDate = new Date(data.entity.EndDate);
				}
				$scope.entity = data.entity;
				$scope.optionsStatus = data.optionsStatus;
				$scope.optionsAgileMethodology = data.optionsAgileMethodology;
				$scope.optionsIterationLenght = data.optionsIterationLenght;
				$scope.action = 'update';
			});
		}});

		$scope.serviceStatus = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts';
		$scope.serviceAgileMethodology = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts';
		$scope.serviceIterationLenght = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.PROJECT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.PROJECT'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.PROJECT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.PROJECT'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-projects.Project.Project.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createStatus = () => {
			Dialogs.showWindow({
				id: 'StatusType-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createAgileMethodology = () => {
			Dialogs.showWindow({
				id: 'AgileMethodology-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createIterationLenght = () => {
			Dialogs.showWindow({
				id: 'IterationLenght-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshStatus = () => {
			$scope.optionsStatus = [];
			$http.get('/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts').then((response) => {
				$scope.optionsStatus = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Status',
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshAgileMethodology = () => {
			$scope.optionsAgileMethodology = [];
			$http.get('/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts').then((response) => {
				$scope.optionsAgileMethodology = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'AgileMethodology',
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshIterationLenght = () => {
			$scope.optionsIterationLenght = [];
			$http.get('/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts').then((response) => {
				$scope.optionsIterationLenght = response.data.map(e => ({
					value: e.Id,
					text: e.Period
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'IterationLenght',
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});
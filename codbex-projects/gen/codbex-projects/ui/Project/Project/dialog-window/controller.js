angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
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

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.PROJECT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Project.entityUpdated', data: response.data });
				$scope.cancel();
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.PROJECT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.PROJECT)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceStatus = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/StatusTypeService.ts';
		
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
		$scope.serviceAgileMethodology = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyService.ts';
		
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
		$scope.serviceIterationLenght = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/IterationLenghtService.ts';
		
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

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'Project-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});
angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/CostCategoryService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'CostCategory successfully created';
		let propertySuccessfullyUpdated = 'CostCategory successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'CostCategory Details',
			create: 'Create CostCategory',
			update: 'Update CostCategory'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-projects:codbex-projects-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadSelect', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)' });
			$scope.formHeaders.create = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadCreate', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)' });
			$scope.formHeaders.update = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Settings.CostCategory.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.COSTCATEGORY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Settings.CostCategory.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.COSTCATEGORY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.COSTCATEGORY)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


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
			Dialogs.closeWindow({ id: 'CostCategory-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});
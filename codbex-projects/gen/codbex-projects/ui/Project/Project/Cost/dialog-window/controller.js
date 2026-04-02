angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/CostService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Cost successfully created';
		let propertySuccessfullyUpdated = 'Cost successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Cost Details',
			create: 'Create Cost',
			update: 'Update Cost'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-projects:codbex-projects-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadSelect', { name: '$t(codbex-projects:codbex-projects-model.t.COST)' });
			$scope.formHeaders.create = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadCreate', { name: '$t(codbex-projects:codbex-projects-model.t.COST)' });
			$scope.formHeaders.update = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.COST)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-projects:codbex-projects-model.t.COST)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-projects:codbex-projects-model.t.COST)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.CommitmentDate) {
				params.entity.CommitmentDate = new Date(params.entity.CommitmentDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProject = params.optionsProject;
			$scope.optionsCostCategory = params.optionsCostCategory;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Cost.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.COST'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.COST'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.COST)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.Cost.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.COST'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.COST'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.COST)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceProject = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts';
		$scope.serviceCostCategory = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/CostCategoryService.ts';

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
			Dialogs.closeWindow({ id: 'Cost-details' });
		};
	});
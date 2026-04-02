angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Milestone/MilestoneDeliverableService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'MilestoneDeliverable successfully created';
		let propertySuccessfullyUpdated = 'MilestoneDeliverable successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'MilestoneDeliverable Details',
			create: 'Create MilestoneDeliverable',
			update: 'Update MilestoneDeliverable'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-projects:codbex-projects-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadSelect', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadCreate', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.StartDate) {
				params.entity.StartDate = new Date(params.entity.StartDate);
			}
			if (params.entity.EndDate) {
				params.entity.EndDate = new Date(params.entity.EndDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProject = params.optionsProject;
			$scope.optionsDeliverable = params.optionsDeliverable;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Milestone.MilestoneDeliverable.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)', message: message }),
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
				Dialogs.postMessage({ topic: 'codbex-projects.Milestone.MilestoneDeliverable.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.MILESTONEDELIVERABLE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceProject = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts';
		$scope.serviceDeliverable = '/services/ts/codbex-projects/gen/codbex-projects/api/Deliverable/DeliverableService.ts';

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
			Dialogs.closeWindow({ id: 'MilestoneDeliverable-details' });
		};
	});
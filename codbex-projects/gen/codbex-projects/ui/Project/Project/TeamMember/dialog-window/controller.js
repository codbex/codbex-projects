angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/TeamMemberService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'TeamMember successfully created';
		let propertySuccessfullyUpdated = 'TeamMember successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'TeamMember Details',
			create: 'Create TeamMember',
			update: 'Update TeamMember'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-projects:codbex-projects-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadSelect', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)' });
			$scope.formHeaders.create = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadCreate', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)' });
			$scope.formHeaders.update = LocaleService.t('codbex-projects:codbex-projects-model.defaults.formHeadUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-projects:codbex-projects-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProject = params.optionsProject;
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsMemberRole = params.optionsMemberRole;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-projects.Project.TeamMember.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.TEAMMEMBER'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.TEAMMEMBER'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToCreate', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)', message: message }),
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
				Dialogs.postMessage({ topic: 'codbex-projects.Project.TeamMember.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.TEAMMEMBER'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-projects:codbex-projects-model.t.TEAMMEMBER'),
					message: LocaleService.t('codbex-projects:codbex-projects-model.messages.error.unableToUpdate', { name: '$t(codbex-projects:codbex-projects-model.t.TEAMMEMBER)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceProject = '/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts';
		$scope.serviceEmployee = '/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts';
		$scope.serviceMemberRole = '/services/ts/codbex-projects/gen/codbex-projects/api/Settings/MemberRoleService.ts';

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
			Dialogs.closeWindow({ id: 'TeamMember-details' });
		};
	});
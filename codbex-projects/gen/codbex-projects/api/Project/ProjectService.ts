import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { ProjectRepository, ProjectEntityOptions } from "../../dao/Project/ProjectRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-projects-Project-Project", ["validate"]);

@Controller
class ProjectService {

    private readonly repository = new ProjectRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: ProjectEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ProjectService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("Project not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("Project not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Name === null || entity.Name === undefined) {
            throw new ValidationError(`The 'Name' property is required, provide a valid value`);
        }
        if (entity.Name?.length > 40) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [40] characters`);
        }
        if (entity.Description?.length > 2000) {
            throw new ValidationError(`The 'Description' exceeds the maximum length of [2000] characters`);
        }
        if (entity.StartingDate === null || entity.StartingDate === undefined) {
            throw new ValidationError(`The 'StartingDate' property is required, provide a valid value`);
        }
        if (entity.EndDate === null || entity.EndDate === undefined) {
            throw new ValidationError(`The 'EndDate' property is required, provide a valid value`);
        }
        if (entity.SponsorName === null || entity.SponsorName === undefined) {
            throw new ValidationError(`The 'SponsorName' property is required, provide a valid value`);
        }
        if (entity.SponsorName?.length > 50) {
            throw new ValidationError(`The 'SponsorName' exceeds the maximum length of [50] characters`);
        }
        if (entity.Opportunity === null || entity.Opportunity === undefined) {
            throw new ValidationError(`The 'Opportunity' property is required, provide a valid value`);
        }
        if (entity.Opportunity?.length > 300) {
            throw new ValidationError(`The 'Opportunity' exceeds the maximum length of [300] characters`);
        }
        if (entity.Scope === null || entity.Scope === undefined) {
            throw new ValidationError(`The 'Scope' property is required, provide a valid value`);
        }
        if (entity.Scope?.length > 200) {
            throw new ValidationError(`The 'Scope' exceeds the maximum length of [200] characters`);
        }
        if (entity.Notes?.length > 2000) {
            throw new ValidationError(`The 'Notes' exceeds the maximum length of [2000] characters`);
        }
        if (entity.AgileMethodology === null || entity.AgileMethodology === undefined) {
            throw new ValidationError(`The 'AgileMethodology' property is required, provide a valid value`);
        }
        if (entity.IterationLenght === null || entity.IterationLenght === undefined) {
            throw new ValidationError(`The 'IterationLenght' property is required, provide a valid value`);
        }
        if (entity.PlanningFrequency === null || entity.PlanningFrequency === undefined) {
            throw new ValidationError(`The 'PlanningFrequency' property is required, provide a valid value`);
        }
        if (entity.PlanningFrequency?.length > 200) {
            throw new ValidationError(`The 'PlanningFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.CustomerInvolvementFrequency === null || entity.CustomerInvolvementFrequency === undefined) {
            throw new ValidationError(`The 'CustomerInvolvementFrequency' property is required, provide a valid value`);
        }
        if (entity.CustomerInvolvementFrequency?.length > 200) {
            throw new ValidationError(`The 'CustomerInvolvementFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.ReleaseCadence === null || entity.ReleaseCadence === undefined) {
            throw new ValidationError(`The 'ReleaseCadence' property is required, provide a valid value`);
        }
        if (entity.ReleaseCadence?.length > 200) {
            throw new ValidationError(`The 'ReleaseCadence' exceeds the maximum length of [200] characters`);
        }
        if (entity.RetrospectiveFrequency === null || entity.RetrospectiveFrequency === undefined) {
            throw new ValidationError(`The 'RetrospectiveFrequency' property is required, provide a valid value`);
        }
        if (entity.RetrospectiveFrequency?.length > 200) {
            throw new ValidationError(`The 'RetrospectiveFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.DailyStandup === null || entity.DailyStandup === undefined) {
            throw new ValidationError(`The 'DailyStandup' property is required, provide a valid value`);
        }
        if (entity.BacklogRefinementFrequency === null || entity.BacklogRefinementFrequency === undefined) {
            throw new ValidationError(`The 'BacklogRefinementFrequency' property is required, provide a valid value`);
        }
        if (entity.BacklogRefinementFrequency?.length > 200) {
            throw new ValidationError(`The 'BacklogRefinementFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.DefectManagement === null || entity.DefectManagement === undefined) {
            throw new ValidationError(`The 'DefectManagement' property is required, provide a valid value`);
        }
        if (entity.DefectManagement?.length > 200) {
            throw new ValidationError(`The 'DefectManagement' exceeds the maximum length of [200] characters`);
        }
        if (entity.DeploymentFrequency === null || entity.DeploymentFrequency === undefined) {
            throw new ValidationError(`The 'DeploymentFrequency' property is required, provide a valid value`);
        }
        if (entity.DeploymentFrequency?.length > 200) {
            throw new ValidationError(`The 'DeploymentFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.TestingIntegration === null || entity.TestingIntegration === undefined) {
            throw new ValidationError(`The 'TestingIntegration' property is required, provide a valid value`);
        }
        if (entity.TestingIntegration?.length > 200) {
            throw new ValidationError(`The 'TestingIntegration' exceeds the maximum length of [200] characters`);
        }
        if (entity.StakeholderReview === null || entity.StakeholderReview === undefined) {
            throw new ValidationError(`The 'StakeholderReview' property is required, provide a valid value`);
        }
        if (entity.StakeholderReview?.length > 200) {
            throw new ValidationError(`The 'StakeholderReview' exceeds the maximum length of [200] characters`);
        }
        if (entity.FeatureCompletionCriteria === null || entity.FeatureCompletionCriteria === undefined) {
            throw new ValidationError(`The 'FeatureCompletionCriteria' property is required, provide a valid value`);
        }
        if (entity.FeatureCompletionCriteria?.length > 200) {
            throw new ValidationError(`The 'FeatureCompletionCriteria' exceeds the maximum length of [200] characters`);
        }
        if (entity.DocumentationUpdates === null || entity.DocumentationUpdates === undefined) {
            throw new ValidationError(`The 'DocumentationUpdates' property is required, provide a valid value`);
        }
        if (entity.DocumentationUpdates?.length > 200) {
            throw new ValidationError(`The 'DocumentationUpdates' exceeds the maximum length of [200] characters`);
        }
        if (entity.SustainableVelocity === null || entity.SustainableVelocity === undefined) {
            throw new ValidationError(`The 'SustainableVelocity' property is required, provide a valid value`);
        }
        if (entity.SustainableVelocity?.length > 200) {
            throw new ValidationError(`The 'SustainableVelocity' exceeds the maximum length of [200] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}

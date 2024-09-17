import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { AgileMethodologyPropertyRepository, AgileMethodologyPropertyEntityOptions } from "../../dao/Settings/AgileMethodologyPropertyRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-projects-Settings-AgileMethodologyProperty", ["validate"]);

@Controller
class AgileMethodologyPropertyService {

    private readonly repository = new AgileMethodologyPropertyRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: AgileMethodologyPropertyEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-projects/gen/codbex-projects/api/Settings/AgileMethodologyPropertyService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("AgileMethodologyProperty not found");
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
                HttpUtils.sendResponseNotFound("AgileMethodologyProperty not found");
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
        if (entity.Name?.length > 20) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [20] characters`);
        }
        if (entity.PlanningFrequency?.length > 200) {
            throw new ValidationError(`The 'PlanningFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.CustomerInvolvementFrequency?.length > 200) {
            throw new ValidationError(`The 'CustomerInvolvementFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.ReleaseCadence?.length > 200) {
            throw new ValidationError(`The 'ReleaseCadence' exceeds the maximum length of [200] characters`);
        }
        if (entity.RetrospectiveFrequency?.length > 200) {
            throw new ValidationError(`The 'RetrospectiveFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.BacklogRefinementFrequency?.length > 200) {
            throw new ValidationError(`The 'BacklogRefinementFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.DefectManagement?.length > 200) {
            throw new ValidationError(`The 'DefectManagement' exceeds the maximum length of [200] characters`);
        }
        if (entity.DeploymentFrequency?.length > 200) {
            throw new ValidationError(`The 'DeploymentFrequency' exceeds the maximum length of [200] characters`);
        }
        if (entity.TestingIntegration?.length > 200) {
            throw new ValidationError(`The 'TestingIntegration' exceeds the maximum length of [200] characters`);
        }
        if (entity.StakeholderReview?.length > 200) {
            throw new ValidationError(`The 'StakeholderReview' exceeds the maximum length of [200] characters`);
        }
        if (entity.FeatureCompletionCriteria?.length > 200) {
            throw new ValidationError(`The 'FeatureCompletionCriteria' exceeds the maximum length of [200] characters`);
        }
        if (entity.DocumentationUpdates?.length > 200) {
            throw new ValidationError(`The 'DocumentationUpdates' exceeds the maximum length of [200] characters`);
        }
        if (entity.SustainableVelocity?.length > 200) {
            throw new ValidationError(`The 'SustainableVelocity' exceeds the maximum length of [200] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}

import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { ForecastRepository, ForecastEntityOptions } from "../../dao/Project/ForecastRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-projects-Project-Forecast", ["validate"]);

@Controller
class ForecastService {

    private readonly repository = new ForecastRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: ForecastEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            let Project = parseInt(ctx.queryParameters.Project);
            Project = isNaN(Project) ? ctx.queryParameters.Project : Project;

            if (Project !== undefined) {
                options.$filter = {
                    equals: {
                        Project: Project
                    }
                };
            }

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
            response.setHeader("Content-Location", "/services/ts/codbex-projects/gen/codbex-projects/api/Project/ForecastService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("Forecast not found");
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
                HttpUtils.sendResponseNotFound("Forecast not found");
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
        if (entity.ForecastedCost === null || entity.ForecastedCost === undefined) {
            throw new ValidationError(`The 'ForecastedCost' property is required, provide a valid value`);
        }
        if (entity.Description?.length > 200) {
            throw new ValidationError(`The 'Description' exceeds the maximum length of [200] characters`);
        }
        if (entity.EarnedValue === null || entity.EarnedValue === undefined) {
            throw new ValidationError(`The 'EarnedValue' property is required, provide a valid value`);
        }
        if (entity.CostPerformanceIndex === null || entity.CostPerformanceIndex === undefined) {
            throw new ValidationError(`The 'CostPerformanceIndex' property is required, provide a valid value`);
        }
        if (entity.SchedulePerformanceIndex === null || entity.SchedulePerformanceIndex === undefined) {
            throw new ValidationError(`The 'SchedulePerformanceIndex' property is required, provide a valid value`);
        }
        if (entity.Project === null || entity.Project === undefined) {
            throw new ValidationError(`The 'Project' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}

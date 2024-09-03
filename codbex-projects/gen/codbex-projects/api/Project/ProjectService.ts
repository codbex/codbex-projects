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
        if (entity.Asassignee === null || entity.Asassignee === undefined) {
            throw new ValidationError(`The 'Asassignee' property is required, provide a valid value`);
        }
        if (entity.Asassignee?.length > 20) {
            throw new ValidationError(`The 'Asassignee' exceeds the maximum length of [20] characters`);
        }
        if (entity.StartingDate === null || entity.StartingDate === undefined) {
            throw new ValidationError(`The 'StartingDate' property is required, provide a valid value`);
        }
        if (entity.TickPeriod === null || entity.TickPeriod === undefined) {
            throw new ValidationError(`The 'TickPeriod' property is required, provide a valid value`);
        }
        if (entity.Resource === null || entity.Resource === undefined) {
            throw new ValidationError(`The 'Resource' property is required, provide a valid value`);
        }
        if (entity.Notes?.length > 200) {
            throw new ValidationError(`The 'Notes' exceeds the maximum length of [200] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}

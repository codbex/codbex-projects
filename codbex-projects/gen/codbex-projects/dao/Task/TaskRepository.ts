import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface TaskEntity {
    readonly Id: number;
    Name: string;
    Description: string;
    Deliverable: number;
    StartDate: Date;
    EndDate: Date;
}

export interface TaskCreateEntity {
    readonly Name: string;
    readonly Description: string;
    readonly Deliverable: number;
    readonly StartDate: Date;
    readonly EndDate: Date;
}

export interface TaskUpdateEntity extends TaskCreateEntity {
    readonly Id: number;
}

export interface TaskEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Deliverable?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Deliverable?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Deliverable?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Deliverable?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Deliverable?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Deliverable?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Deliverable?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
    },
    $select?: (keyof TaskEntity)[],
    $sort?: string | (keyof TaskEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface TaskEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<TaskEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface TaskUpdateEntityEvent extends TaskEntityEvent {
    readonly previousEntity: TaskEntity;
}

export class TaskRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_TASK",
        properties: [
            {
                name: "Id",
                column: "TASK_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "TASK_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "TASK_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Deliverable",
                column: "TASK_DELIVERABLE",
                type: "INTEGER",
                required: true
            },
            {
                name: "StartDate",
                column: "TASK_STARTDATE",
                type: "DATE",
                required: true
            },
            {
                name: "EndDate",
                column: "TASK_ENDDATE",
                type: "DATE",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(TaskRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: TaskEntityOptions): TaskEntity[] {
        return this.dao.list(options).map((e: TaskEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): TaskEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: TaskCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_TASK",
            entity: entity,
            key: {
                name: "Id",
                column: "TASK_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: TaskUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_TASK",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "TASK_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: TaskCreateEntity | TaskUpdateEntity): number {
        const id = (entity as TaskUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as TaskUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_TASK",
            entity: entity,
            key: {
                name: "Id",
                column: "TASK_ID",
                value: id
            }
        });
    }

    public count(options?: TaskEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TASK"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: TaskEntityEvent | TaskUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Task-Task", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Task-Task").send(JSON.stringify(data));
    }
}

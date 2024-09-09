import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface TaskDependencyEntity {
    readonly Id: number;
    Name: string;
    PredecessorTask: number;
    SuccessorTask: number;
    DependencyType?: number;
}

export interface TaskDependencyCreateEntity {
    readonly Name: string;
    readonly PredecessorTask: number;
    readonly SuccessorTask: number;
    readonly DependencyType?: number;
}

export interface TaskDependencyUpdateEntity extends TaskDependencyCreateEntity {
    readonly Id: number;
}

export interface TaskDependencyEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            PredecessorTask?: number | number[];
            SuccessorTask?: number | number[];
            DependencyType?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            PredecessorTask?: number | number[];
            SuccessorTask?: number | number[];
            DependencyType?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            PredecessorTask?: number;
            SuccessorTask?: number;
            DependencyType?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            PredecessorTask?: number;
            SuccessorTask?: number;
            DependencyType?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            PredecessorTask?: number;
            SuccessorTask?: number;
            DependencyType?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            PredecessorTask?: number;
            SuccessorTask?: number;
            DependencyType?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            PredecessorTask?: number;
            SuccessorTask?: number;
            DependencyType?: number;
        };
    },
    $select?: (keyof TaskDependencyEntity)[],
    $sort?: string | (keyof TaskDependencyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface TaskDependencyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<TaskDependencyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface TaskDependencyUpdateEntityEvent extends TaskDependencyEntityEvent {
    readonly previousEntity: TaskDependencyEntity;
}

export class TaskDependencyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_TASKDEPENDENCY",
        properties: [
            {
                name: "Id",
                column: "TASKDEPENDENCY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "TASKDEPENDENCY_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "PredecessorTask",
                column: "TASKDEPENDENCY_PREDECESSORTASK",
                type: "INTEGER",
                required: true
            },
            {
                name: "SuccessorTask",
                column: "TASKDEPENDENCY_SUCCESSORTASK",
                type: "INTEGER",
                required: true
            },
            {
                name: "DependencyType",
                column: "TASKDEPENDENCY_DEPENDENCYTYPE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(TaskDependencyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: TaskDependencyEntityOptions): TaskDependencyEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): TaskDependencyEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: TaskDependencyCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_TASKDEPENDENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "TASKDEPENDENCY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: TaskDependencyUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_TASKDEPENDENCY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "TASKDEPENDENCY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: TaskDependencyCreateEntity | TaskDependencyUpdateEntity): number {
        const id = (entity as TaskDependencyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as TaskDependencyUpdateEntity);
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
            table: "CODBEX_TASKDEPENDENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "TASKDEPENDENCY_ID",
                value: id
            }
        });
    }

    public count(options?: TaskDependencyEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TASKDEPENDENCY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: TaskDependencyEntityEvent | TaskDependencyUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-TaskDependency-TaskDependency", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-TaskDependency-TaskDependency").send(JSON.stringify(data));
    }
}

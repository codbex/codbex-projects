import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ObjectiveEntity {
    readonly Id: number;
    Name?: string;
    Description: string;
    Project?: number;
}

export interface ObjectiveCreateEntity {
    readonly Name?: string;
    readonly Description: string;
    readonly Project?: number;
}

export interface ObjectiveUpdateEntity extends ObjectiveCreateEntity {
    readonly Id: number;
}

export interface ObjectiveEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
    },
    $select?: (keyof ObjectiveEntity)[],
    $sort?: string | (keyof ObjectiveEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ObjectiveEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ObjectiveEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ObjectiveUpdateEntityEvent extends ObjectiveEntityEvent {
    readonly previousEntity: ObjectiveEntity;
}

export class ObjectiveRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_OBJECTIVE",
        properties: [
            {
                name: "Id",
                column: "OBJECTIVE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "OBJECTIVE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "OBJECTIVE_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "OBJECTIVE_PROJECT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ObjectiveRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ObjectiveEntityOptions): ObjectiveEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ObjectiveEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ObjectiveCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_OBJECTIVE",
            entity: entity,
            key: {
                name: "Id",
                column: "OBJECTIVE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ObjectiveUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_OBJECTIVE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "OBJECTIVE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ObjectiveCreateEntity | ObjectiveUpdateEntity): number {
        const id = (entity as ObjectiveUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ObjectiveUpdateEntity);
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
            table: "CODBEX_OBJECTIVE",
            entity: entity,
            key: {
                name: "Id",
                column: "OBJECTIVE_ID",
                value: id
            }
        });
    }

    public count(options?: ObjectiveEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_OBJECTIVE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ObjectiveEntityEvent | ObjectiveUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Objective", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Objective").send(JSON.stringify(data));
    }
}

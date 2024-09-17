import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GoalEntity {
    readonly Id: number;
    Name: string;
    Description: string;
    Importance?: string;
    Project?: number;
}

export interface GoalCreateEntity {
    readonly Name: string;
    readonly Description: string;
    readonly Importance?: string;
    readonly Project?: number;
}

export interface GoalUpdateEntity extends GoalCreateEntity {
    readonly Id: number;
}

export interface GoalEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Importance?: string | string[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Importance?: string | string[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Importance?: string;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Importance?: string;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Importance?: string;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Importance?: string;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Importance?: string;
            Project?: number;
        };
    },
    $select?: (keyof GoalEntity)[],
    $sort?: string | (keyof GoalEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface GoalEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GoalEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface GoalUpdateEntityEvent extends GoalEntityEvent {
    readonly previousEntity: GoalEntity;
}

export class GoalRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GOAL",
        properties: [
            {
                name: "Id",
                column: "GOAL_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "GOAL_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "GOAL_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Importance",
                column: "GOAL_IMPORTANCE",
                type: "VARCHAR",
            },
            {
                name: "Project",
                column: "GOAL_PROJECT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GoalRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GoalEntityOptions): GoalEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GoalEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GoalCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GOAL",
            entity: entity,
            key: {
                name: "Id",
                column: "GOAL_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GoalUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GOAL",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "GOAL_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GoalCreateEntity | GoalUpdateEntity): number {
        const id = (entity as GoalUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GoalUpdateEntity);
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
            table: "CODBEX_GOAL",
            entity: entity,
            key: {
                name: "Id",
                column: "GOAL_ID",
                value: id
            }
        });
    }

    public count(options?: GoalEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GOAL"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GoalEntityEvent | GoalUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Goal", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Goal").send(JSON.stringify(data));
    }
}

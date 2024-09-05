import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CostEntity {
    readonly Id: number;
    Name?: string;
    ActualCost: number;
    CostCategory: number;
    Description?: string;
    Project: number;
}

export interface CostCreateEntity {
    readonly Name?: string;
    readonly ActualCost: number;
    readonly CostCategory: number;
    readonly Description?: string;
    readonly Project: number;
}

export interface CostUpdateEntity extends CostCreateEntity {
    readonly Id: number;
}

export interface CostEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            ActualCost?: number | number[];
            CostCategory?: number | number[];
            Description?: string | string[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            ActualCost?: number | number[];
            CostCategory?: number | number[];
            Description?: string | string[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            ActualCost?: number;
            CostCategory?: number;
            Description?: string;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            ActualCost?: number;
            CostCategory?: number;
            Description?: string;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            ActualCost?: number;
            CostCategory?: number;
            Description?: string;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            ActualCost?: number;
            CostCategory?: number;
            Description?: string;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            ActualCost?: number;
            CostCategory?: number;
            Description?: string;
            Project?: number;
        };
    },
    $select?: (keyof CostEntity)[],
    $sort?: string | (keyof CostEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CostEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CostEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CostUpdateEntityEvent extends CostEntityEvent {
    readonly previousEntity: CostEntity;
}

export class CostRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_COST",
        properties: [
            {
                name: "Id",
                column: "COST_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "COST_NAME",
                type: "VARCHAR",
            },
            {
                name: "ActualCost",
                column: "COST_ACTUALCOST",
                type: "DECIMAL",
                required: true
            },
            {
                name: "CostCategory",
                column: "COST_COSTCATEGORY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Description",
                column: "COST_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Project",
                column: "COST_PROJECT",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CostRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CostEntityOptions): CostEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CostEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CostCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_COST",
            entity: entity,
            key: {
                name: "Id",
                column: "COST_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CostUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_COST",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "COST_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CostCreateEntity | CostUpdateEntity): number {
        const id = (entity as CostUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CostUpdateEntity);
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
            table: "CODBEX_COST",
            entity: entity,
            key: {
                name: "Id",
                column: "COST_ID",
                value: id
            }
        });
    }

    public count(options?: CostEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COST"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CostEntityEvent | CostUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Cost", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Cost").send(JSON.stringify(data));
    }
}

import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DeliverableEntity {
    readonly Id: number;
    Name: string;
    Description: string;
    Project: number;
    CostEstimation: number;
    ActualCost: number;
    Resource?: number;
}

export interface DeliverableCreateEntity {
    readonly Name: string;
    readonly Description: string;
    readonly Project: number;
    readonly CostEstimation: number;
    readonly ActualCost: number;
    readonly Resource?: number;
}

export interface DeliverableUpdateEntity extends DeliverableCreateEntity {
    readonly Id: number;
}

export interface DeliverableEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Project?: number | number[];
            CostEstimation?: number | number[];
            ActualCost?: number | number[];
            Resource?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Project?: number | number[];
            CostEstimation?: number | number[];
            ActualCost?: number | number[];
            Resource?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
            CostEstimation?: number;
            ActualCost?: number;
            Resource?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
            CostEstimation?: number;
            ActualCost?: number;
            Resource?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
            CostEstimation?: number;
            ActualCost?: number;
            Resource?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
            CostEstimation?: number;
            ActualCost?: number;
            Resource?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
            CostEstimation?: number;
            ActualCost?: number;
            Resource?: number;
        };
    },
    $select?: (keyof DeliverableEntity)[],
    $sort?: string | (keyof DeliverableEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DeliverableEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DeliverableEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DeliverableUpdateEntityEvent extends DeliverableEntityEvent {
    readonly previousEntity: DeliverableEntity;
}

export class DeliverableRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DELIVERABLE",
        properties: [
            {
                name: "Id",
                column: "DELIVERABLE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "DELIVERABLE_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "DELIVERABLE_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "DELIVERABLE_PROJECT",
                type: "INTEGER",
                required: true
            },
            {
                name: "CostEstimation",
                column: "DELIVERABLE_COSTESTIMATION",
                type: "DECIMAL",
                required: true
            },
            {
                name: "ActualCost",
                column: "DELIVERABLE_ACTUALCOST",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Resource",
                column: "DELIVERABLE_RESOURCE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DeliverableRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DeliverableEntityOptions): DeliverableEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DeliverableEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DeliverableCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DELIVERABLE",
            entity: entity,
            key: {
                name: "Id",
                column: "DELIVERABLE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DeliverableUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DELIVERABLE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DELIVERABLE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DeliverableCreateEntity | DeliverableUpdateEntity): number {
        const id = (entity as DeliverableUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DeliverableUpdateEntity);
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
            table: "CODBEX_DELIVERABLE",
            entity: entity,
            key: {
                name: "Id",
                column: "DELIVERABLE_ID",
                value: id
            }
        });
    }

    public count(options?: DeliverableEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DELIVERABLE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DeliverableEntityEvent | DeliverableUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Deliverable-Deliverable", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Deliverable-Deliverable").send(JSON.stringify(data));
    }
}

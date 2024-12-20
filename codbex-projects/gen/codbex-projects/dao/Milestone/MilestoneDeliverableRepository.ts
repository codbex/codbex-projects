import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MilestoneDeliverableEntity {
    readonly Id: number;
    Milestone?: number;
    Description?: string;
    Project?: number;
    Deliverable?: number;
}

export interface MilestoneDeliverableCreateEntity {
    readonly Milestone?: number;
    readonly Description?: string;
    readonly Project?: number;
    readonly Deliverable?: number;
}

export interface MilestoneDeliverableUpdateEntity extends MilestoneDeliverableCreateEntity {
    readonly Id: number;
}

export interface MilestoneDeliverableEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Milestone?: number | number[];
            Description?: string | string[];
            Project?: number | number[];
            Deliverable?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Milestone?: number | number[];
            Description?: string | string[];
            Project?: number | number[];
            Deliverable?: number | number[];
        };
        contains?: {
            Id?: number;
            Milestone?: number;
            Description?: string;
            Project?: number;
            Deliverable?: number;
        };
        greaterThan?: {
            Id?: number;
            Milestone?: number;
            Description?: string;
            Project?: number;
            Deliverable?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Milestone?: number;
            Description?: string;
            Project?: number;
            Deliverable?: number;
        };
        lessThan?: {
            Id?: number;
            Milestone?: number;
            Description?: string;
            Project?: number;
            Deliverable?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Milestone?: number;
            Description?: string;
            Project?: number;
            Deliverable?: number;
        };
    },
    $select?: (keyof MilestoneDeliverableEntity)[],
    $sort?: string | (keyof MilestoneDeliverableEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MilestoneDeliverableEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MilestoneDeliverableEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MilestoneDeliverableUpdateEntityEvent extends MilestoneDeliverableEntityEvent {
    readonly previousEntity: MilestoneDeliverableEntity;
}

export class MilestoneDeliverableRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_MILESTONEDELIVERABLE",
        properties: [
            {
                name: "Id",
                column: "MILESTONEDELIVERABLE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Milestone",
                column: "MILESTONEDELIVERABLE_MILESTONE",
                type: "INTEGER",
            },
            {
                name: "Description",
                column: "MILESTONEDELIVERABLE_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Project",
                column: "MILESTONEDELIVERABLE_PROJECT",
                type: "INTEGER",
            },
            {
                name: "Deliverable",
                column: "MILESTONEDELIVERABLE_DELIVERABLE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MilestoneDeliverableRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MilestoneDeliverableEntityOptions): MilestoneDeliverableEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MilestoneDeliverableEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MilestoneDeliverableCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MILESTONEDELIVERABLE",
            entity: entity,
            key: {
                name: "Id",
                column: "MILESTONEDELIVERABLE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MilestoneDeliverableUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MILESTONEDELIVERABLE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MILESTONEDELIVERABLE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MilestoneDeliverableCreateEntity | MilestoneDeliverableUpdateEntity): number {
        const id = (entity as MilestoneDeliverableUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MilestoneDeliverableUpdateEntity);
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
            table: "CODBEX_MILESTONEDELIVERABLE",
            entity: entity,
            key: {
                name: "Id",
                column: "MILESTONEDELIVERABLE_ID",
                value: id
            }
        });
    }

    public count(options?: MilestoneDeliverableEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MILESTONEDELIVERABLE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MilestoneDeliverableEntityEvent | MilestoneDeliverableUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Milestone-MilestoneDeliverable", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Milestone-MilestoneDeliverable").send(JSON.stringify(data));
    }
}

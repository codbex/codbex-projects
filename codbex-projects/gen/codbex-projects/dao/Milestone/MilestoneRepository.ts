import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MilestoneEntity {
    readonly Id: number;
    Name?: string;
    Project: number;
    Description: string;
    Due: Date;
    Status: number;
}

export interface MilestoneCreateEntity {
    readonly Name?: string;
    readonly Project: number;
    readonly Description: string;
    readonly Due: Date;
    readonly Status: number;
}

export interface MilestoneUpdateEntity extends MilestoneCreateEntity {
    readonly Id: number;
}

export interface MilestoneEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            Description?: string | string[];
            Due?: Date | Date[];
            Status?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            Description?: string | string[];
            Due?: Date | Date[];
            Status?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Description?: string;
            Due?: Date;
            Status?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Description?: string;
            Due?: Date;
            Status?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Description?: string;
            Due?: Date;
            Status?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Description?: string;
            Due?: Date;
            Status?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Description?: string;
            Due?: Date;
            Status?: number;
        };
    },
    $select?: (keyof MilestoneEntity)[],
    $sort?: string | (keyof MilestoneEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MilestoneEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MilestoneEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MilestoneUpdateEntityEvent extends MilestoneEntityEvent {
    readonly previousEntity: MilestoneEntity;
}

export class MilestoneRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_MILESTONEPERIOD",
        properties: [
            {
                name: "Id",
                column: "MILESTONEPERIOD_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "MILESTONEPERIOD_NAME",
                type: "VARCHAR",
            },
            {
                name: "Project",
                column: "MILESTONEPERIOD_PROJECT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Description",
                column: "MILESTONEPERIOD_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Due",
                column: "MILESTONEPERIOD_RANGE",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "Status",
                column: "MILESTONEPERIOD_STATUS",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MilestoneRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MilestoneEntityOptions): MilestoneEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MilestoneEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MilestoneCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MILESTONEPERIOD",
            entity: entity,
            key: {
                name: "Id",
                column: "MILESTONEPERIOD_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MilestoneUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MILESTONEPERIOD",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MILESTONEPERIOD_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MilestoneCreateEntity | MilestoneUpdateEntity): number {
        const id = (entity as MilestoneUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MilestoneUpdateEntity);
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
            table: "CODBEX_MILESTONEPERIOD",
            entity: entity,
            key: {
                name: "Id",
                column: "MILESTONEPERIOD_ID",
                value: id
            }
        });
    }

    public count(options?: MilestoneEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MILESTONEPERIOD"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MilestoneEntityEvent | MilestoneUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Milestone-Milestone", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Milestone-Milestone").send(JSON.stringify(data));
    }
}

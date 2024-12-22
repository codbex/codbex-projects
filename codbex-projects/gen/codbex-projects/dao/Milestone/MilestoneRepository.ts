import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface MilestoneEntity {
    readonly Id: number;
    Name?: string;
    Description?: string;
    Date?: Date;
}

export interface MilestoneCreateEntity {
    readonly Name?: string;
    readonly Description?: string;
    readonly Date?: Date;
}

export interface MilestoneUpdateEntity extends MilestoneCreateEntity {
    readonly Id: number;
}

export interface MilestoneEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Date?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Date?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Date?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Date?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Date?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Date?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Date?: Date;
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
        table: "CODBEX_MILESTONE",
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
                name: "Description",
                column: "MILESTONE_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "MILESTONE_DATE",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MilestoneRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MilestoneEntityOptions): MilestoneEntity[] {
        return this.dao.list(options).map((e: MilestoneEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): MilestoneEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: MilestoneCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MILESTONE",
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
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MILESTONE",
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
            table: "CODBEX_MILESTONE",
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MILESTONE"');
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

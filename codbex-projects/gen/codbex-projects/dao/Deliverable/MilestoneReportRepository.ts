import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MilestoneReportEntity {
    readonly Id: number;
    Name: string;
    Implemented?: string;
    Problems?: string;
    Notes?: string;
    Deliverable?: number;
}

export interface MilestoneReportCreateEntity {
    readonly Name: string;
    readonly Implemented?: string;
    readonly Problems?: string;
    readonly Notes?: string;
    readonly Deliverable?: number;
}

export interface MilestoneReportUpdateEntity extends MilestoneReportCreateEntity {
    readonly Id: number;
}

export interface MilestoneReportEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Implemented?: string | string[];
            Problems?: string | string[];
            Notes?: string | string[];
            Deliverable?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Implemented?: string | string[];
            Problems?: string | string[];
            Notes?: string | string[];
            Deliverable?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Implemented?: string;
            Problems?: string;
            Notes?: string;
            Deliverable?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Implemented?: string;
            Problems?: string;
            Notes?: string;
            Deliverable?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Implemented?: string;
            Problems?: string;
            Notes?: string;
            Deliverable?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Implemented?: string;
            Problems?: string;
            Notes?: string;
            Deliverable?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Implemented?: string;
            Problems?: string;
            Notes?: string;
            Deliverable?: number;
        };
    },
    $select?: (keyof MilestoneReportEntity)[],
    $sort?: string | (keyof MilestoneReportEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MilestoneReportEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MilestoneReportEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MilestoneReportUpdateEntityEvent extends MilestoneReportEntityEvent {
    readonly previousEntity: MilestoneReportEntity;
}

export class MilestoneReportRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_MILESTONEREPORT",
        properties: [
            {
                name: "Id",
                column: "MILESTONEREPORT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "MILESTONEREPORT_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Implemented",
                column: "MILESTONEREPORT_IMPLEMENTED",
                type: "VARCHAR",
            },
            {
                name: "Problems",
                column: "MILESTONEREPORT_PROBLEMS",
                type: "VARCHAR",
            },
            {
                name: "Notes",
                column: "MILESTONEREPORT_NOTES",
                type: "VARCHAR",
            },
            {
                name: "Deliverable",
                column: "MILESTONEREPORT_DELIVERABLE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MilestoneReportRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MilestoneReportEntityOptions): MilestoneReportEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MilestoneReportEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MilestoneReportCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MILESTONEREPORT",
            entity: entity,
            key: {
                name: "Id",
                column: "MILESTONEREPORT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MilestoneReportUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MILESTONEREPORT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MILESTONEREPORT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MilestoneReportCreateEntity | MilestoneReportUpdateEntity): number {
        const id = (entity as MilestoneReportUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MilestoneReportUpdateEntity);
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
            table: "CODBEX_MILESTONEREPORT",
            entity: entity,
            key: {
                name: "Id",
                column: "MILESTONEREPORT_ID",
                value: id
            }
        });
    }

    public count(options?: MilestoneReportEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MILESTONEREPORT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MilestoneReportEntityEvent | MilestoneReportUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Deliverable-MilestoneReport", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Deliverable-MilestoneReport").send(JSON.stringify(data));
    }
}

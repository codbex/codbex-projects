import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MilestonePeriodEntity {
    readonly Id: number;
    Name?: string;
    Range?: string;
    Count?: number;
}

export interface MilestonePeriodCreateEntity {
    readonly Name?: string;
    readonly Range?: string;
    readonly Count?: number;
}

export interface MilestonePeriodUpdateEntity extends MilestonePeriodCreateEntity {
    readonly Id: number;
}

export interface MilestonePeriodEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Range?: string | string[];
            Count?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Range?: string | string[];
            Count?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Range?: string;
            Count?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Range?: string;
            Count?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Range?: string;
            Count?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Range?: string;
            Count?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Range?: string;
            Count?: number;
        };
    },
    $select?: (keyof MilestonePeriodEntity)[],
    $sort?: string | (keyof MilestonePeriodEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MilestonePeriodEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MilestonePeriodEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MilestonePeriodUpdateEntityEvent extends MilestonePeriodEntityEvent {
    readonly previousEntity: MilestonePeriodEntity;
}

export class MilestonePeriodRepository {

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
                name: "Range",
                column: "MILESTONEPERIOD_RANGE",
                type: "VARCHAR",
            },
            {
                name: "Count",
                column: "MILESTONEPERIOD_COUNT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MilestonePeriodRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MilestonePeriodEntityOptions): MilestonePeriodEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MilestonePeriodEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MilestonePeriodCreateEntity): number {
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

    public update(entity: MilestonePeriodUpdateEntity): void {
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

    public upsert(entity: MilestonePeriodCreateEntity | MilestonePeriodUpdateEntity): number {
        const id = (entity as MilestonePeriodUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MilestonePeriodUpdateEntity);
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

    public count(options?: MilestonePeriodEntityOptions): number {
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

    private async triggerEvent(data: MilestonePeriodEntityEvent | MilestonePeriodUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-entities-MilestonePeriod", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-entities-MilestonePeriod").send(JSON.stringify(data));
    }
}

import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StakeHolderEntity {
    readonly Id: number;
    Name: string;
    StakeHolderType: number;
    Project: number;
}

export interface StakeHolderCreateEntity {
    readonly Name: string;
    readonly StakeHolderType: number;
    readonly Project: number;
}

export interface StakeHolderUpdateEntity extends StakeHolderCreateEntity {
    readonly Id: number;
}

export interface StakeHolderEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            StakeHolderType?: number | number[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            StakeHolderType?: number | number[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            StakeHolderType?: number;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            StakeHolderType?: number;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            StakeHolderType?: number;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            StakeHolderType?: number;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            StakeHolderType?: number;
            Project?: number;
        };
    },
    $select?: (keyof StakeHolderEntity)[],
    $sort?: string | (keyof StakeHolderEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StakeHolderEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StakeHolderEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StakeHolderUpdateEntityEvent extends StakeHolderEntityEvent {
    readonly previousEntity: StakeHolderEntity;
}

export class StakeHolderRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STAKEHOLDER",
        properties: [
            {
                name: "Id",
                column: "STAKEHOLDER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STAKEHOLDER_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "StakeHolderType",
                column: "STAKEHOLDER_STAKEHOLDERTYPE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Project",
                column: "STAKEHOLDER_PROJECT",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StakeHolderRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StakeHolderEntityOptions): StakeHolderEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StakeHolderEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StakeHolderCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STAKEHOLDER",
            entity: entity,
            key: {
                name: "Id",
                column: "STAKEHOLDER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StakeHolderUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STAKEHOLDER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STAKEHOLDER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StakeHolderCreateEntity | StakeHolderUpdateEntity): number {
        const id = (entity as StakeHolderUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StakeHolderUpdateEntity);
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
            table: "CODBEX_STAKEHOLDER",
            entity: entity,
            key: {
                name: "Id",
                column: "STAKEHOLDER_ID",
                value: id
            }
        });
    }

    public count(options?: StakeHolderEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STAKEHOLDER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StakeHolderEntityEvent | StakeHolderUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-StakeHolder", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-StakeHolder").send(JSON.stringify(data));
    }
}

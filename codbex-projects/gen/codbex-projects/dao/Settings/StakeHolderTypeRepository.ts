import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StakeHolderTypeEntity {
    readonly Id: number;
    Name: string;
}

export interface StakeHolderTypeCreateEntity {
    readonly Name: string;
}

export interface StakeHolderTypeUpdateEntity extends StakeHolderTypeCreateEntity {
    readonly Id: number;
}

export interface StakeHolderTypeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof StakeHolderTypeEntity)[],
    $sort?: string | (keyof StakeHolderTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StakeHolderTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StakeHolderTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StakeHolderTypeUpdateEntityEvent extends StakeHolderTypeEntityEvent {
    readonly previousEntity: StakeHolderTypeEntity;
}

export class StakeHolderTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STAKEHOLDERTYPE",
        properties: [
            {
                name: "Id",
                column: "STAKEHOLDERTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STAKEHOLDERTYPE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StakeHolderTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StakeHolderTypeEntityOptions): StakeHolderTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StakeHolderTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StakeHolderTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STAKEHOLDERTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STAKEHOLDERTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StakeHolderTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STAKEHOLDERTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STAKEHOLDERTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StakeHolderTypeCreateEntity | StakeHolderTypeUpdateEntity): number {
        const id = (entity as StakeHolderTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StakeHolderTypeUpdateEntity);
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
            table: "CODBEX_STAKEHOLDERTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STAKEHOLDERTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: StakeHolderTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STAKEHOLDERTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StakeHolderTypeEntityEvent | StakeHolderTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Settings-StakeHolderType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Settings-StakeHolderType").send(JSON.stringify(data));
    }
}

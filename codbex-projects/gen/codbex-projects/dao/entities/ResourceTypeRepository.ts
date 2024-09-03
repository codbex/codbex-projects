import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ResourceTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface ResourceTypeCreateEntity {
    readonly Name?: string;
}

export interface ResourceTypeUpdateEntity extends ResourceTypeCreateEntity {
    readonly Id: number;
}

export interface ResourceTypeEntityOptions {
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
    $select?: (keyof ResourceTypeEntity)[],
    $sort?: string | (keyof ResourceTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ResourceTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ResourceTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ResourceTypeUpdateEntityEvent extends ResourceTypeEntityEvent {
    readonly previousEntity: ResourceTypeEntity;
}

export class ResourceTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_RESOURCETYPE",
        properties: [
            {
                name: "Id",
                column: "RESOURCETYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "RESOURCETYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ResourceTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ResourceTypeEntityOptions): ResourceTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ResourceTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ResourceTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_RESOURCETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "RESOURCETYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ResourceTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_RESOURCETYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "RESOURCETYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ResourceTypeCreateEntity | ResourceTypeUpdateEntity): number {
        const id = (entity as ResourceTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ResourceTypeUpdateEntity);
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
            table: "CODBEX_RESOURCETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "RESOURCETYPE_ID",
                value: id
            }
        });
    }

    public count(options?: ResourceTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_RESOURCETYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ResourceTypeEntityEvent | ResourceTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-entities-ResourceType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-entities-ResourceType").send(JSON.stringify(data));
    }
}

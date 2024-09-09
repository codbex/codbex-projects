import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ResourceEntity {
    readonly Id: number;
    Name: string;
    Project?: number;
    ResourceType: number;
    ResourceItem: string;
    Quantity: number;
    Price: number;
}

export interface ResourceCreateEntity {
    readonly Name: string;
    readonly Project?: number;
    readonly ResourceType: number;
    readonly ResourceItem: string;
    readonly Quantity: number;
    readonly Price: number;
}

export interface ResourceUpdateEntity extends ResourceCreateEntity {
    readonly Id: number;
}

export interface ResourceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            ResourceType?: number | number[];
            ResourceItem?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            ResourceType?: number | number[];
            ResourceItem?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ResourceType?: number;
            ResourceItem?: string;
            Quantity?: number;
            Price?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ResourceType?: number;
            ResourceItem?: string;
            Quantity?: number;
            Price?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ResourceType?: number;
            ResourceItem?: string;
            Quantity?: number;
            Price?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ResourceType?: number;
            ResourceItem?: string;
            Quantity?: number;
            Price?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ResourceType?: number;
            ResourceItem?: string;
            Quantity?: number;
            Price?: number;
        };
    },
    $select?: (keyof ResourceEntity)[],
    $sort?: string | (keyof ResourceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ResourceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ResourceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ResourceUpdateEntityEvent extends ResourceEntityEvent {
    readonly previousEntity: ResourceEntity;
}

export class ResourceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_RESOURCE",
        properties: [
            {
                name: "Id",
                column: "RESOURCE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "RESOURCE_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "RESOURCE_PROJECT",
                type: "INTEGER",
            },
            {
                name: "ResourceType",
                column: "RESOURCE_RESOURCETYPE",
                type: "INTEGER",
                required: true
            },
            {
                name: "ResourceItem",
                column: "RESOURCE_RESOURCEITEM",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Quantity",
                column: "RESOURCE_QUANTITY",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Price",
                column: "RESOURCE_PRIZE",
                type: "DECIMAL",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ResourceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ResourceEntityOptions): ResourceEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ResourceEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ResourceCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_RESOURCE",
            entity: entity,
            key: {
                name: "Id",
                column: "RESOURCE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ResourceUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_RESOURCE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "RESOURCE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ResourceCreateEntity | ResourceUpdateEntity): number {
        const id = (entity as ResourceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ResourceUpdateEntity);
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
            table: "CODBEX_RESOURCE",
            entity: entity,
            key: {
                name: "Id",
                column: "RESOURCE_ID",
                value: id
            }
        });
    }

    public count(options?: ResourceEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_RESOURCE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ResourceEntityEvent | ResourceUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Resource", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Resource").send(JSON.stringify(data));
    }
}

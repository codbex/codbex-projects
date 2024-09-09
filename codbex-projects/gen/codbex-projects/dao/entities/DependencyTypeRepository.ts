import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DependencyTypeEntity {
    readonly Id: number;
    Name: string;
}

export interface DependencyTypeCreateEntity {
    readonly Name: string;
}

export interface DependencyTypeUpdateEntity extends DependencyTypeCreateEntity {
    readonly Id: number;
}

export interface DependencyTypeEntityOptions {
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
    $select?: (keyof DependencyTypeEntity)[],
    $sort?: string | (keyof DependencyTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DependencyTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DependencyTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DependencyTypeUpdateEntityEvent extends DependencyTypeEntityEvent {
    readonly previousEntity: DependencyTypeEntity;
}

export class DependencyTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DEPENDENCYTYPE",
        properties: [
            {
                name: "Id",
                column: "DEPENDENCYTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "DEPENDENCYTYPE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DependencyTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DependencyTypeEntityOptions): DependencyTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DependencyTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DependencyTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DEPENDENCYTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPENDENCYTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DependencyTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DEPENDENCYTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DEPENDENCYTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DependencyTypeCreateEntity | DependencyTypeUpdateEntity): number {
        const id = (entity as DependencyTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DependencyTypeUpdateEntity);
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
            table: "CODBEX_DEPENDENCYTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPENDENCYTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: DependencyTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DEPENDENCYTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DependencyTypeEntityEvent | DependencyTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-entities-DependencyType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-entities-DependencyType").send(JSON.stringify(data));
    }
}

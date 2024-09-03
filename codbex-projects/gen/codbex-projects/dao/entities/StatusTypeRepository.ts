import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StatusTypeEntity {
    readonly Id: number;
    Name: string;
}

export interface StatusTypeCreateEntity {
    readonly Name: string;
}

export interface StatusTypeUpdateEntity extends StatusTypeCreateEntity {
    readonly Id: number;
}

export interface StatusTypeEntityOptions {
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
    $select?: (keyof StatusTypeEntity)[],
    $sort?: string | (keyof StatusTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StatusTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StatusTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StatusTypeUpdateEntityEvent extends StatusTypeEntityEvent {
    readonly previousEntity: StatusTypeEntity;
}

export class StatusTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STATUSTYPE",
        properties: [
            {
                name: "Id",
                column: "STATUSTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STATUSTYPE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StatusTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StatusTypeEntityOptions): StatusTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StatusTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StatusTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STATUSTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STATUSTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StatusTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STATUSTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STATUSTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StatusTypeCreateEntity | StatusTypeUpdateEntity): number {
        const id = (entity as StatusTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StatusTypeUpdateEntity);
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
            table: "CODBEX_STATUSTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STATUSTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: StatusTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STATUSTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StatusTypeEntityEvent | StatusTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-entities-StatusType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-entities-StatusType").send(JSON.stringify(data));
    }
}

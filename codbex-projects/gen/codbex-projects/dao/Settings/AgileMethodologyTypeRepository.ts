import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AgileMethodologyTypeEntity {
    readonly Id: number;
    Name: string;
}

export interface AgileMethodologyTypeCreateEntity {
    readonly Name: string;
}

export interface AgileMethodologyTypeUpdateEntity extends AgileMethodologyTypeCreateEntity {
    readonly Id: number;
}

export interface AgileMethodologyTypeEntityOptions {
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
    $select?: (keyof AgileMethodologyTypeEntity)[],
    $sort?: string | (keyof AgileMethodologyTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AgileMethodologyTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AgileMethodologyTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AgileMethodologyTypeUpdateEntityEvent extends AgileMethodologyTypeEntityEvent {
    readonly previousEntity: AgileMethodologyTypeEntity;
}

export class AgileMethodologyTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_AGILEMETHODOLOGYTYPE",
        properties: [
            {
                name: "Id",
                column: "AGILEMETHODOLOGYTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "AGILEMETHODOLOGYTYPE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AgileMethodologyTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AgileMethodologyTypeEntityOptions): AgileMethodologyTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AgileMethodologyTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AgileMethodologyTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_AGILEMETHODOLOGYTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGYTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AgileMethodologyTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_AGILEMETHODOLOGYTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGYTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AgileMethodologyTypeCreateEntity | AgileMethodologyTypeUpdateEntity): number {
        const id = (entity as AgileMethodologyTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AgileMethodologyTypeUpdateEntity);
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
            table: "CODBEX_AGILEMETHODOLOGYTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGYTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: AgileMethodologyTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_AGILEMETHODOLOGYTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AgileMethodologyTypeEntityEvent | AgileMethodologyTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Settings-AgileMethodologyType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Settings-AgileMethodologyType").send(JSON.stringify(data));
    }
}

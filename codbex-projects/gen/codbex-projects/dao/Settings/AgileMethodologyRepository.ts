import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AgileMethodologyEntity {
    readonly Id: number;
    Name: string;
}

export interface AgileMethodologyCreateEntity {
    readonly Name: string;
}

export interface AgileMethodologyUpdateEntity extends AgileMethodologyCreateEntity {
    readonly Id: number;
}

export interface AgileMethodologyEntityOptions {
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
    $select?: (keyof AgileMethodologyEntity)[],
    $sort?: string | (keyof AgileMethodologyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AgileMethodologyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AgileMethodologyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AgileMethodologyUpdateEntityEvent extends AgileMethodologyEntityEvent {
    readonly previousEntity: AgileMethodologyEntity;
}

export class AgileMethodologyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_AGILEMETHODOLOGY",
        properties: [
            {
                name: "Id",
                column: "AGILEMETHODOLOGY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "AGILEMETHODOLOGY_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AgileMethodologyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AgileMethodologyEntityOptions): AgileMethodologyEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AgileMethodologyEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AgileMethodologyCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_AGILEMETHODOLOGY",
            entity: entity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AgileMethodologyUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_AGILEMETHODOLOGY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AgileMethodologyCreateEntity | AgileMethodologyUpdateEntity): number {
        const id = (entity as AgileMethodologyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AgileMethodologyUpdateEntity);
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
            table: "CODBEX_AGILEMETHODOLOGY",
            entity: entity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGY_ID",
                value: id
            }
        });
    }

    public count(options?: AgileMethodologyEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_AGILEMETHODOLOGY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AgileMethodologyEntityEvent | AgileMethodologyUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Settings-AgileMethodology", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Settings-AgileMethodology").send(JSON.stringify(data));
    }
}

import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ConstrainEntity {
    readonly Id: number;
    Name: string;
    Description: string;
    Project?: number;
}

export interface ConstrainCreateEntity {
    readonly Name: string;
    readonly Description: string;
    readonly Project?: number;
}

export interface ConstrainUpdateEntity extends ConstrainCreateEntity {
    readonly Id: number;
}

export interface ConstrainEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Project?: number;
        };
    },
    $select?: (keyof ConstrainEntity)[],
    $sort?: string | (keyof ConstrainEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ConstrainEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ConstrainEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ConstrainUpdateEntityEvent extends ConstrainEntityEvent {
    readonly previousEntity: ConstrainEntity;
}

export class ConstrainRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CONSTRAIN",
        properties: [
            {
                name: "Id",
                column: "CONSTRAIN_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CONSTRAIN_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "CONSTRAIN_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "CONSTRAIN_PROJECT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ConstrainRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ConstrainEntityOptions): ConstrainEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ConstrainEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ConstrainCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CONSTRAIN",
            entity: entity,
            key: {
                name: "Id",
                column: "CONSTRAIN_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ConstrainUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CONSTRAIN",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CONSTRAIN_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ConstrainCreateEntity | ConstrainUpdateEntity): number {
        const id = (entity as ConstrainUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ConstrainUpdateEntity);
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
            table: "CODBEX_CONSTRAIN",
            entity: entity,
            key: {
                name: "Id",
                column: "CONSTRAIN_ID",
                value: id
            }
        });
    }

    public count(options?: ConstrainEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CONSTRAIN"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ConstrainEntityEvent | ConstrainUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Constrain", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Constrain").send(JSON.stringify(data));
    }
}

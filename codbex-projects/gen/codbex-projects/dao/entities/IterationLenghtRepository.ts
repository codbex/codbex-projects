import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface IterationLenghtEntity {
    readonly Id: number;
    AgileMethodology: number;
    Period: string;
}

export interface IterationLenghtCreateEntity {
    readonly AgileMethodology: number;
    readonly Period: string;
}

export interface IterationLenghtUpdateEntity extends IterationLenghtCreateEntity {
    readonly Id: number;
}

export interface IterationLenghtEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            AgileMethodology?: number | number[];
            Period?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            AgileMethodology?: number | number[];
            Period?: string | string[];
        };
        contains?: {
            Id?: number;
            AgileMethodology?: number;
            Period?: string;
        };
        greaterThan?: {
            Id?: number;
            AgileMethodology?: number;
            Period?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            AgileMethodology?: number;
            Period?: string;
        };
        lessThan?: {
            Id?: number;
            AgileMethodology?: number;
            Period?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            AgileMethodology?: number;
            Period?: string;
        };
    },
    $select?: (keyof IterationLenghtEntity)[],
    $sort?: string | (keyof IterationLenghtEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface IterationLenghtEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<IterationLenghtEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface IterationLenghtUpdateEntityEvent extends IterationLenghtEntityEvent {
    readonly previousEntity: IterationLenghtEntity;
}

export class IterationLenghtRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ITERATIONLENGHT",
        properties: [
            {
                name: "Id",
                column: "ITERATIONLENGHT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "AgileMethodology",
                column: "ITERATIONLENGHT_AGILEMETHODOLOGY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Period",
                column: "ITERATIONLENGHT_PERIOD",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(IterationLenghtRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: IterationLenghtEntityOptions): IterationLenghtEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): IterationLenghtEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: IterationLenghtCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ITERATIONLENGHT",
            entity: entity,
            key: {
                name: "Id",
                column: "ITERATIONLENGHT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: IterationLenghtUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ITERATIONLENGHT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ITERATIONLENGHT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: IterationLenghtCreateEntity | IterationLenghtUpdateEntity): number {
        const id = (entity as IterationLenghtUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as IterationLenghtUpdateEntity);
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
            table: "CODBEX_ITERATIONLENGHT",
            entity: entity,
            key: {
                name: "Id",
                column: "ITERATIONLENGHT_ID",
                value: id
            }
        });
    }

    public count(options?: IterationLenghtEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ITERATIONLENGHT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: IterationLenghtEntityEvent | IterationLenghtUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-entities-IterationLenght", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-entities-IterationLenght").send(JSON.stringify(data));
    }
}

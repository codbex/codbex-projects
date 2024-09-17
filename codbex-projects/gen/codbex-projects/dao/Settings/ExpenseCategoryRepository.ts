import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ExpenseCategoryEntity {
    readonly Id: number;
    Name: string;
}

export interface ExpenseCategoryCreateEntity {
    readonly Name: string;
}

export interface ExpenseCategoryUpdateEntity extends ExpenseCategoryCreateEntity {
    readonly Id: number;
}

export interface ExpenseCategoryEntityOptions {
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
    $select?: (keyof ExpenseCategoryEntity)[],
    $sort?: string | (keyof ExpenseCategoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ExpenseCategoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ExpenseCategoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ExpenseCategoryUpdateEntityEvent extends ExpenseCategoryEntityEvent {
    readonly previousEntity: ExpenseCategoryEntity;
}

export class ExpenseCategoryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EXPENSECATEGORY",
        properties: [
            {
                name: "Id",
                column: "EXPENSECATEGORY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "EXPENSECATEGORY_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ExpenseCategoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ExpenseCategoryEntityOptions): ExpenseCategoryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ExpenseCategoryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ExpenseCategoryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EXPENSECATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "EXPENSECATEGORY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ExpenseCategoryUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EXPENSECATEGORY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "EXPENSECATEGORY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ExpenseCategoryCreateEntity | ExpenseCategoryUpdateEntity): number {
        const id = (entity as ExpenseCategoryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ExpenseCategoryUpdateEntity);
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
            table: "CODBEX_EXPENSECATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "EXPENSECATEGORY_ID",
                value: id
            }
        });
    }

    public count(options?: ExpenseCategoryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EXPENSECATEGORY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ExpenseCategoryEntityEvent | ExpenseCategoryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Settings-ExpenseCategory", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Settings-ExpenseCategory").send(JSON.stringify(data));
    }
}

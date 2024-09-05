import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ExpenseEntity {
    readonly Id: number;
    Name: string;
    Project: number;
    Employee: number;
    ExpenseCategory?: number;
    Description?: string;
    Amount: number;
    Date: Date;
}

export interface ExpenseCreateEntity {
    readonly Name: string;
    readonly Project: number;
    readonly Employee: number;
    readonly ExpenseCategory?: number;
    readonly Description?: string;
    readonly Amount: number;
    readonly Date: Date;
}

export interface ExpenseUpdateEntity extends ExpenseCreateEntity {
    readonly Id: number;
}

export interface ExpenseEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            Employee?: number | number[];
            ExpenseCategory?: number | number[];
            Description?: string | string[];
            Amount?: number | number[];
            Date?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            Employee?: number | number[];
            ExpenseCategory?: number | number[];
            Description?: string | string[];
            Amount?: number | number[];
            Date?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Employee?: number;
            ExpenseCategory?: number;
            Description?: string;
            Amount?: number;
            Date?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Employee?: number;
            ExpenseCategory?: number;
            Description?: string;
            Amount?: number;
            Date?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Employee?: number;
            ExpenseCategory?: number;
            Description?: string;
            Amount?: number;
            Date?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Employee?: number;
            ExpenseCategory?: number;
            Description?: string;
            Amount?: number;
            Date?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Employee?: number;
            ExpenseCategory?: number;
            Description?: string;
            Amount?: number;
            Date?: Date;
        };
    },
    $select?: (keyof ExpenseEntity)[],
    $sort?: string | (keyof ExpenseEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ExpenseEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ExpenseEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ExpenseUpdateEntityEvent extends ExpenseEntityEvent {
    readonly previousEntity: ExpenseEntity;
}

export class ExpenseRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EXPENSE",
        properties: [
            {
                name: "Id",
                column: "EXPENSE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "EXPENSE_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "EXPENSE_PROJECT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Employee",
                column: "EXPENSE_EMPLOYEE",
                type: "INTEGER",
                required: true
            },
            {
                name: "ExpenseCategory",
                column: "EXPENSE_EXPENSECATEGORY",
                type: "INTEGER",
            },
            {
                name: "Description",
                column: "EXPENSE_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Amount",
                column: "EXPENSE_AMOUNT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Date",
                column: "EXPENSE_DATE",
                type: "DATE",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ExpenseRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ExpenseEntityOptions): ExpenseEntity[] {
        return this.dao.list(options).map((e: ExpenseEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): ExpenseEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: ExpenseCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EXPENSE",
            entity: entity,
            key: {
                name: "Id",
                column: "EXPENSE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ExpenseUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EXPENSE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "EXPENSE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ExpenseCreateEntity | ExpenseUpdateEntity): number {
        const id = (entity as ExpenseUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ExpenseUpdateEntity);
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
            table: "CODBEX_EXPENSE",
            entity: entity,
            key: {
                name: "Id",
                column: "EXPENSE_ID",
                value: id
            }
        });
    }

    public count(options?: ExpenseEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EXPENSE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ExpenseEntityEvent | ExpenseUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Expense", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Expense").send(JSON.stringify(data));
    }
}

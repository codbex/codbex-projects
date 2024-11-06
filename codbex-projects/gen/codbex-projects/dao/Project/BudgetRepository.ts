import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface BudgetEntity {
    readonly Id: number;
    Name: string;
    Project?: number;
    Amount: number;
    CostEstimation: number;
    ContingencyReserves: number;
    ManagementReserves?: number;
    Approval: boolean;
}

export interface BudgetCreateEntity {
    readonly Name: string;
    readonly Project?: number;
    readonly Amount: number;
    readonly CostEstimation: number;
    readonly ContingencyReserves: number;
    readonly ManagementReserves?: number;
    readonly Approval: boolean;
}

export interface BudgetUpdateEntity extends BudgetCreateEntity {
    readonly Id: number;
}

export interface BudgetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            Amount?: number | number[];
            CostEstimation?: number | number[];
            ContingencyReserves?: number | number[];
            ManagementReserves?: number | number[];
            Approval?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            Amount?: number | number[];
            CostEstimation?: number | number[];
            ContingencyReserves?: number | number[];
            ManagementReserves?: number | number[];
            Approval?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Amount?: number;
            CostEstimation?: number;
            ContingencyReserves?: number;
            ManagementReserves?: number;
            Approval?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Amount?: number;
            CostEstimation?: number;
            ContingencyReserves?: number;
            ManagementReserves?: number;
            Approval?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Amount?: number;
            CostEstimation?: number;
            ContingencyReserves?: number;
            ManagementReserves?: number;
            Approval?: boolean;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Amount?: number;
            CostEstimation?: number;
            ContingencyReserves?: number;
            ManagementReserves?: number;
            Approval?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            Amount?: number;
            CostEstimation?: number;
            ContingencyReserves?: number;
            ManagementReserves?: number;
            Approval?: boolean;
        };
    },
    $select?: (keyof BudgetEntity)[],
    $sort?: string | (keyof BudgetEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface BudgetEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<BudgetEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface BudgetUpdateEntityEvent extends BudgetEntityEvent {
    readonly previousEntity: BudgetEntity;
}

export class BudgetRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_BUDGET",
        properties: [
            {
                name: "Id",
                column: "BUDGET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "BUDGET_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "BUDGET_PROJECT",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "BUDGET_AMOUNT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "CostEstimation",
                column: "BUDGET_COSTESTIMATION",
                type: "DECIMAL",
                required: true
            },
            {
                name: "ContingencyReserves",
                column: "BUDGET_CONTINGENCYRESERVES",
                type: "DECIMAL",
                required: true
            },
            {
                name: "ManagementReserves",
                column: "BUDGET_RESERVES",
                type: "DECIMAL",
            },
            {
                name: "Approval",
                column: "BUDGET_APPROVAL",
                type: "BOOLEAN",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(BudgetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: BudgetEntityOptions): BudgetEntity[] {
        return this.dao.list(options).map((e: BudgetEntity) => {
            EntityUtils.setBoolean(e, "Approval");
            return e;
        });
    }

    public findById(id: number): BudgetEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Approval");
        return entity ?? undefined;
    }

    public create(entity: BudgetCreateEntity): number {
        EntityUtils.setBoolean(entity, "Approval");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_BUDGET",
            entity: entity,
            key: {
                name: "Id",
                column: "BUDGET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: BudgetUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Approval");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_BUDGET",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "BUDGET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: BudgetCreateEntity | BudgetUpdateEntity): number {
        const id = (entity as BudgetUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as BudgetUpdateEntity);
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
            table: "CODBEX_BUDGET",
            entity: entity,
            key: {
                name: "Id",
                column: "BUDGET_ID",
                value: id
            }
        });
    }

    public count(options?: BudgetEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_BUDGET"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: BudgetEntityEvent | BudgetUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Budget", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Budget").send(JSON.stringify(data));
    }
}

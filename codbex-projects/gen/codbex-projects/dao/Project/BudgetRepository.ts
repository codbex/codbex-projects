import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface BudgetEntity {
    readonly Id: number;
    Name: string;
    InitialBudget: number;
    CostEstimation: number;
    Reserves?: number;
    IsApproved: boolean;
    Project?: number;
}

export interface BudgetCreateEntity {
    readonly Name: string;
    readonly InitialBudget: number;
    readonly CostEstimation: number;
    readonly Reserves?: number;
    readonly IsApproved: boolean;
    readonly Project?: number;
}

export interface BudgetUpdateEntity extends BudgetCreateEntity {
    readonly Id: number;
}

export interface BudgetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            InitialBudget?: number | number[];
            CostEstimation?: number | number[];
            Reserves?: number | number[];
            IsApproved?: boolean | boolean[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            InitialBudget?: number | number[];
            CostEstimation?: number | number[];
            Reserves?: number | number[];
            IsApproved?: boolean | boolean[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            InitialBudget?: number;
            CostEstimation?: number;
            Reserves?: number;
            IsApproved?: boolean;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            InitialBudget?: number;
            CostEstimation?: number;
            Reserves?: number;
            IsApproved?: boolean;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            InitialBudget?: number;
            CostEstimation?: number;
            Reserves?: number;
            IsApproved?: boolean;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            InitialBudget?: number;
            CostEstimation?: number;
            Reserves?: number;
            IsApproved?: boolean;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            InitialBudget?: number;
            CostEstimation?: number;
            Reserves?: number;
            IsApproved?: boolean;
            Project?: number;
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
                name: "InitialBudget",
                column: "BUDGET_INITIALBUDGET",
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
                name: "Reserves",
                column: "BUDGET_RESERVES",
                type: "DECIMAL",
            },
            {
                name: "IsApproved",
                column: "BUDGET_PROPERTY6",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "Project",
                column: "BUDGET_PROJECT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(BudgetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: BudgetEntityOptions): BudgetEntity[] {
        return this.dao.list(options).map((e: BudgetEntity) => {
            EntityUtils.setBoolean(e, "IsApproved");
            return e;
        });
    }

    public findById(id: number): BudgetEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "IsApproved");
        return entity ?? undefined;
    }

    public create(entity: BudgetCreateEntity): number {
        EntityUtils.setBoolean(entity, "IsApproved");
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
        EntityUtils.setBoolean(entity, "IsApproved");
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

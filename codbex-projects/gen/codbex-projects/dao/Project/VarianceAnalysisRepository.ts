import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface VarianceAnalysisEntity {
    readonly Id: number;
    Name: string;
    Project?: number;
    PlannedCost: number;
    ActualCost: number;
    CostVariance: number;
    AnalysisDate: Date;
    Reason: string;
}

export interface VarianceAnalysisCreateEntity {
    readonly Name: string;
    readonly Project?: number;
    readonly PlannedCost: number;
    readonly ActualCost: number;
    readonly CostVariance: number;
    readonly AnalysisDate: Date;
    readonly Reason: string;
}

export interface VarianceAnalysisUpdateEntity extends VarianceAnalysisCreateEntity {
    readonly Id: number;
}

export interface VarianceAnalysisEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            PlannedCost?: number | number[];
            ActualCost?: number | number[];
            CostVariance?: number | number[];
            AnalysisDate?: Date | Date[];
            Reason?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            PlannedCost?: number | number[];
            ActualCost?: number | number[];
            CostVariance?: number | number[];
            AnalysisDate?: Date | Date[];
            Reason?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Project?: number;
            PlannedCost?: number;
            ActualCost?: number;
            CostVariance?: number;
            AnalysisDate?: Date;
            Reason?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            PlannedCost?: number;
            ActualCost?: number;
            CostVariance?: number;
            AnalysisDate?: Date;
            Reason?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            PlannedCost?: number;
            ActualCost?: number;
            CostVariance?: number;
            AnalysisDate?: Date;
            Reason?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            PlannedCost?: number;
            ActualCost?: number;
            CostVariance?: number;
            AnalysisDate?: Date;
            Reason?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            PlannedCost?: number;
            ActualCost?: number;
            CostVariance?: number;
            AnalysisDate?: Date;
            Reason?: string;
        };
    },
    $select?: (keyof VarianceAnalysisEntity)[],
    $sort?: string | (keyof VarianceAnalysisEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface VarianceAnalysisEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<VarianceAnalysisEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface VarianceAnalysisUpdateEntityEvent extends VarianceAnalysisEntityEvent {
    readonly previousEntity: VarianceAnalysisEntity;
}

export class VarianceAnalysisRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_VARIANCEANALYSIS",
        properties: [
            {
                name: "Id",
                column: "VARIANCEANALYSIS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "VARIANCEANALYSIS_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "VARIANCEANALYSIS_PROJECT",
                type: "INTEGER",
            },
            {
                name: "PlannedCost",
                column: "VARIANCEANALYSIS_PLANNEDCOST",
                type: "DECIMAL",
                required: true
            },
            {
                name: "ActualCost",
                column: "VARIANCEANALYSIS_ACTUALCOST",
                type: "DECIMAL",
                required: true
            },
            {
                name: "CostVariance",
                column: "VARIANCEANALYSIS_COSTVARIANCE",
                type: "DECIMAL",
                required: true
            },
            {
                name: "AnalysisDate",
                column: "VARIANCEANALYSIS_ANALYSISDATE",
                type: "DATE",
                required: true
            },
            {
                name: "Reason",
                column: "VARIANCEANALYSIS_REASON",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(VarianceAnalysisRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: VarianceAnalysisEntityOptions): VarianceAnalysisEntity[] {
        return this.dao.list(options).map((e: VarianceAnalysisEntity) => {
            EntityUtils.setDate(e, "AnalysisDate");
            return e;
        });
    }

    public findById(id: number): VarianceAnalysisEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "AnalysisDate");
        return entity ?? undefined;
    }

    public create(entity: VarianceAnalysisCreateEntity): number {
        EntityUtils.setLocalDate(entity, "AnalysisDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_VARIANCEANALYSIS",
            entity: entity,
            key: {
                name: "Id",
                column: "VARIANCEANALYSIS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: VarianceAnalysisUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "AnalysisDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_VARIANCEANALYSIS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "VARIANCEANALYSIS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: VarianceAnalysisCreateEntity | VarianceAnalysisUpdateEntity): number {
        const id = (entity as VarianceAnalysisUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as VarianceAnalysisUpdateEntity);
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
            table: "CODBEX_VARIANCEANALYSIS",
            entity: entity,
            key: {
                name: "Id",
                column: "VARIANCEANALYSIS_ID",
                value: id
            }
        });
    }

    public count(options?: VarianceAnalysisEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_VARIANCEANALYSIS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: VarianceAnalysisEntityEvent | VarianceAnalysisUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-VarianceAnalysis", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-VarianceAnalysis").send(JSON.stringify(data));
    }
}

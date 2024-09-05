import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ForecastEntity {
    readonly Id: number;
    Name: string;
    Project: number;
    ForecastedCost: number;
    ForecastDate?: Date;
    Description?: string;
    EarnedValue?: number;
    CostPerformanceIndex: number;
    SchedulePerformanceIndex: number;
}

export interface ForecastCreateEntity {
    readonly Name: string;
    readonly Project: number;
    readonly ForecastedCost: number;
    readonly ForecastDate?: Date;
    readonly Description?: string;
    readonly EarnedValue?: number;
    readonly CostPerformanceIndex: number;
    readonly SchedulePerformanceIndex: number;
}

export interface ForecastUpdateEntity extends ForecastCreateEntity {
    readonly Id: number;
}

export interface ForecastEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            ForecastedCost?: number | number[];
            ForecastDate?: Date | Date[];
            Description?: string | string[];
            EarnedValue?: number | number[];
            CostPerformanceIndex?: number | number[];
            SchedulePerformanceIndex?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Project?: number | number[];
            ForecastedCost?: number | number[];
            ForecastDate?: Date | Date[];
            Description?: string | string[];
            EarnedValue?: number | number[];
            CostPerformanceIndex?: number | number[];
            SchedulePerformanceIndex?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ForecastedCost?: number;
            ForecastDate?: Date;
            Description?: string;
            EarnedValue?: number;
            CostPerformanceIndex?: number;
            SchedulePerformanceIndex?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ForecastedCost?: number;
            ForecastDate?: Date;
            Description?: string;
            EarnedValue?: number;
            CostPerformanceIndex?: number;
            SchedulePerformanceIndex?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ForecastedCost?: number;
            ForecastDate?: Date;
            Description?: string;
            EarnedValue?: number;
            CostPerformanceIndex?: number;
            SchedulePerformanceIndex?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ForecastedCost?: number;
            ForecastDate?: Date;
            Description?: string;
            EarnedValue?: number;
            CostPerformanceIndex?: number;
            SchedulePerformanceIndex?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Project?: number;
            ForecastedCost?: number;
            ForecastDate?: Date;
            Description?: string;
            EarnedValue?: number;
            CostPerformanceIndex?: number;
            SchedulePerformanceIndex?: number;
        };
    },
    $select?: (keyof ForecastEntity)[],
    $sort?: string | (keyof ForecastEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ForecastEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ForecastEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ForecastUpdateEntityEvent extends ForecastEntityEvent {
    readonly previousEntity: ForecastEntity;
}

export class ForecastRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_FORECAST",
        properties: [
            {
                name: "Id",
                column: "FORECAST_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "FORECAST_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "FORECAST_PROJECT",
                type: "INTEGER",
                required: true
            },
            {
                name: "ForecastedCost",
                column: "FORECAST_FORECASTEDCOST",
                type: "DECIMAL",
                required: true
            },
            {
                name: "ForecastDate",
                column: "FORECAST_FORECASTDATE",
                type: "DATE",
            },
            {
                name: "Description",
                column: "FORECAST_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "EarnedValue",
                column: "FORECAST_EARNEDVALUE",
                type: "DECIMAL",
            },
            {
                name: "CostPerformanceIndex",
                column: "FORECAST_COSTPERFORMANCEINDEX",
                type: "DECIMAL",
                required: true
            },
            {
                name: "SchedulePerformanceIndex",
                column: "FORECAST_SCHEDULEPERFORMANCEINDEX",
                type: "DECIMAL",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ForecastRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ForecastEntityOptions): ForecastEntity[] {
        return this.dao.list(options).map((e: ForecastEntity) => {
            EntityUtils.setDate(e, "ForecastDate");
            return e;
        });
    }

    public findById(id: number): ForecastEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "ForecastDate");
        return entity ?? undefined;
    }

    public create(entity: ForecastCreateEntity): number {
        EntityUtils.setLocalDate(entity, "ForecastDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_FORECAST",
            entity: entity,
            key: {
                name: "Id",
                column: "FORECAST_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ForecastUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "ForecastDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_FORECAST",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "FORECAST_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ForecastCreateEntity | ForecastUpdateEntity): number {
        const id = (entity as ForecastUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ForecastUpdateEntity);
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
            table: "CODBEX_FORECAST",
            entity: entity,
            key: {
                name: "Id",
                column: "FORECAST_ID",
                value: id
            }
        });
    }

    public count(options?: ForecastEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_FORECAST"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ForecastEntityEvent | ForecastUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Forecast", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Forecast").send(JSON.stringify(data));
    }
}

import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CostCategoryEntity {
    readonly Id: number;
    Name: string;
}

export interface CostCategoryCreateEntity {
    readonly Name: string;
}

export interface CostCategoryUpdateEntity extends CostCategoryCreateEntity {
    readonly Id: number;
}

export interface CostCategoryEntityOptions {
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
    $select?: (keyof CostCategoryEntity)[],
    $sort?: string | (keyof CostCategoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CostCategoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CostCategoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CostCategoryUpdateEntityEvent extends CostCategoryEntityEvent {
    readonly previousEntity: CostCategoryEntity;
}

export class CostCategoryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_COSTCATEGORY",
        properties: [
            {
                name: "Id",
                column: "COSTCATEGORY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "COSTCATEGORY_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CostCategoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CostCategoryEntityOptions): CostCategoryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CostCategoryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CostCategoryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_COSTCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "COSTCATEGORY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CostCategoryUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_COSTCATEGORY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "COSTCATEGORY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CostCategoryCreateEntity | CostCategoryUpdateEntity): number {
        const id = (entity as CostCategoryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CostCategoryUpdateEntity);
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
            table: "CODBEX_COSTCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "COSTCATEGORY_ID",
                value: id
            }
        });
    }

    public count(options?: CostCategoryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COSTCATEGORY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CostCategoryEntityEvent | CostCategoryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Settings-CostCategory", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Settings-CostCategory").send(JSON.stringify(data));
    }
}

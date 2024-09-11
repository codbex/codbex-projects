import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface WorkPackageEntity {
    readonly Id: number;
    Name: string;
    Description: string;
    Task: number;
}

export interface WorkPackageCreateEntity {
    readonly Name: string;
    readonly Description: string;
    readonly Task: number;
}

export interface WorkPackageUpdateEntity extends WorkPackageCreateEntity {
    readonly Id: number;
}

export interface WorkPackageEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Task?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Task?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Task?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Task?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Task?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Task?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Task?: number;
        };
    },
    $select?: (keyof WorkPackageEntity)[],
    $sort?: string | (keyof WorkPackageEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface WorkPackageEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<WorkPackageEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface WorkPackageUpdateEntityEvent extends WorkPackageEntityEvent {
    readonly previousEntity: WorkPackageEntity;
}

export class WorkPackageRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_WORKPACKAGE",
        properties: [
            {
                name: "Id",
                column: "WORKPACKAGE__ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "WORKPACKAGE__NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "WORKPACKAGE__DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Task",
                column: "WORKPACKAGE__TASK",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(WorkPackageRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: WorkPackageEntityOptions): WorkPackageEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): WorkPackageEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: WorkPackageCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_WORKPACKAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "WORKPACKAGE__ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: WorkPackageUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_WORKPACKAGE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "WORKPACKAGE__ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: WorkPackageCreateEntity | WorkPackageUpdateEntity): number {
        const id = (entity as WorkPackageUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as WorkPackageUpdateEntity);
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
            table: "CODBEX_WORKPACKAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "WORKPACKAGE__ID",
                value: id
            }
        });
    }

    public count(options?: WorkPackageEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_WORKPACKAGE_"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: WorkPackageEntityEvent | WorkPackageUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-WorkPackage-WorkPackage", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-WorkPackage-WorkPackage").send(JSON.stringify(data));
    }
}

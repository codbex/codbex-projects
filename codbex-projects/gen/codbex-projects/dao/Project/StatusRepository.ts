import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StatusEntity {
    readonly Id: number;
    StatusType?: number;
    Implemented?: string;
    Problems?: string;
    Project?: number;
}

export interface StatusCreateEntity {
    readonly StatusType?: number;
    readonly Implemented?: string;
    readonly Problems?: string;
    readonly Project?: number;
}

export interface StatusUpdateEntity extends StatusCreateEntity {
    readonly Id: number;
}

export interface StatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            StatusType?: number | number[];
            Implemented?: string | string[];
            Problems?: string | string[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            StatusType?: number | number[];
            Implemented?: string | string[];
            Problems?: string | string[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            StatusType?: number;
            Implemented?: string;
            Problems?: string;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            StatusType?: number;
            Implemented?: string;
            Problems?: string;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            StatusType?: number;
            Implemented?: string;
            Problems?: string;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            StatusType?: number;
            Implemented?: string;
            Problems?: string;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            StatusType?: number;
            Implemented?: string;
            Problems?: string;
            Project?: number;
        };
    },
    $select?: (keyof StatusEntity)[],
    $sort?: string | (keyof StatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StatusUpdateEntityEvent extends StatusEntityEvent {
    readonly previousEntity: StatusEntity;
}

export class StatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STATUS",
        properties: [
            {
                name: "Id",
                column: "STATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "StatusType",
                column: "STATUS_STATUSTYPE",
                type: "INTEGER",
            },
            {
                name: "Implemented",
                column: "STATUS_IMPLEMENTED",
                type: "VARCHAR",
            },
            {
                name: "Problems",
                column: "STATUS_PROBLEMS",
                type: "VARCHAR",
            },
            {
                name: "Project",
                column: "STATUS_PROJECT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StatusEntityOptions): StatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StatusCreateEntity | StatusUpdateEntity): number {
        const id = (entity as StatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StatusUpdateEntity);
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
            table: "CODBEX_STATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STATUS_ID",
                value: id
            }
        });
    }

    public count(options?: StatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StatusEntityEvent | StatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Status", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Status").send(JSON.stringify(data));
    }
}

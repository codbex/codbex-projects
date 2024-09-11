import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StakeHoldersEntity {
    readonly Id: number;
    Name: string;
    Role: string;
    Project: number;
}

export interface StakeHoldersCreateEntity {
    readonly Name: string;
    readonly Role: string;
    readonly Project: number;
}

export interface StakeHoldersUpdateEntity extends StakeHoldersCreateEntity {
    readonly Id: number;
}

export interface StakeHoldersEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Role?: string | string[];
            Project?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Role?: string | string[];
            Project?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Role?: string;
            Project?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Role?: string;
            Project?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Role?: string;
            Project?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Role?: string;
            Project?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Role?: string;
            Project?: number;
        };
    },
    $select?: (keyof StakeHoldersEntity)[],
    $sort?: string | (keyof StakeHoldersEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StakeHoldersEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StakeHoldersEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StakeHoldersUpdateEntityEvent extends StakeHoldersEntityEvent {
    readonly previousEntity: StakeHoldersEntity;
}

export class StakeHoldersRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STAKEHOLDERS",
        properties: [
            {
                name: "Id",
                column: "STAKEHOLDERS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STAKEHOLDERS_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Role",
                column: "STAKEHOLDERS_ROLE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Project",
                column: "STAKEHOLDERS_PROJECT",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StakeHoldersRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StakeHoldersEntityOptions): StakeHoldersEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StakeHoldersEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StakeHoldersCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STAKEHOLDERS",
            entity: entity,
            key: {
                name: "Id",
                column: "STAKEHOLDERS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StakeHoldersUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STAKEHOLDERS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STAKEHOLDERS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StakeHoldersCreateEntity | StakeHoldersUpdateEntity): number {
        const id = (entity as StakeHoldersUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StakeHoldersUpdateEntity);
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
            table: "CODBEX_STAKEHOLDERS",
            entity: entity,
            key: {
                name: "Id",
                column: "STAKEHOLDERS_ID",
                value: id
            }
        });
    }

    public count(options?: StakeHoldersEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STAKEHOLDERS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StakeHoldersEntityEvent | StakeHoldersUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-StakeHolders", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-StakeHolders").send(JSON.stringify(data));
    }
}

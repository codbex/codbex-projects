import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MemberRoleEntity {
    readonly Id: number;
    Name: string;
}

export interface MemberRoleCreateEntity {
    readonly Name: string;
}

export interface MemberRoleUpdateEntity extends MemberRoleCreateEntity {
    readonly Id: number;
}

export interface MemberRoleEntityOptions {
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
    $select?: (keyof MemberRoleEntity)[],
    $sort?: string | (keyof MemberRoleEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MemberRoleEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MemberRoleEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MemberRoleUpdateEntityEvent extends MemberRoleEntityEvent {
    readonly previousEntity: MemberRoleEntity;
}

export class MemberRoleRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_MEMBERROLE",
        properties: [
            {
                name: "Id",
                column: "MEMBERROLE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "MEMBERROLE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MemberRoleRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MemberRoleEntityOptions): MemberRoleEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MemberRoleEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MemberRoleCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MEMBERROLE",
            entity: entity,
            key: {
                name: "Id",
                column: "MEMBERROLE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MemberRoleUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MEMBERROLE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MEMBERROLE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MemberRoleCreateEntity | MemberRoleUpdateEntity): number {
        const id = (entity as MemberRoleUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MemberRoleUpdateEntity);
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
            table: "CODBEX_MEMBERROLE",
            entity: entity,
            key: {
                name: "Id",
                column: "MEMBERROLE_ID",
                value: id
            }
        });
    }

    public count(options?: MemberRoleEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MEMBERROLE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MemberRoleEntityEvent | MemberRoleUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-entities-MemberRole", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-entities-MemberRole").send(JSON.stringify(data));
    }
}

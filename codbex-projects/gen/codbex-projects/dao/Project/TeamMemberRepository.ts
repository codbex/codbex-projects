import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface TeamMemberEntity {
    readonly Id: number;
    Project: number;
    Employee: number;
    MemberRole: number;
}

export interface TeamMemberCreateEntity {
    readonly Project: number;
    readonly Employee: number;
    readonly MemberRole: number;
}

export interface TeamMemberUpdateEntity extends TeamMemberCreateEntity {
    readonly Id: number;
}

export interface TeamMemberEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Project?: number | number[];
            Employee?: number | number[];
            MemberRole?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Project?: number | number[];
            Employee?: number | number[];
            MemberRole?: number | number[];
        };
        contains?: {
            Id?: number;
            Project?: number;
            Employee?: number;
            MemberRole?: number;
        };
        greaterThan?: {
            Id?: number;
            Project?: number;
            Employee?: number;
            MemberRole?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Project?: number;
            Employee?: number;
            MemberRole?: number;
        };
        lessThan?: {
            Id?: number;
            Project?: number;
            Employee?: number;
            MemberRole?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Project?: number;
            Employee?: number;
            MemberRole?: number;
        };
    },
    $select?: (keyof TeamMemberEntity)[],
    $sort?: string | (keyof TeamMemberEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface TeamMemberEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<TeamMemberEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface TeamMemberUpdateEntityEvent extends TeamMemberEntityEvent {
    readonly previousEntity: TeamMemberEntity;
}

export class TeamMemberRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_TEAMMEMBER",
        properties: [
            {
                name: "Id",
                column: "TEAMMEMBER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Project",
                column: "TEAMMEMBER_PROJECT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Employee",
                column: "TEAMMEMBER_EMPLOYEE",
                type: "INTEGER",
                required: true
            },
            {
                name: "MemberRole",
                column: "TEAMMEMBER_MEMBERROLE",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(TeamMemberRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: TeamMemberEntityOptions): TeamMemberEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): TeamMemberEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: TeamMemberCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_TEAMMEMBER",
            entity: entity,
            key: {
                name: "Id",
                column: "TEAMMEMBER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: TeamMemberUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_TEAMMEMBER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "TEAMMEMBER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: TeamMemberCreateEntity | TeamMemberUpdateEntity): number {
        const id = (entity as TeamMemberUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as TeamMemberUpdateEntity);
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
            table: "CODBEX_TEAMMEMBER",
            entity: entity,
            key: {
                name: "Id",
                column: "TEAMMEMBER_ID",
                value: id
            }
        });
    }

    public count(options?: TeamMemberEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TEAMMEMBER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: TeamMemberEntityEvent | TeamMemberUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-TeamMember", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-TeamMember").send(JSON.stringify(data));
    }
}

import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProjectEntity {
    readonly Id: number;
    Name: string;
    Description?: string;
    Employee?: number;
    StartingDate?: Date;
    EndDate: Date;
    MilestonePeriod?: number;
    Version?: number;
    Notes?: string;
}

export interface ProjectCreateEntity {
    readonly Name: string;
    readonly Description?: string;
    readonly Employee?: number;
    readonly StartingDate?: Date;
    readonly EndDate: Date;
    readonly MilestonePeriod?: number;
    readonly Version?: number;
    readonly Notes?: string;
}

export interface ProjectUpdateEntity extends ProjectCreateEntity {
    readonly Id: number;
}

export interface ProjectEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Employee?: number | number[];
            StartingDate?: Date | Date[];
            EndDate?: Date | Date[];
            MilestonePeriod?: number | number[];
            Version?: number | number[];
            Notes?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Employee?: number | number[];
            StartingDate?: Date | Date[];
            EndDate?: Date | Date[];
            MilestonePeriod?: number | number[];
            Version?: number | number[];
            Notes?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Employee?: number;
            StartingDate?: Date;
            EndDate?: Date;
            MilestonePeriod?: number;
            Version?: number;
            Notes?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Employee?: number;
            StartingDate?: Date;
            EndDate?: Date;
            MilestonePeriod?: number;
            Version?: number;
            Notes?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Employee?: number;
            StartingDate?: Date;
            EndDate?: Date;
            MilestonePeriod?: number;
            Version?: number;
            Notes?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Employee?: number;
            StartingDate?: Date;
            EndDate?: Date;
            MilestonePeriod?: number;
            Version?: number;
            Notes?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
            Employee?: number;
            StartingDate?: Date;
            EndDate?: Date;
            MilestonePeriod?: number;
            Version?: number;
            Notes?: string;
        };
    },
    $select?: (keyof ProjectEntity)[],
    $sort?: string | (keyof ProjectEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProjectEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProjectEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProjectUpdateEntityEvent extends ProjectEntityEvent {
    readonly previousEntity: ProjectEntity;
}

export class ProjectRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PROJECT",
        properties: [
            {
                name: "Id",
                column: "PROJECT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PROJECT_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "PROJECT_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Employee",
                column: "PROJECT_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "StartingDate",
                column: "PROJECT_STARTINGDATE",
                type: "TIMESTAMP",
            },
            {
                name: "EndDate",
                column: "PROJECT_ENDDATE",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "MilestonePeriod",
                column: "PROJECT_MILESTONEPERIOD",
                type: "INTEGER",
            },
            {
                name: "Version",
                column: "PROJECT_VERSION",
                type: "DECIMAL",
            },
            {
                name: "Notes",
                column: "PROJECT_NOTES",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProjectRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProjectEntityOptions): ProjectEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProjectEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProjectCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PROJECT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProjectUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PROJECT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PROJECT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProjectCreateEntity | ProjectUpdateEntity): number {
        const id = (entity as ProjectUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProjectUpdateEntity);
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
            table: "CODBEX_PROJECT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECT_ID",
                value: id
            }
        });
    }

    public count(options?: ProjectEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProjectEntityEvent | ProjectUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Project-Project", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Project-Project").send(JSON.stringify(data));
    }
}

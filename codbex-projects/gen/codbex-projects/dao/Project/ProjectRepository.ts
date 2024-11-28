import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ProjectEntity {
    readonly Id: number;
    Name: string;
    Number?: string;
    Description?: string;
    StartingDate?: Date;
    EndDate: Date;
    Status?: number;
    SponsorName: string;
    Opportunity: string;
    Scope: string;
    Version?: number;
    Notes?: string;
    AgileMethodology: number;
    IterationLenght: number;
    PlanningFrequency: string;
    CustomerInvolvementFrequency: string;
    ReleaseCadence: string;
    RetrospectiveFrequency: string;
    DailyStandup?: boolean;
    BacklogRefinementFrequency: string;
    DefectManagement: string;
    DeploymentFrequency: string;
    TestingIntegration: string;
    StakeholderReview: string;
    FeatureCompletionCriteria: string;
    DocumentationUpdates: string;
    SustainableVelocity: string;
}

export interface ProjectCreateEntity {
    readonly Name: string;
    readonly Description?: string;
    readonly StartingDate?: Date;
    readonly EndDate: Date;
    readonly Status?: number;
    readonly SponsorName: string;
    readonly Opportunity: string;
    readonly Scope: string;
    readonly Version?: number;
    readonly Notes?: string;
    readonly AgileMethodology: number;
    readonly IterationLenght: number;
    readonly PlanningFrequency: string;
    readonly CustomerInvolvementFrequency: string;
    readonly ReleaseCadence: string;
    readonly RetrospectiveFrequency: string;
    readonly DailyStandup?: boolean;
    readonly BacklogRefinementFrequency: string;
    readonly DefectManagement: string;
    readonly DeploymentFrequency: string;
    readonly TestingIntegration: string;
    readonly StakeholderReview: string;
    readonly FeatureCompletionCriteria: string;
    readonly DocumentationUpdates: string;
    readonly SustainableVelocity: string;
}

export interface ProjectUpdateEntity extends ProjectCreateEntity {
    readonly Id: number;
}

export interface ProjectEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Description?: string | string[];
            StartingDate?: Date | Date[];
            EndDate?: Date | Date[];
            Status?: number | number[];
            SponsorName?: string | string[];
            Opportunity?: string | string[];
            Scope?: string | string[];
            Version?: number | number[];
            Notes?: string | string[];
            AgileMethodology?: number | number[];
            IterationLenght?: number | number[];
            PlanningFrequency?: string | string[];
            CustomerInvolvementFrequency?: string | string[];
            ReleaseCadence?: string | string[];
            RetrospectiveFrequency?: string | string[];
            DailyStandup?: boolean | boolean[];
            BacklogRefinementFrequency?: string | string[];
            DefectManagement?: string | string[];
            DeploymentFrequency?: string | string[];
            TestingIntegration?: string | string[];
            StakeholderReview?: string | string[];
            FeatureCompletionCriteria?: string | string[];
            DocumentationUpdates?: string | string[];
            SustainableVelocity?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Description?: string | string[];
            StartingDate?: Date | Date[];
            EndDate?: Date | Date[];
            Status?: number | number[];
            SponsorName?: string | string[];
            Opportunity?: string | string[];
            Scope?: string | string[];
            Version?: number | number[];
            Notes?: string | string[];
            AgileMethodology?: number | number[];
            IterationLenght?: number | number[];
            PlanningFrequency?: string | string[];
            CustomerInvolvementFrequency?: string | string[];
            ReleaseCadence?: string | string[];
            RetrospectiveFrequency?: string | string[];
            DailyStandup?: boolean | boolean[];
            BacklogRefinementFrequency?: string | string[];
            DefectManagement?: string | string[];
            DeploymentFrequency?: string | string[];
            TestingIntegration?: string | string[];
            StakeholderReview?: string | string[];
            FeatureCompletionCriteria?: string | string[];
            DocumentationUpdates?: string | string[];
            SustainableVelocity?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Description?: string;
            StartingDate?: Date;
            EndDate?: Date;
            Status?: number;
            SponsorName?: string;
            Opportunity?: string;
            Scope?: string;
            Version?: number;
            Notes?: string;
            AgileMethodology?: number;
            IterationLenght?: number;
            PlanningFrequency?: string;
            CustomerInvolvementFrequency?: string;
            ReleaseCadence?: string;
            RetrospectiveFrequency?: string;
            DailyStandup?: boolean;
            BacklogRefinementFrequency?: string;
            DefectManagement?: string;
            DeploymentFrequency?: string;
            TestingIntegration?: string;
            StakeholderReview?: string;
            FeatureCompletionCriteria?: string;
            DocumentationUpdates?: string;
            SustainableVelocity?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Description?: string;
            StartingDate?: Date;
            EndDate?: Date;
            Status?: number;
            SponsorName?: string;
            Opportunity?: string;
            Scope?: string;
            Version?: number;
            Notes?: string;
            AgileMethodology?: number;
            IterationLenght?: number;
            PlanningFrequency?: string;
            CustomerInvolvementFrequency?: string;
            ReleaseCadence?: string;
            RetrospectiveFrequency?: string;
            DailyStandup?: boolean;
            BacklogRefinementFrequency?: string;
            DefectManagement?: string;
            DeploymentFrequency?: string;
            TestingIntegration?: string;
            StakeholderReview?: string;
            FeatureCompletionCriteria?: string;
            DocumentationUpdates?: string;
            SustainableVelocity?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Description?: string;
            StartingDate?: Date;
            EndDate?: Date;
            Status?: number;
            SponsorName?: string;
            Opportunity?: string;
            Scope?: string;
            Version?: number;
            Notes?: string;
            AgileMethodology?: number;
            IterationLenght?: number;
            PlanningFrequency?: string;
            CustomerInvolvementFrequency?: string;
            ReleaseCadence?: string;
            RetrospectiveFrequency?: string;
            DailyStandup?: boolean;
            BacklogRefinementFrequency?: string;
            DefectManagement?: string;
            DeploymentFrequency?: string;
            TestingIntegration?: string;
            StakeholderReview?: string;
            FeatureCompletionCriteria?: string;
            DocumentationUpdates?: string;
            SustainableVelocity?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Description?: string;
            StartingDate?: Date;
            EndDate?: Date;
            Status?: number;
            SponsorName?: string;
            Opportunity?: string;
            Scope?: string;
            Version?: number;
            Notes?: string;
            AgileMethodology?: number;
            IterationLenght?: number;
            PlanningFrequency?: string;
            CustomerInvolvementFrequency?: string;
            ReleaseCadence?: string;
            RetrospectiveFrequency?: string;
            DailyStandup?: boolean;
            BacklogRefinementFrequency?: string;
            DefectManagement?: string;
            DeploymentFrequency?: string;
            TestingIntegration?: string;
            StakeholderReview?: string;
            FeatureCompletionCriteria?: string;
            DocumentationUpdates?: string;
            SustainableVelocity?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Description?: string;
            StartingDate?: Date;
            EndDate?: Date;
            Status?: number;
            SponsorName?: string;
            Opportunity?: string;
            Scope?: string;
            Version?: number;
            Notes?: string;
            AgileMethodology?: number;
            IterationLenght?: number;
            PlanningFrequency?: string;
            CustomerInvolvementFrequency?: string;
            ReleaseCadence?: string;
            RetrospectiveFrequency?: string;
            DailyStandup?: boolean;
            BacklogRefinementFrequency?: string;
            DefectManagement?: string;
            DeploymentFrequency?: string;
            TestingIntegration?: string;
            StakeholderReview?: string;
            FeatureCompletionCriteria?: string;
            DocumentationUpdates?: string;
            SustainableVelocity?: string;
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
                name: "Number",
                column: "PROJECT_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "PROJECT_DESCRIPTION",
                type: "VARCHAR",
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
                name: "Status",
                column: "PROJECT_STATUS",
                type: "INTEGER",
            },
            {
                name: "SponsorName",
                column: "PROJECT_SPONSORNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Opportunity",
                column: "PROJECT_OPPORTUNITY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Scope",
                column: "PROJECT_SCOPE",
                type: "VARCHAR",
                required: true
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
            },
            {
                name: "AgileMethodology",
                column: "PROJECT_AGILEMETHODOLOGY",
                type: "INTEGER",
                required: true
            },
            {
                name: "IterationLenght",
                column: "PROJECT_ITERATIONLENGHT",
                type: "INTEGER",
                required: true
            },
            {
                name: "PlanningFrequency",
                column: "PROJECT_PLANNINGFREQUENCY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "CustomerInvolvementFrequency",
                column: "PROJECT_CUSTOMERINVOLVEMENTFREQUENCY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "ReleaseCadence",
                column: "PROJECT_RELEASECADENCE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "RetrospectiveFrequency",
                column: "PROJECT_RETROSPECTIVEFREQUENCY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DailyStandup",
                column: "PROJECT_DAILYSTANDUP",
                type: "BOOLEAN",
            },
            {
                name: "BacklogRefinementFrequency",
                column: "PROJECT_BACKLOGREFINEMENTFREQUENCY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DefectManagement",
                column: "PROJECT_DEFECTMANAGEMENT",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DeploymentFrequency",
                column: "PROJECT_DEPLOYMENTFREQUENCY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "TestingIntegration",
                column: "PROJECT_TESTINGINTEGRATION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "StakeholderReview",
                column: "PROJECT_STAKEHOLDERREVIEW",
                type: "VARCHAR",
                required: true
            },
            {
                name: "FeatureCompletionCriteria",
                column: "PROJECT_FEATURECOMPLETIONCRITERIA",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DocumentationUpdates",
                column: "PROJECT_DOCUMENTATIONUPDATES",
                type: "VARCHAR",
                required: true
            },
            {
                name: "SustainableVelocity",
                column: "PROJECT_SUSTAINABLEVELOCITY",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProjectRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProjectEntityOptions): ProjectEntity[] {
        return this.dao.list(options).map((e: ProjectEntity) => {
            EntityUtils.setBoolean(e, "DailyStandup");
            return e;
        });
    }

    public findById(id: number): ProjectEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "DailyStandup");
        return entity ?? undefined;
    }

    public create(entity: ProjectCreateEntity): number {
        EntityUtils.setBoolean(entity, "DailyStandup");
        // @ts-ignore
        (entity as ProjectEntity).Number = new NumberGeneratorService().generate(31);
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
        EntityUtils.setBoolean(entity, "DailyStandup");
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

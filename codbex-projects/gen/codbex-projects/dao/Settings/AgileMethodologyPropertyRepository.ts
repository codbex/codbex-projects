import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AgileMethodologyPropertyEntity {
    readonly Id: number;
    Name: string;
    AgileMethodologyType?: number;
    IterationLength?: number;
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
    SustainableVelocity?: number;
}

export interface AgileMethodologyPropertyCreateEntity {
    readonly Name: string;
    readonly AgileMethodologyType?: number;
    readonly IterationLength?: number;
    readonly PlanningFrequency?: string;
    readonly CustomerInvolvementFrequency?: string;
    readonly ReleaseCadence?: string;
    readonly RetrospectiveFrequency?: string;
    readonly DailyStandup?: boolean;
    readonly BacklogRefinementFrequency?: string;
    readonly DefectManagement?: string;
    readonly DeploymentFrequency?: string;
    readonly TestingIntegration?: string;
    readonly StakeholderReview?: string;
    readonly FeatureCompletionCriteria?: string;
    readonly DocumentationUpdates?: string;
    readonly SustainableVelocity?: number;
}

export interface AgileMethodologyPropertyUpdateEntity extends AgileMethodologyPropertyCreateEntity {
    readonly Id: number;
}

export interface AgileMethodologyPropertyEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            AgileMethodologyType?: number | number[];
            IterationLength?: number | number[];
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
            SustainableVelocity?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            AgileMethodologyType?: number | number[];
            IterationLength?: number | number[];
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
            SustainableVelocity?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            AgileMethodologyType?: number;
            IterationLength?: number;
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
            SustainableVelocity?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            AgileMethodologyType?: number;
            IterationLength?: number;
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
            SustainableVelocity?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            AgileMethodologyType?: number;
            IterationLength?: number;
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
            SustainableVelocity?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            AgileMethodologyType?: number;
            IterationLength?: number;
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
            SustainableVelocity?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            AgileMethodologyType?: number;
            IterationLength?: number;
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
            SustainableVelocity?: number;
        };
    },
    $select?: (keyof AgileMethodologyPropertyEntity)[],
    $sort?: string | (keyof AgileMethodologyPropertyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AgileMethodologyPropertyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AgileMethodologyPropertyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AgileMethodologyPropertyUpdateEntityEvent extends AgileMethodologyPropertyEntityEvent {
    readonly previousEntity: AgileMethodologyPropertyEntity;
}

export class AgileMethodologyPropertyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_AGILEMETHODOLOGYPROPERTY",
        properties: [
            {
                name: "Id",
                column: "AGILEMETHODOLOGYPROPERTY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "AGILEMETHODOLOGYPROPERTY_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "AgileMethodologyType",
                column: "AGILEMETHODOLOGYPROPERTY_AGILEMETHODOLOGYTYPE",
                type: "INTEGER",
            },
            {
                name: "IterationLength",
                column: "AGILEMETHODOLOGYPROPERTY_ITERATIONLENGTH",
                type: "INTEGER",
            },
            {
                name: "PlanningFrequency",
                column: "AGILEMETHODOLOGYPROPERTY_PLANNINGFREQUENCY",
                type: "VARCHAR",
            },
            {
                name: "CustomerInvolvementFrequency",
                column: "AGILEMETHODOLOGYPROPERTY_CUSTOMERINVOLVEMENTFREQUENCY",
                type: "VARCHAR",
            },
            {
                name: "ReleaseCadence",
                column: "AGILEMETHODOLOGYPROPERTY_RELEASECADENCE",
                type: "VARCHAR",
            },
            {
                name: "RetrospectiveFrequency",
                column: "AGILEMETHODOLOGYPROPERTY_RETROSPECTIVEFREQUENCY",
                type: "VARCHAR",
            },
            {
                name: "DailyStandup",
                column: "AGILEMETHODOLOGYPROPERTY_DAILYSTANDUP",
                type: "BOOLEAN",
            },
            {
                name: "BacklogRefinementFrequency",
                column: "AGILEMETHODOLOGYPROPERTY_BACKLOGREFINEMENTFREQUENCY",
                type: "VARCHAR",
            },
            {
                name: "DefectManagement",
                column: "AGILEMETHODOLOGYPROPERTY_DEFECTMANAGEMENT",
                type: "VARCHAR",
            },
            {
                name: "DeploymentFrequency",
                column: "AGILEMETHODOLOGYPROPERTY_DEPLOYMENTFREQUENCY",
                type: "VARCHAR",
            },
            {
                name: "TestingIntegration",
                column: "AGILEMETHODOLOGYPROPERTY_TESTINGINTEGRATION",
                type: "VARCHAR",
            },
            {
                name: "StakeholderReview",
                column: "AGILEMETHODOLOGYPROPERTY_STAKEHOLDERREVIEW",
                type: "VARCHAR",
            },
            {
                name: "FeatureCompletionCriteria",
                column: "AGILEMETHODOLOGYPROPERTY_FEATURECOMPLETIONCRITERIA",
                type: "VARCHAR",
            },
            {
                name: "DocumentationUpdates",
                column: "AGILEMETHODOLOGYPROPERTY_DOCUMENTATIONUPDATES",
                type: "VARCHAR",
            },
            {
                name: "SustainableVelocity",
                column: "AGILEMETHODOLOGYPROPERTY_SUSTAINABLEVELOCITY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AgileMethodologyPropertyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AgileMethodologyPropertyEntityOptions): AgileMethodologyPropertyEntity[] {
        return this.dao.list(options).map((e: AgileMethodologyPropertyEntity) => {
            EntityUtils.setBoolean(e, "DailyStandup");
            return e;
        });
    }

    public findById(id: number): AgileMethodologyPropertyEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "DailyStandup");
        return entity ?? undefined;
    }

    public create(entity: AgileMethodologyPropertyCreateEntity): number {
        EntityUtils.setBoolean(entity, "DailyStandup");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_AGILEMETHODOLOGYPROPERTY",
            entity: entity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGYPROPERTY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AgileMethodologyPropertyUpdateEntity): void {
        EntityUtils.setBoolean(entity, "DailyStandup");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_AGILEMETHODOLOGYPROPERTY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGYPROPERTY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AgileMethodologyPropertyCreateEntity | AgileMethodologyPropertyUpdateEntity): number {
        const id = (entity as AgileMethodologyPropertyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AgileMethodologyPropertyUpdateEntity);
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
            table: "CODBEX_AGILEMETHODOLOGYPROPERTY",
            entity: entity,
            key: {
                name: "Id",
                column: "AGILEMETHODOLOGYPROPERTY_ID",
                value: id
            }
        });
    }

    public count(options?: AgileMethodologyPropertyEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_AGILEMETHODOLOGYPROPERTY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AgileMethodologyPropertyEntityEvent | AgileMethodologyPropertyUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-projects-Settings-AgileMethodologyProperty", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-projects-Settings-AgileMethodologyProperty").send(JSON.stringify(data));
    }
}

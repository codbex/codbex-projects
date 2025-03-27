import { Query, NamedQueryParameter } from "sdk/db";

export interface ProjectReport {
    readonly 'Project': string;
    readonly 'Status': string;
    readonly 'TotalBudget': number;
    readonly 'TotalContingencyReserves': number;
    readonly 'TotalExpense': number;
    readonly 'RemainingBudgetWithoutReserves': number;
    readonly 'RemainingBudgetWithReserves': number;
}

export interface ProjectReportFilter {
    readonly 'PROJECT_NAME?': string;
}

export interface ProjectReportPaginatedFilter extends ProjectReportFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class ProjectReportRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: ProjectReportPaginatedFilter): ProjectReport[] {
        const sql = `
            SELECT codbexProject.PROJECT_NAME as "Project", codbexStatusType.STATUSTYPE_NAME as "Status", SUM(codbexBudget.SUM(BUDGET_AMOUNT)) as "TotalBudget", SUM(codbexBudget.SUM(BUDGET_CONTINGENCYRESERVES)) as "TotalContingencyReserves", SUM(codbexExpense.SUM(EXPENSE_AMOUNT)) as "TotalExpense", null.(COALESCE(SUM(codbexBudget.BUDGET_AMOUNT), 0) - COALESCE(SUM(codbexBudget.BUDGET_CONTINGENCYRESERVES), 0) - COALESCE(SUM(codbexExpense.EXPENSE_AMOUNT), 0)) as "RemainingBudgetWithoutReserves", null.(COALESCE(SUM(codbexBudget.BUDGET_AMOUNT), 0) - COALESCE(SUM(codbexExpense.EXPENSE_AMOUNT), 0)) as "RemainingBudgetWithReserves"
            FROM CODBEX_PROJECT as codbexProject
              LEFT JOIN undefined codbexBudget ON undefined
              LEFT JOIN undefined codbexExpense ON undefined
              LEFT JOIN undefined codbexStatusType ON undefined
            WHERE codbexProject.PROJECT_NAME LIKE :PROJECT_NAME
            GROUP BY codbexProject.PROJECT_NAME, codbexStatusType.STATUSTYPE_NAME
            ORDER BY codbexProject.PROJECT_NAME ASC
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `PROJECT_NAME`,
            type: `VARCHAR`,
            value: filter['PROJECT_NAME'] !== undefined ?  `%${filter['PROJECT_NAME']}%` : `%`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: ProjectReportFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT codbexProject.PROJECT_NAME as "Project", codbexStatusType.STATUSTYPE_NAME as "Status", SUM(codbexBudget.SUM(BUDGET_AMOUNT)) as "TotalBudget", SUM(codbexBudget.SUM(BUDGET_CONTINGENCYRESERVES)) as "TotalContingencyReserves", SUM(codbexExpense.SUM(EXPENSE_AMOUNT)) as "TotalExpense", null.(COALESCE(SUM(codbexBudget.BUDGET_AMOUNT), 0) - COALESCE(SUM(codbexBudget.BUDGET_CONTINGENCYRESERVES), 0) - COALESCE(SUM(codbexExpense.EXPENSE_AMOUNT), 0)) as "RemainingBudgetWithoutReserves", null.(COALESCE(SUM(codbexBudget.BUDGET_AMOUNT), 0) - COALESCE(SUM(codbexExpense.EXPENSE_AMOUNT), 0)) as "RemainingBudgetWithReserves"
                FROM CODBEX_PROJECT as codbexProject
                  LEFT JOIN undefined codbexBudget ON undefined
                  LEFT JOIN undefined codbexExpense ON undefined
                  LEFT JOIN undefined codbexStatusType ON undefined
                WHERE codbexProject.PROJECT_NAME LIKE :PROJECT_NAME
                GROUP BY codbexProject.PROJECT_NAME, codbexStatusType.STATUSTYPE_NAME
                ORDER BY codbexProject.PROJECT_NAME ASC
            )
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `PROJECT_NAME`,
            type: `VARCHAR`,
            value: filter.PROJECT_NAME !== undefined ?  `%${filter.PROJECT_NAME}%` : `%`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}
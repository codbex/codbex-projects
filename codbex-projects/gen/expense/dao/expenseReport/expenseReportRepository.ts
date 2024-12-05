import { Query, NamedQueryParameter } from "sdk/db";

export interface expenseReport {
    readonly 'Project': number;
    readonly 'Category': string;
    readonly 'Expense': string;
    readonly 'Amount': number;
    readonly 'Employee': string;
    readonly 'Date': Date;
    readonly 'Status': string;
}

export interface expenseReportFilter {
    readonly 'DATE?': Date;
    readonly 'STATUS?': string;
}

export interface expenseReportPaginatedFilter extends expenseReportFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class expenseReportRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: expenseReportPaginatedFilter): expenseReport[] {
        const sql = `
            SELECT codbexProject.PROJECT_ID as "Project", codbexExpensecategory.EXPENSECATEGORY_NAME as "Category", codbexExpense.EXPENSE_NAME as "Expense", codbexExpense.EXPENSE_AMOUNT as "Amount", codbexEmployee.EMPLOYEE_FIRSTNAME as "Employee", codbexExpense.EXPENSE_DATE as "Date", codbexApprovalstatus.APPROVALSTATUS_NAME as "Status"
            FROM CODBEX_EXPENSE as codbexExpense
              INNER JOIN CODBEX_APPROVALSTATUS codbexApprovalstatus ON codbexExpense.EXPENSE_STATUS=codbexApprovalstatus.APPROVALSTATUS_ID
              INNER JOIN CODBEX_EMPLOYEE codbexEmployee ON codbexExpense.EXPENSE_EMPLOYEE=codbexEmployee.EMPLOYEE_ID
              INNER JOIN CODBEX_PROJECT codbexProject ON codbexExpense.EXPENSE_PROJECT=codbexProject.PROJECT_ID
              INNER JOIN CODBEX_EXPENSECATEGORY codbexExpensecategory ON codbexExpense.EXPENSE_EXPENSECATEGORY=codbexExpensecategory.EXPENSECATEGORY_ID
            WHERE codbexExpense.EXPENSE_DATE > :DATE AND codbexApprovalstatus.APPROVALSTATUS_NAME = :STATUS
            ORDER BY EXPENSE_AMOUNT DESC
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `DATE`,
            type: `DATE`,
            value: filter['DATE'] !== undefined ?  filter['DATE'] : `2024-01-01`
        });
        parameters.push({
            name: `STATUS`,
            type: `VARCHAR`,
            value: filter['STATUS'] !== undefined ?  filter['STATUS'] : `Pending`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: expenseReportFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT codbexProject.PROJECT_ID as "Project", codbexExpensecategory.EXPENSECATEGORY_NAME as "Category", codbexExpense.EXPENSE_NAME as "Expense", codbexExpense.EXPENSE_AMOUNT as "Amount", codbexEmployee.EMPLOYEE_FIRSTNAME as "Employee", codbexExpense.EXPENSE_DATE as "Date", codbexApprovalstatus.APPROVALSTATUS_NAME as "Status"
                FROM CODBEX_EXPENSE as codbexExpense
                  INNER JOIN CODBEX_APPROVALSTATUS codbexApprovalstatus ON codbexExpense.EXPENSE_STATUS=codbexApprovalstatus.APPROVALSTATUS_ID
                  INNER JOIN CODBEX_EMPLOYEE codbexEmployee ON codbexExpense.EXPENSE_EMPLOYEE=codbexEmployee.EMPLOYEE_ID
                  INNER JOIN CODBEX_PROJECT codbexProject ON codbexExpense.EXPENSE_PROJECT=codbexProject.PROJECT_ID
                  INNER JOIN CODBEX_EXPENSECATEGORY codbexExpensecategory ON codbexExpense.EXPENSE_EXPENSECATEGORY=codbexExpensecategory.EXPENSECATEGORY_ID
                WHERE codbexExpense.EXPENSE_DATE > :DATE AND codbexApprovalstatus.APPROVALSTATUS_NAME = :STATUS
                ORDER BY EXPENSE_AMOUNT DESC
            )
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `DATE`,
            type: `DATE`,
            value: filter.DATE !== undefined ?  filter.DATE : `2024-01-01`
        });
        parameters.push({
            name: `STATUS`,
            type: `VARCHAR`,
            value: filter.STATUS !== undefined ?  filter.STATUS : `Pending`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}
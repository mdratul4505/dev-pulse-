import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

interface IGetAllParams {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

const createIssueIntoDB = async (payload: Partial<IIssue> & { reporter_id: number }) => {
    const { title, description, type, reporter_id } = payload;

    const result = await pool.query(
        `
        INSERT INTO issues(
            title,
            description,
            type,
            status,
            reporter_id
        )
        VALUES($1, $2, $3, 'open', $4)
        RETURNING *;
        `,
        [title, description, type, reporter_id]
    );

    return result.rows[0];
};

const getAllIssuesFromDB = async (params: IGetAllParams) => {
    const { sort = "newest", type, status } = params;

    let queryText = "SELECT * FROM issues";
    const queryParams: any[] = [];
    const filters: string[] = [];

    if (type) {
        queryParams.push(type);
        filters.push(`type = $${queryParams.length}`);
    }

    if (status) {
        queryParams.push(status);
        filters.push(`status = $${queryParams.length}`);
    }

    if (filters.length > 0) {
        queryText += " WHERE " + filters.join(" AND ");
    }

    // Sort order
    const order = sort === "oldest" ? "ASC" : "DESC";
    queryText += ` ORDER BY created_at ${order}`;

    const result = await pool.query(queryText, queryParams);
    const issues = result.rows;

    if (issues.length === 0) {
        return [];
    }

    // Fetch reporter details separately without JOINs
    const reporterIds = Array.from(new Set(issues.map(i => i.reporter_id)));
    const placeholders = reporterIds.map((_, idx) => `$${idx + 1}`).join(", ");
    
    const usersResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
        reporterIds
    );

    const userMap: Record<number, { id: number; name: string; role: string }> = {};
    usersResult.rows.forEach(user => {
        userMap[user.id] = user;
    });

    return issues.map(issue => {
        const { reporter_id, ...rest } = issue;
        return {
            ...rest,
            reporter: userMap[reporter_id] || null
        };
    });
};

const getSingleIssueFromDB = async (id: string) => {
    const result = await pool.query(
        `SELECT * FROM issues WHERE id = $1;`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const issue = result.rows[0];

    // Fetch reporter details separately without JOINs
    const userResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = $1;`,
        [issue.reporter_id]
    );

    const reporter = userResult.rows[0] || null;

    const { reporter_id, ...rest } = issue;
    return {
        ...rest,
        reporter
    };
};

const getRawIssueById = async (id: string) => {
    const result = await pool.query(
        `SELECT * FROM issues WHERE id = $1;`,
        [id]
    );
    return result.rows[0] || null;
};

const updateIssueIntoDB = async (
    payload: Partial<IIssue>,
    id: string
) => {
    const { title, description, type, status } = payload;

    const result = await pool.query(
        `
        UPDATE issues
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            status = COALESCE($4, status),
            updated_at = NOW()
        WHERE id = $5
        RETURNING *;
        `,
        [title, description, type, status, id]
    );

    return result.rows[0];
}

const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(
        `DELETE FROM issues WHERE id = $1 RETURNING *;`,
        [id]
    );
    return result.rows[0] || null;
}

export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    getRawIssueById,
    updateIssueIntoDB,
    deleteIssueFromDB,
};
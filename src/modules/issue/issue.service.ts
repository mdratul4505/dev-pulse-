import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue) => {

    const {
        title,
        description,
        type,
        status,
        reporter_id
    } = payload;

    const result = await pool.query(
        `
        INSERT INTO issues(
            title,
            description,
            type,
            status,
            reporter_id
        )
        VALUES($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [title, description, type, status, reporter_id]
    );

    return result;
};

const getAllIssuesFromDB = async () =>{
    const result = await pool.query(`
             SELECT * FROM issues;
             `)
             return result;
}

const getSingleIssueFromDB = async (id : string) =>{
    const result = await pool.query(`
             SELECT * FROM issues WHERE id = $1;
             `,[id])
             return result;
}

const updateIssueIntoDB = async (
    payload: Partial<IIssue>,
    id: string
) => {

    const {
        title,
        description,
        type
    } = payload;

    const result = await pool.query(
        `
        UPDATE issues
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            updated_at = NOW()
        WHERE id = $4
        RETURNING *;
        `,
        [title, description, type, id]
    );

    return result;
}

const deleteIssueFromDB = async (id : string) =>{
    const result = await pool.query(`
            DELETE FROM issues WHERE id = $1 RETURNING *;
            `,[id])
    return result;
}

export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueIntoDB,
    deleteIssueFromDB,
};
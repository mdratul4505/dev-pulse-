import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./uer.interface";

const createUserIntoDB = async (payload: IUser) => {

    const { name, email, password } = payload;

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
        INSERT INTO users(name, email, password)
        VALUES($1, $2, $3)
        RETURNING *;
        `,
        [name, email, hashPassword]
    );

    delete result.rows[0].password;

    return result;
}


export const userService = {
    createUserIntoDB,
}
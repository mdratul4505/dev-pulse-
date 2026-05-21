
import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import type { IUser } from "./userInterface";

const loginUserIntoDB = async (
  payload: { email: string; password: string }
) => {
  const { email, password } = payload;

  // check user exists
  const userData = await pool.query(
    `
    SELECT * FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = userData.rows[0];

  // compare password
  const matchPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!matchPassword) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  // access token (expires in 1d)
  const accessToken = jwt.sign(
    jwtPayload,
    config.secret as string,
    {
      expiresIn: "1d"
    }
  );

  const cleanUser = { ...user };
  delete cleanUser.password;

  return {
    token: accessToken,
    user: cleanUser
  };
};

const genereateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized access");
  }

  const decoded = jwt.verify(
    token,
    config.refresh_Secret as string
  ) as JwtPayload;

  // find user
  const userData = await pool.query(
    `
    SELECT * FROM users
    WHERE email = $1
    `,
    [decoded.email]
  );

  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userData.rows[0];

  // new access token payload
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  // generate new access token
  const accessToken = jwt.sign(
    jwtPayload,
    config.secret as string,
    {
      expiresIn: "1d"
    }
  );

  return {
    accessToken
  };
};

const createUserIntoDB = async (payload: IUser) => {
    const { name, email, password, role = "contributor"} = payload;

    // Check if user already exists
    const existingUser = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email already registered");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
        INSERT INTO users(name, email, password , role)
        VALUES($1, $2, $3 , $4)
        RETURNING *;
        `,
        [name, email, hashPassword , role]
    );

    delete result.rows[0].password;

    return result;
}

export const authService = {
  loginUserIntoDB,
  genereateRefreshToken,
  createUserIntoDB
};
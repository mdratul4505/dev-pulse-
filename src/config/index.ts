import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.join(process.cwd(), ".env")
})


const config = {
    connection_string : process.env.CONNECTION_STRING as string ,
    port : process.env.PORT as string || "5000",
    secret : process.env.JWT_SECRET as string,
    refresh_Secret: process.env.JWT_REFRESH_SECRET as string,
    jwt_expires_in: process.env.JWT_EXPIRES_IN as string,

jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string
}

export default config;
import type { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async(req : Request, res : Response) =>{
    try {
        const result = await userService.createUserIntoDB(req.body)

    res.status(201).json({
        success : true,
        message : " user creaded successfully",
        data : result.rows[0]
    })
    }catch(err : any){
        res.status(500).json({
            success : false,
        message : err.message,
        error : err
        })
    }
   }


export const userController = {
    createUser,
}
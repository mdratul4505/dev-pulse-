import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { get } from "node:http";

const createIssue = async (req: Request, res: Response) => {

    try {

        const result = await issueService.createIssueIntoDB(req.body);

        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        });

    } catch (error: any) {

        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        });

    }
};

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const result = await issueService.getAllIssuesFromDB();
        res.status(201).json({
            success: true,
            message: "get all issues successfully",
            data: result.rows
        });
        
    } catch (error : any) {
       res.status(500).json({
            success: false,
            message: error.message,
            error: error
        }); 
    }
}

const getSingleIssue =  async (req: Request, res : Response) =>{
     const {id} = req.params;
     try{
         const result = await issueService.getSingleIssueFromDB(id as string )        
         if(result.rows.length === 0){
                res.status(404).json({
                 success : false,
                 message : "issue not found",
                 data : {}
             }) 
             }
             res.status(200).json({
                 success : true,
                 message : "single issue fetched successfully",
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

    const updateIssue = async (req: Request, res: Response) => {

    const { id } = req.params;

    try {

        const result = await issueService.updateIssueIntoDB(
            req.body,
            id as string
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
                data: {}
            });
        }

        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0]
        });

    } catch (err: any) {

        res.status(500).json({
            success: false,
            message: err.message,
            error: err
        });

    }
}

export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,


};
import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
    try {
        const { title, description, type } = req.body;
        const reporter_id = req.user?.id;

        // Input validation
        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Title is required and must be a non-empty string",
                errors: "Invalid title input"
            });
        }

        if (title.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Title must not exceed 150 characters",
                errors: "Title length exceeded"
            });
        }

        if (!description || typeof description !== "string" || description.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Description is required and must be a non-empty string",
                errors: "Invalid description input"
            });
        }

        if (description.length < 20) {
            return res.status(400).json({
                success: false,
                message: "Description must be at least 20 characters long",
                errors: "Description too short"
            });
        }

        if (!type || (type !== "bug" && type !== "feature_request")) {
            return res.status(400).json({
                success: false,
                message: "Type is required and must be either 'bug' or 'feature_request'",
                errors: "Invalid type input"
            });
        }

        if (!reporter_id) {
            return res.status(401).json({
                success: false,
                message: "Missing, expired, or invalid JWT token",
                errors: "Reporter context not found"
            });
        }

        const result = await issueService.createIssueIntoDB({
            title,
            description,
            type,
            reporter_id
        });

        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error
        });
    }
};

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const { sort, type, status } = req.query;

        // Validate query params if provided
        if (sort && sort !== "newest" && sort !== "oldest") {
            return res.status(400).json({
                success: false,
                message: "Sort parameter must be 'newest' or 'oldest'",
                errors: "Invalid sort parameter"
            });
        }

        if (type && type !== "bug" && type !== "feature_request") {
            return res.status(400).json({
                success: false,
                message: "Type parameter must be 'bug' or 'feature_request'",
                errors: "Invalid type parameter"
            });
        }

        if (status && status !== "open" && status !== "in_progress" && status !== "resolved") {
            return res.status(400).json({
                success: false,
                message: "Status parameter must be 'open', 'in_progress', or 'resolved'",
                errors: "Invalid status parameter"
            });
        }

        const params: {
            sort?: "newest" | "oldest";
            type?: "bug" | "feature_request";
            status?: "open" | "in_progress" | "resolved";
        } = {};
        if (sort === "newest" || sort === "oldest") params.sort = sort;
        if (type === "bug" || type === "feature_request") params.type = type;
        if (status === "open" || status === "in_progress" || status === "resolved") params.status = status;

        const issues = await issueService.getAllIssuesFromDB(params);

        return res.status(200).json({
            success: true,
            data: issues
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error
        });
    }
};

const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Basic numeric validation
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a valid number",
                errors: "Invalid issue ID format"
            });
        }

        const issue = await issueService.getSingleIssueFromDB(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Requested resource does not exist",
                errors: "Issue not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: issue
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error
        });
    }
};

const updateIssue = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, description, type, status } = req.body;
        const user = req.user;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a valid number",
                errors: "Invalid issue ID format"
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Missing, expired, or invalid JWT token",
                errors: "Unauthorized context"
            });
        }

        // Fetch the raw issue to check ownership and status
        const rawIssue = await issueService.getRawIssueById(id);

        if (!rawIssue) {
            return res.status(404).json({
                success: false,
                message: "Requested resource does not exist",
                errors: "Issue not found"
            });
        }

        // Role verification and rule enforcement
        if (user.role === "contributor") {
            // Check ownership
            if (rawIssue.reporter_id !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden",
                    errors: "You are not authorized to update this issue"
                });
            }

            // Check if status is "open"
            if (rawIssue.status !== "open") {
                return res.status(409).json({
                    success: false,
                    message: "Cannot update an issue that is already in_progress or resolved",
                    errors: "Business logic conflict"
                });
            }

            // Contributor cannot change status
            if (status !== undefined && status !== rawIssue.status) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden",
                    errors: "Contributors cannot modify workflow status"
                });
            }
        }

        // Validate fields if provided
        if (title !== undefined) {
            if (typeof title !== "string" || title.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Title must be a non-empty string",
                    errors: "Invalid title field"
                });
            }
            if (title.length > 150) {
                return res.status(400).json({
                    success: false,
                    message: "Title must not exceed 150 characters",
                    errors: "Title length exceeded"
                });
            }
        }

        if (description !== undefined) {
            if (typeof description !== "string" || description.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Description must be a non-empty string",
                    errors: "Invalid description field"
                });
            }
            if (description.length < 20) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be at least 20 characters long",
                    errors: "Description too short"
                });
            }
        }

        if (type !== undefined && type !== "bug" && type !== "feature_request") {
            return res.status(400).json({
                success: false,
                message: "Type must be either 'bug' or 'feature_request'",
                errors: "Invalid type field"
            });
        }

        if (status !== undefined && status !== "open" && status !== "in_progress" && status !== "resolved") {
            return res.status(400).json({
                success: false,
                message: "Status must be one of: 'open', 'in_progress', 'resolved'",
                errors: "Invalid status field"
            });
        }

        const updatedIssue = await issueService.updateIssueIntoDB(
            {
                title,
                description,
                type,
                status
            },
            id
        );

        return res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: updatedIssue
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error
        });
    }
};

const deleteIssue = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a valid number",
                errors: "Invalid issue ID format"
            });
        }

        // Fetch first to check existence
        const issue = await issueService.getRawIssueById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Requested resource does not exist",
                errors: "Issue not found"
            });
        }

        await issueService.deleteIssueFromDB(id);

        return res.status(200).json({
            success: true,
            message: "Issue deleted successfully"
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error
        });
    }
};

export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
};
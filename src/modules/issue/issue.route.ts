import { Router } from "express"
import { issueController } from "./issue.controller"
import auth from "../../middleware/auth"
import { USER_ROLE } from "../../types"

const router = Router()

// Create Issue: Authenticated users (contributor, maintainer)
router.post('/', auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue)

// Get All Issues: Public
router.get('/', issueController.getAllIssues)

// Get Single Issue: Public
router.get('/:id', issueController.getSingleIssue)

// Update Issue: Authenticated users (contributor, maintainer)
// Handled at application logic for contributor vs maintainer rules
router.patch('/:id', auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssue)

// Delete Issue: Maintainer only
router.delete('/:id', auth(USER_ROLE.maintainer), issueController.deleteIssue)

export const issueRoute = router;
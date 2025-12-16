import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { CreateExpenseDto } from "../dto/CreateExpenseDto";

const router = Router();

router.use(authenticateJWT);

router.post("/",validationMiddleware(CreateExpenseDto),ExpenseController.createExpense);

export default router;
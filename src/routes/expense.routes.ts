import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { CreateExpenseDto } from "../dto/CreateExpenseDto";
import { UpdateExpenseDto } from "../dto/UpdateExpenseDto";

const router = Router();

router.use(authenticateJWT);

router.get("/",ExpenseController.getAllExpenses);
router.get("/summary",ExpenseController.getExpenseSummary);
router.post("/",validationMiddleware(CreateExpenseDto),ExpenseController.createExpense);
router.get("/:id",ExpenseController.getExpenseById);
router.delete("/:id",ExpenseController.deleteExpense);
router.put("/:id",validationMiddleware(UpdateExpenseDto),ExpenseController.updateExpense);

export default router;
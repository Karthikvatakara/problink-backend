import { Request,Response } from "express";
import { AppDataSource } from "../config/database";
import { Expense } from "../entities/Expense";
import { CreateExpenseDto } from "../dto/CreateExpenseDto";
import { validate } from 'class-validator';
import { plainToInstance } from "class-transformer";
import { Between } from "typeorm";
import { UpdateExpenseDto } from "../dto/UpdateExpenseDto";

export class ExpenseController {
    static async createExpense(req:Request,res:Response): Promise<Response> {
        try{
            const createExpenseDto = req.body as CreateExpenseDto;
            // const errors = await validate(createExpenseDto);

            // if(errors.length >0){
            //     return res.status(400).json({
            //         message:"validation failed",
            //         errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
            //     })
            // }

            const expenseRepository = AppDataSource.getRepository(Expense);
            const userId = (req.user as any).id;

            const expense = expenseRepository.create({
                amount: createExpenseDto.amount,
                category: createExpenseDto.category,
                description: createExpenseDto.description,
                date: new Date(createExpenseDto.date),
                userId
            });
            
            await expenseRepository.save(expense);

            return res.status(201).json({
                message:"expense created succesfully",
                expense
            })
        }catch(error){
            console.error('create expense error',error);
            return res.status(500).json({ message:"internal server error",error:error})
        }
    }

    static async getExpenseById(req: Request, res: Response): Promise<Response> {
    try {
      const expenseRepository = AppDataSource.getRepository(Expense);
      const expenseId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      const expense = await expenseRepository.findOne({
        where: { id: expenseId, userId },
      });

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      return res.json({
        message: 'Expense retrieved successfully',
        expense,
      });
    } catch (error) {
      console.error('Get expense error:', error);
      return res.status(500).json({ message: 'Internal server error', error: error });
    }
  }

  static async deleteExpense(req: Request, res: Response): Promise<Response> {
    try {
      const expenseRepository = AppDataSource.getRepository(Expense);
      const expenseId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      const expense = await expenseRepository.findOne({
        where: { id: expenseId, userId },
      });

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      await expenseRepository.remove(expense);

      return res.json({
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      console.error('Delete expense error:', error);
      return res.status(500).json({ message: 'Internal server error', error: error });
    }
  }


   static async updateExpense(req: Request, res: Response): Promise<Response> {
    try {
      
      const updateExpenseDto = req.body as UpdateExpenseDto;
      const expenseRepository = AppDataSource.getRepository(Expense);
      const expenseId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      const expense = await expenseRepository.findOne({
        where: { id: expenseId, userId },
      });

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      
      if (updateExpenseDto.amount !== undefined) {
        expense.amount = updateExpenseDto.amount;
      }
      if (updateExpenseDto.category !== undefined) {
        expense.category = updateExpenseDto.category;
      }
      if (updateExpenseDto.description !== undefined) {
        expense.description = updateExpenseDto.description;
      }
      if (updateExpenseDto.date !== undefined) {
        expense.date = new Date(updateExpenseDto.date);
      }

      await expenseRepository.save(expense);

      return res.json({
        message: 'Expense updated successfully',
        expense,
      });
    } catch (error) {
      console.error('Update expense error:', error);
      return res.status(500).json({ message: 'Internal server error', error: error });
    }
  }

  static async getAllExpenses(req: Request, res: Response): Promise<Response> {
    try {
      const expenseRepository = AppDataSource.getRepository(Expense);
      const userId = (req.user as any).id;
      const { start, end } = req.query;

      let whereClause: any = { userId };

      
      if (start && end) {
        whereClause.date = Between(new Date(start as string), new Date(end as string));
      } else if (start) {
        whereClause.date = Between(new Date(start as string), new Date());
      } else if (end) {
        whereClause.date = Between(new Date(0), new Date(end as string));
      }

      const expenses = await expenseRepository.find({
        where: whereClause,
        order: { date: 'DESC', createdAt: 'DESC' },
      });

      return res.json({
        message: 'Expenses retrieved successfully',
        count: expenses.length,
        expenses,
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      return res.status(500).json({ message: 'Internal server error', error: error });
    }
  }


  static async getExpenseSummary(req: Request, res: Response): Promise<Response> {
    try {
      const expenseRepository = AppDataSource.getRepository(Expense);
      const userId = (req.user as any).id;
      const { start, end } = req.query;
      console.log("🚀 ~ ExpenseController ~ getExpenseSummary ~ end:", end)
      console.log("🚀 ~ ExpenseController ~ getExpenseSummary ~ start:", start)

      let whereClause: any = { userId };
      console.log("🚀 ~ ExpenseController ~ getExpenseSummary ~ whereClause:", whereClause)

      
      if (start && end) {
        whereClause.date = Between(new Date(start as string), new Date(end as string));
      } else if (start) {
        whereClause.date = Between(new Date(start as string), new Date());
      } else if (end) {
        whereClause.date = Between(new Date(0), new Date(end as string));
      }

      const expenses = await expenseRepository.find({
        where: whereClause,
      });

      
      const summary = expenses.reduce((acc: any, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = {
            category,
            count: 0,
            totalAmount: 0,
          };
        }
        acc[category].count += 1;
        acc[category].totalAmount += parseFloat(expense.amount.toString());
        return acc;
      }, {});

      
      const summaryArray = Object.values(summary).map((item: any) => ({
        category: item.category,
        count: item.count,
        totalAmount: parseFloat(item.totalAmount.toFixed(2)),
      }));

      
      const grandTotal = summaryArray.reduce(
        (sum, item) => sum + item.totalAmount,
        0
      );

      return res.json({
        message: 'Expense summary retrieved successfully',
        summary: summaryArray,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        totalExpenses: expenses.length,
      });
    } catch (error) {
      console.error('Get expense summary error:', error);
      return res.status(500).json({ message: 'Internal server error', error: error });
    }
  }
}
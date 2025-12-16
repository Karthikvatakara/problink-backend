import { Request,Response } from "express";
import { AppDataSource } from "../config/database";
import { Expense } from "../entities/Expense";
import { CreateExpenseDto } from "../dto/CreateExpenseDto";
import { validate } from 'class-validator';
import { plainToInstance } from "class-transformer";
import { Between } from "typeorm";

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
}
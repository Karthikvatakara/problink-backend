import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../entities/Expense';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsEnum(['Food', 'Transport', 'Bills', 'Shopping', 'Others'])
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO date string
}


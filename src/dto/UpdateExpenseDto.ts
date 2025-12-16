import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../entities/Expense';

export class UpdateExpenseDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsEnum(['Food', 'Transport', 'Bills', 'Shopping', 'Others'])
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}


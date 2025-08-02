import { GoogleGenAI } from "@google/genai";
import * as xlsx from 'xlsx';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export interface IntelligentParseResult {
  success: boolean;
  data?: any[];
  structure?: {
    dateColumn?: string;
    incomeExpenseColumn?: string;
    categoryColumn?: string;
    expenseCodeColumn?: string;
    subcategoryColumn?: string;
    amountColumn?: string;
  };
  error?: string;
}

export class IntelligentFileParser {
  async parseComplexSpreadsheet(buffer: Buffer, filename: string): Promise<IntelligentParseResult> {
    try {
      // Read the Excel file
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (!rawData || rawData.length === 0) {
        return { success: false, error: 'File is empty or contains no valid data' };
      }

      // Get first 10 rows for AI analysis
      const sampleData = rawData.slice(0, Math.min(10, rawData.length)) as any[][];
      
      // Use AI to understand the structure
      const structure = await this.analyzeSpreadsheetStructure(sampleData);
      
      if (!structure.success) {
        return { success: false, error: 'Could not understand spreadsheet structure' };
      }

      // Parse the data based on AI-identified structure
      const parsedData = await this.parseDataWithStructure(rawData, structure.structure!);
      
      return {
        success: true,
        data: parsedData,
        structure: structure.structure
      };
    } catch (error) {
      return { success: false, error: `Intelligent parsing failed: ${(error as Error).message}` };
    }
  }

  private async analyzeSpreadsheetStructure(sampleData: any[][]): Promise<{
    success: boolean;
    structure?: {
      dateColumn?: string;
      incomeExpenseColumn?: string;
      categoryColumn?: string;
      expenseCodeColumn?: string;
      subcategoryColumn?: string;
      amountColumn?: string;
      headerRow?: number;
    };
  }> {
    try {
      const prompt = `
Analyze this spreadsheet data and identify the structure. Based on the description:
- First or second row has dates
- Column D is header for income vs expense
- Column E is category  
- Column F is expense code in those categories
- Column G is subcategory
- Some rows in E have 'total' in them (sum of items above since previous total)

Sample data:
${JSON.stringify(sampleData, null, 2)}

Respond with JSON only:
{
  "headerRow": number (0-based index of header row),
  "dateColumn": "column letter or index",
  "incomeExpenseColumn": "column letter or index", 
  "categoryColumn": "column letter or index",
  "expenseCodeColumn": "column letter or index",
  "subcategoryColumn": "column letter or index",
  "amountColumn": "column letter or index"
}`;

      const model = genai.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              headerRow: { type: "number" },
              dateColumn: { type: "string" },
              incomeExpenseColumn: { type: "string" },
              categoryColumn: { type: "string" },
              expenseCodeColumn: { type: "string" },
              subcategoryColumn: { type: "string" },
              amountColumn: { type: "string" }
            },
            required: ["headerRow", "categoryColumn", "amountColumn"]
          }
        }
      });

      const response = await model.generateContent(prompt);
      const structure = JSON.parse(response.response.text() || "{}");
      return { success: true, structure };
    } catch (error) {
      console.error('AI structure analysis failed:', error);
      return { success: false };
    }
  }

  private async parseDataWithStructure(rawData: any[][], structure: any): Promise<any[]> {
    const parsedData = [];
    const headerRow = structure.headerRow || 0;
    
    // Skip header rows
    for (let i = headerRow + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      try {
        // Extract data based on identified structure
        const categoryIndex = this.getColumnIndex(structure.categoryColumn);
        const amountIndex = this.getColumnIndex(structure.amountColumn);
        const incomeExpenseIndex = this.getColumnIndex(structure.incomeExpenseColumn);
        const expenseCodeIndex = this.getColumnIndex(structure.expenseCodeColumn);
        const subcategoryIndex = this.getColumnIndex(structure.subcategoryColumn);

        const category = row[categoryIndex]?.toString().trim() || '';
        const amount = this.parseAmount(row[amountIndex]);
        const incomeExpense = row[incomeExpenseIndex]?.toString().trim() || '';
        const expenseCode = row[expenseCodeIndex]?.toString().trim() || '';
        const subcategory = row[subcategoryIndex]?.toString().trim() || '';

        if (category && amount !== 0) {
          parsedData.push({
            category,
            amount,
            type: incomeExpense.toLowerCase().includes('income') ? 'income' : 'expense',
            expenseCode,
            subcategory,
            isTotal: category.toLowerCase().includes('total'),
            rawRow: row
          });
        }
      } catch (error) {
        console.warn(`Error parsing row ${i}:`, error);
        continue;
      }
    }

    return parsedData;
  }

  private getColumnIndex(column: string): number {
    if (!column) return 0;
    
    // If it's already a number
    if (!isNaN(Number(column))) {
      return Number(column);
    }
    
    // If it's a letter (A, B, C, etc.)
    if (typeof column === 'string' && column.length === 1) {
      return column.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
    }
    
    return 0;
  }

  private parseAmount(value: any): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const str = value.toString().replace(/[$,\s]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  // Transform intelligent parse results into standard P&L format
  transformToPLData(intelligentData: any[]): any[] {
    const periods = this.groupByPeriod(intelligentData);
    const plData = [];

    for (const [period, data] of Object.entries(periods)) {
      const income = data.filter((item: any) => item.type === 'income');
      const expenses = data.filter((item: any) => item.type === 'expense');

      const totalRevenue = income.reduce((sum: number, item: any) => sum + item.amount, 0);
      const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.amount, 0);

      // Categorize expenses
      const cogs = expenses
        .filter((item: any) => this.isCOGS(item.category))
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const operatingExpenses = totalExpenses - cogs;

      plData.push({
        period,
        revenue: totalRevenue,
        cogs,
        operatingExpenses,
        expenseBreakdown: this.createExpenseBreakdown(expenses)
      });
    }

    return plData;
  }

  private groupByPeriod(data: any[]): Record<string, any[]> {
    // For now, group all data into a single period
    // Could be enhanced to detect actual periods from dates
    return {
      'Analyzed Period': data
    };
  }

  private isCOGS(category: string): boolean {
    const cogsKeywords = ['cost of goods', 'cogs', 'direct cost', 'materials', 'inventory'];
    return cogsKeywords.some(keyword => 
      category.toLowerCase().includes(keyword)
    );
  }

  private createExpenseBreakdown(expenses: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (const expense of expenses) {
      const category = expense.category || 'Other';
      if (!breakdown[category]) {
        breakdown[category] = 0;
      }
      breakdown[category] += expense.amount;
    }

    return breakdown;
  }
}
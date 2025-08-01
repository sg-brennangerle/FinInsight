import * as xlsx from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';

export interface ParsedPLData {
  period: string;
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  expenseBreakdown?: Record<string, number>;
}

export interface ProcessingResult {
  success: boolean;
  data?: ParsedPLData[];
  error?: string;
}

export class FileProcessor {
  async processFile(buffer: Buffer, filename: string, mimeType: string): Promise<ProcessingResult> {
    try {
      let data: any[];
      
      if (mimeType.includes('sheet') || filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        data = await this.processExcelFile(buffer);
      } else if (mimeType.includes('csv') || filename.endsWith('.csv')) {
        data = await this.processCsvFile(buffer);
      } else {
        return { success: false, error: 'Unsupported file format. Please upload CSV or Excel files.' };
      }

      const validatedData = this.validateAndTransformData(data);
      return { success: true, data: validatedData };
    } catch (error) {
      return { success: false, error: `File processing failed: ${(error as Error).message}` };
    }
  }

  private async processExcelFile(buffer: Buffer): Promise<any[]> {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }

  private async processCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private validateAndTransformData(rawData: any[]): ParsedPLData[] {
    if (!rawData || rawData.length === 0) {
      throw new Error('File is empty or contains no valid data');
    }

    const transformedData: ParsedPLData[] = [];

    for (const row of rawData) {
      try {
        const period = this.extractPeriod(row);
        const revenue = this.parseNumber(row.Revenue || row.revenue || row['Total Revenue'] || 0);
        const cogs = this.parseNumber(row.COGS || row.cogs || row['Cost of Goods Sold'] || 0);
        const operatingExpenses = this.parseNumber(
          row['Operating Expenses'] || row.operatingExpenses || row['Total Operating Expenses'] || 0
        );

        // Calculate derived values
        const grossProfit = revenue - cogs;
        const operatingIncome = grossProfit - operatingExpenses;
        const netIncome = operatingIncome; // Simplified for demo

        // Extract expense breakdown if available
        const expenseBreakdown: Record<string, number> = {};
        Object.keys(row).forEach(key => {
          if (key.toLowerCase().includes('expense') && !key.toLowerCase().includes('total')) {
            const value = this.parseNumber(row[key]);
            if (value > 0) {
              expenseBreakdown[key] = value;
            }
          }
        });

        transformedData.push({
          period,
          revenue,
          cogs,
          operatingExpenses,
          expenseBreakdown: Object.keys(expenseBreakdown).length > 0 ? expenseBreakdown : undefined,
        });
      } catch (error) {
        console.warn(`Skipping invalid row: ${(error as Error).message}`);
      }
    }

    if (transformedData.length === 0) {
      throw new Error('No valid P&L data found. Please ensure your file contains Revenue, COGS, and Operating Expenses columns.');
    }

    return transformedData;
  }

  private extractPeriod(row: any): string {
    const periodKeys = ['Period', 'period', 'Date', 'date', 'Month', 'month', 'Quarter', 'quarter'];
    for (const key of periodKeys) {
      if (row[key]) {
        return String(row[key]);
      }
    }
    return 'Unknown Period';
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols, commas, and parentheses
      const cleaned = value.replace(/[$,()]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  calculateKPIs(data: ParsedPLData[]): Record<string, any> {
    if (data.length === 0) return {};

    const latest = data[data.length - 1];
    const grossProfit = latest.revenue - latest.cogs;
    const operatingIncome = grossProfit - latest.operatingExpenses;
    
    const kpis: Record<string, any> = {
      grossProfitMargin: latest.revenue > 0 ? (grossProfit / latest.revenue) * 100 : 0,
      operatingMargin: latest.revenue > 0 ? (operatingIncome / latest.revenue) * 100 : 0,
      netProfitMargin: latest.revenue > 0 ? (operatingIncome / latest.revenue) * 100 : 0, // Simplified
      totalRevenue: latest.revenue,
      totalCogs: latest.cogs,
      totalOperatingExpenses: latest.operatingExpenses,
      grossProfit,
      operatingIncome,
    };

    // Calculate trends if multiple periods
    if (data.length > 1) {
      const previous = data[data.length - 2];
      const revenueGrowth = previous.revenue > 0 ? ((latest.revenue - previous.revenue) / previous.revenue) * 100 : 0;
      
      kpis.revenueGrowth = revenueGrowth;
      kpis.trend = revenueGrowth > 0 ? 'positive' : revenueGrowth < 0 ? 'negative' : 'stable';
    }

    return kpis;
  }
}

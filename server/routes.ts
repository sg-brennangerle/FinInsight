import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { FileProcessor } from "./services/fileProcessor";
import { AINarrativeGenerator } from "./services/aiNarrative";
import { insertPlFileSchema, insertPlDataSchema, insertReportSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload CSV or Excel files only.'));
    }
  }
});

const fileProcessor = new FileProcessor();
const aiGenerator = new AINarrativeGenerator();

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (simplified for demo)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser("user-1");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = "user-1"; // Simplified for demo
      const files = await storage.getPlFilesByUserId(userId);
      const reports = await storage.getReportsByUserId(userId);
      
      const stats = {
        filesProcessed: files.filter(f => f.status === 'processed').length,
        reportsGenerated: reports.length,
        timeSaved: Math.floor(reports.length * 2.3), // Estimate 2.3 hours saved per report
        avgProcessingTime: "2.3s"
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload P&L file
  app.post("/api/upload", upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = "user-1"; // Simplified for demo
      
      // Create file record
      const fileData = insertPlFileSchema.parse({
        userId,
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        status: "processing"
      });

      const plFile = await storage.createPlFile(fileData);

      // Process file asynchronously
      processFileAsync(plFile.id, req.file.buffer, req.file.originalname, req.file.mimetype);

      res.json({ 
        message: "File uploaded successfully", 
        fileId: plFile.id,
        status: "processing"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get processing status
  app.get("/api/file/:id/status", async (req, res) => {
    try {
      const file = await storage.getPlFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json({ status: file.status });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = "user-1"; // Simplified for demo
      const reports = await storage.getReportsByUserId(userId);
      
      // Include file information
      const reportsWithFiles = await Promise.all(
        reports.map(async (report) => {
          const file = await storage.getPlFile(report.fileId);
          return {
            ...report,
            fileName: file?.originalName || 'Unknown',
          };
        })
      );
      
      res.json(reportsWithFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get specific report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get files
  app.get("/api/files", async (req, res) => {
    try {
      const userId = "user-1"; // Simplified for demo
      const files = await storage.getPlFilesByUserId(userId);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async file processing function
async function processFileAsync(fileId: string, buffer: Buffer, filename: string, mimeType: string) {
  try {
    // Update status to processing
    await storage.updatePlFileStatus(fileId, "processing");

    // Process the file
    const result = await fileProcessor.processFile(buffer, filename, mimeType);
    
    if (!result.success) {
      await storage.updatePlFileStatus(fileId, "error");
      return;
    }

    // Store P&L data
    const plDataRecords = [];
    for (const data of result.data!) {
      const grossProfit = data.revenue - data.cogs;
      const operatingIncome = grossProfit - data.operatingExpenses;
      
      const plDataInput = insertPlDataSchema.parse({
        fileId,
        period: data.period,
        revenue: data.revenue.toString(),
        cogs: data.cogs.toString(),
        grossProfit: grossProfit.toString(),
        operatingExpenses: data.operatingExpenses.toString(),
        operatingIncome: operatingIncome.toString(),
        netIncome: operatingIncome.toString(), // Simplified
        expenseBreakdown: data.expenseBreakdown || null,
      });

      const plDataRecord = await storage.createPlData(plDataInput);
      plDataRecords.push(plDataRecord);
    }

    // Calculate KPIs
    const kpis = fileProcessor.calculateKPIs(result.data!);

    // Generate AI narrative
    const narrativeRequest = {
      kpis,
      plData: result.data!,
      audienceLevel: 'executive' as const,
      reportType: 'executive_summary' as const,
    };

    const narrative = await aiGenerator.generateNarrative(narrativeRequest);

    // Create report
    const reportData = insertReportSchema.parse({
      fileId,
      userId: "user-1",
      title: `Financial Analysis - ${result.data![0]?.period || 'Recent Period'}`,
      type: "executive_summary",
      period: result.data![0]?.period || 'Unknown Period',
      narrative: narrative.executiveSummary,
      keyInsights: narrative.keyInsights,
      kpis,
      recommendations: narrative.recommendations,
      audienceLevel: "executive",
      status: "ready"
    });

    await storage.createReport(reportData);

    // Update file status to processed
    await storage.updatePlFileStatus(fileId, "processed", new Date());

  } catch (error) {
    console.error("File processing error:", error);
    await storage.updatePlFileStatus(fileId, "error");
  }
}

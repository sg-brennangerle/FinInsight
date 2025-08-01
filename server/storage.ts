import { type User, type InsertUser, type PlFile, type InsertPlFile, type PlData, type InsertPlData, type Report, type InsertReport } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPlFile(file: InsertPlFile): Promise<PlFile>;
  getPlFile(id: string): Promise<PlFile | undefined>;
  getPlFilesByUserId(userId: string): Promise<PlFile[]>;
  updatePlFileStatus(id: string, status: string, processedAt?: Date): Promise<void>;
  
  createPlData(data: InsertPlData): Promise<PlData>;
  getPlDataByFileId(fileId: string): Promise<PlData[]>;
  
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: string): Promise<Report | undefined>;
  getReportsByUserId(userId: string): Promise<Report[]>;
  getReportsByFileId(fileId: string): Promise<Report[]>;
  updateReportStatus(id: string, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private plFiles: Map<string, PlFile>;
  private plData: Map<string, PlData>;
  private reports: Map<string, Report>;

  constructor() {
    this.users = new Map();
    this.plFiles = new Map();
    this.plData = new Map();
    this.reports = new Map();
    
    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "user-1",
      username: "sarah.johnson",
      password: "password",
      name: "Sarah Johnson",
      role: "Finance Manager",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "Finance Manager",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async createPlFile(insertFile: InsertPlFile): Promise<PlFile> {
    const id = randomUUID();
    const file: PlFile = { 
      ...insertFile,
      status: insertFile.status || "uploaded",
      id, 
      uploadedAt: new Date(), 
      processedAt: null 
    };
    this.plFiles.set(id, file);
    return file;
  }

  async getPlFile(id: string): Promise<PlFile | undefined> {
    return this.plFiles.get(id);
  }

  async getPlFilesByUserId(userId: string): Promise<PlFile[]> {
    return Array.from(this.plFiles.values()).filter(file => file.userId === userId);
  }

  async updatePlFileStatus(id: string, status: string, processedAt?: Date): Promise<void> {
    const file = this.plFiles.get(id);
    if (file) {
      file.status = status;
      if (processedAt) {
        file.processedAt = processedAt;
      }
      this.plFiles.set(id, file);
    }
  }

  async createPlData(insertData: InsertPlData): Promise<PlData> {
    const id = randomUUID();
    const data: PlData = { 
      ...insertData, 
      id, 
      expenseBreakdown: insertData.expenseBreakdown || null,
      createdAt: new Date() 
    };
    this.plData.set(id, data);
    return data;
  }

  async getPlDataByFileId(fileId: string): Promise<PlData[]> {
    return Array.from(this.plData.values()).filter(data => data.fileId === fileId);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = { 
      ...insertReport, 
      id, 
      status: insertReport.status || "ready",
      audienceLevel: insertReport.audienceLevel || "executive",
      keyInsights: insertReport.keyInsights || null,
      kpis: insertReport.kpis || null,
      recommendations: insertReport.recommendations || null,
      generatedAt: new Date() 
    };
    this.reports.set(id, report);
    return report;
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(report => report.userId === userId);
  }

  async getReportsByFileId(fileId: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(report => report.fileId === fileId);
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      report.status = status;
      this.reports.set(id, report);
    }
  }
}

export const storage = new MemStorage();

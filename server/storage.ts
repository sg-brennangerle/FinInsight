import { users, plFiles, plData, reports, type User, type InsertUser, type PlFile, type InsertPlFile, type PlData, type InsertPlData, type Report, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createPlFile(insertFile: InsertPlFile): Promise<PlFile> {
    const [file] = await db
      .insert(plFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getPlFile(id: string): Promise<PlFile | undefined> {
    const [file] = await db.select().from(plFiles).where(eq(plFiles.id, id));
    return file || undefined;
  }

  async getPlFilesByUserId(userId: string): Promise<PlFile[]> {
    return await db.select().from(plFiles).where(eq(plFiles.userId, userId));
  }

  async updatePlFileStatus(id: string, status: string, processedAt?: Date): Promise<void> {
    await db
      .update(plFiles)
      .set({ 
        status, 
        ...(processedAt && { processedAt }) 
      })
      .where(eq(plFiles.id, id));
  }

  async createPlData(insertData: InsertPlData): Promise<PlData> {
    const [data] = await db
      .insert(plData)
      .values(insertData)
      .returning();
    return data;
  }

  async getPlDataByFileId(fileId: string): Promise<PlData[]> {
    return await db.select().from(plData).where(eq(plData.fileId, fileId));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.userId, userId));
  }

  async getReportsByFileId(fileId: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.fileId, fileId));
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id));
  }
}

export const storage = new DatabaseStorage();

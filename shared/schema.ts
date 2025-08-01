import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Finance Manager"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const plFiles = pgTable("pl_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, processed, error
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const plData = pgTable("pl_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: varchar("file_id").notNull().references(() => plFiles.id),
  period: text("period").notNull(),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).notNull(),
  cogs: decimal("cogs", { precision: 15, scale: 2 }).notNull(),
  grossProfit: decimal("gross_profit", { precision: 15, scale: 2 }).notNull(),
  operatingExpenses: decimal("operating_expenses", { precision: 15, scale: 2 }).notNull(),
  operatingIncome: decimal("operating_income", { precision: 15, scale: 2 }).notNull(),
  netIncome: decimal("net_income", { precision: 15, scale: 2 }).notNull(),
  expenseBreakdown: jsonb("expense_breakdown"), // detailed expense categories
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: varchar("file_id").notNull().references(() => plFiles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // executive_summary, kpi_analysis, trend_analysis
  period: text("period").notNull(),
  narrative: text("narrative").notNull(),
  keyInsights: jsonb("key_insights"),
  kpis: jsonb("kpis"),
  recommendations: jsonb("recommendations"),
  audienceLevel: text("audience_level").notNull().default("executive"), // executive, team_leads, all_company
  status: text("status").notNull().default("ready"), // processing, ready, error
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPlFileSchema = createInsertSchema(plFiles).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertPlDataSchema = createInsertSchema(plData).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlFile = z.infer<typeof insertPlFileSchema>;
export type PlFile = typeof plFiles.$inferSelect;
export type InsertPlData = z.infer<typeof insertPlDataSchema>;
export type PlData = typeof plData.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

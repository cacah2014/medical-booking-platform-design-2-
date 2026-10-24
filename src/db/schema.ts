import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  icon: varchar("icon", { length: 60 }).notNull(),
  tint: varchar("tint", { length: 40 }).notNull().default("jade"),
  blurb: text("blurb"),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 60 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 200 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  gender: varchar("gender", { length: 10 }).notNull().default("male"),
  title: varchar("title", { length: 160 }).notNull(),
  specialtyId: integer("specialty_id")
    .notNull()
    .references(() => specialties.id),
  cityId: integer("city_id").notNull().references(() => cities.id),
  image: varchar("image", { length: 600 }),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("4.5"),
  reviewsCount: integer("reviews_count").notNull().default(0),
  experienceYears: integer("experience_years").notNull().default(10),
  consultPrice: integer("consult_price").notNull(),
  onlinePrice: integer("online_price"),
  onlineConsult: boolean("online_consult").notNull().default(false),
  medicalCode: varchar("medical_code", { length: 40 }).notNull(),
  clinicAddress: varchar("clinic_address", { length: 320 }),
  clinicPhone: varchar("clinic_phone", { length: 24 }),
  bio: text("bio"),
  education: varchar("education", { length: 240 }),
  workingDays: jsonb("working_days").$type<number[]>().notNull().default([6, 0, 1, 2, 3]),
  shifts: jsonb("shifts").$type<string[][]>().notNull().default([
    ["09:00", "13:00"],
    ["16:00", "20:00"],
  ]),
  slotDuration: integer("slot_duration").notNull().default(30),
  firstSlotWithinDays: integer("first_slot_within_days").notNull().default(0),
  views: integer("views").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 60 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 14 }).notNull().unique(),
  fullName: varchar("full_name", { length: 160 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 14 }).notNull(),
  codeHash: varchar("code_hash", { length: 80 }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  trackingCode: varchar("tracking_code", { length: 20 }).notNull().unique(),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  patientId: integer("patient_id").references(() => patients.id),
  patientName: varchar("patient_name", { length: 160 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 24 }).notNull(),
  nationalCode: varchar("national_code", { length: 14 }),
  type: varchar("type", { length: 20 }).notNull().default("inperson"),
  date: date("date", { mode: "string" }).notNull(),
  time: varchar("time", { length: 5 }).notNull(),
  price: integer("price").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  visitType: varchar("visit_type", { length: 20 }).notNull().default("inperson"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export type Specialty = typeof specialties.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type DoctorWithMeta = Doctor & { specialty: Specialty; city: City };

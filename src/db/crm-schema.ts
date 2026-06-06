import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization, user } from "./schema";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const leadStatusEnum = pgEnum("lead_status", [
	"new",
	"contacted",
	"qualified",
	"proposal",
	"negotiation",
	"won",
	"lost",
	"unqualified",
]);

export const leadTemperatureEnum = pgEnum("lead_temperature", [
	"hot",
	"warm",
	"cold",
]);

// ─── Lead Sources ─────────────────────────────────────────────────────────────

export const leadSource = pgTable("lead_source", {
	id: uuid("id").defaultRandom().primaryKey(),
	// organizationId is a text FK because Better Auth generates text IDs for organizations
	organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Leads ────────────────────────────────────────────────────────────────────

export const lead = pgTable("lead", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),

	// Contact info
	name: text("name").notNull(),
	phone: text("phone"),
	email: text("email"),
	company: text("company"),
	location: text("location"),

	// Qualification
	sourceId: uuid("source_id").references(() => leadSource.id, { onDelete: "set null" }),
	status: leadStatusEnum("status").default("new").notNull(),
	temperature: leadTemperatureEnum("temperature").default("warm").notNull(),

	// Assignment — text FK because user IDs are Better Auth strings
	assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Lead Tags ────────────────────────────────────────────────────────────────

export const tag = pgTable("tag", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	color: text("color").default("#6366f1"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Many-to-many: leads <-> tags
export const leadTag = pgTable("lead_tag", {
	id: uuid("id").defaultRandom().primaryKey(),
	leadId: uuid("lead_id").notNull().references(() => lead.id, { onDelete: "cascade" }),
	tagId: uuid("tag_id").notNull().references(() => tag.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Lead Notes ───────────────────────────────────────────────────────────────

export const leadNote = pgTable("lead_note", {
	id: uuid("id").defaultRandom().primaryKey(),
	leadId: uuid("lead_id").notNull().references(() => lead.id, { onDelete: "cascade" }),
	// authorId is a text FK because user IDs are Better Auth strings
	authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Lead Activities ──────────────────────────────────────────────────────────

export const activityTypeEnum = pgEnum("activity_type", ["call", "email", "meeting"]);

export const leadActivity = pgTable("lead_activity", {
	id: uuid("id").defaultRandom().primaryKey(),
	leadId: uuid("lead_id").notNull().references(() => lead.id, { onDelete: "cascade" }),
	authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	type: activityTypeEnum("type").notNull(),
	subject: text("subject").notNull(),
	description: text("description"),
	occurredAt: timestamp("occurred_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Lead Tasks ───────────────────────────────────────────────────────────────

export const taskStatusEnum = pgEnum("task_status", ["pending", "completed", "cancelled"]);

export const leadTask = pgTable("lead_task", {
	id: uuid("id").defaultRandom().primaryKey(),
	leadId: uuid("lead_id").notNull().references(() => lead.id, { onDelete: "cascade" }),
	assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
	title: text("title").notNull(),
	description: text("description"),
	dueDate: timestamp("due_date"),
	status: taskStatusEnum("status").default("pending").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

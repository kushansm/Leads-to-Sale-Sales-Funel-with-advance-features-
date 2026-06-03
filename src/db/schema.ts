import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

// ─── Auth tables (Better Auth managed) ───────────────────────────────────────
// NOTE: Better Auth generates its own string IDs for these tables.
// We use `text("id")` here so the adapter can insert its own ID strings.
// UUID generation is only used on our CRM tables where WE do the inserting.

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	activeOrganizationId: text("activeOrganizationId"),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	expiresAt: timestamp("expiresAt"),
	password: text("password"),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
});

// ─── Organization tables (also Better Auth managed) ──────────────────────────

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	metadata: text("metadata"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const role = pgTable("role", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull().unique(), // 'Owner', 'Admin', 'Salesperson'
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const member = pgTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role").notNull(), // Better Auth internal: 'owner' | 'admin' | 'member'
	crmRoleId: uuid("crm_role_id").references(() => role.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invitation = pgTable("invitation", {
	id: text("id").primaryKey(),
	organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	inviterId: text("inviterId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

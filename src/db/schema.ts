import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: uuid("id").defaultRandom().primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: uuid("userId").notNull().references(() => user.id),
	activeOrganizationId: uuid("activeOrganizationId"),
});

export const account = pgTable("account", {
	id: uuid("id").defaultRandom().primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: uuid("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	expiresAt: timestamp("expiresAt"),
	password: text("password"),
});

export const verification = pgTable("verification", {
	id: uuid("id").defaultRandom().primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
});

export const organization = pgTable("organization", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	metadata: text("metadata"),
});

export const role = pgTable("role", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull().unique(), // e.g., 'Owner', 'Admin', 'Salesperson'
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const member = pgTable("member", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organizationId").notNull().references(() => organization.id),
	userId: uuid("userId").notNull().references(() => user.id),
	email: text("email").notNull(),
	role: text("role").notNull(), // Better Auth internal string role ('owner', 'admin', 'member')
	crmRoleId: uuid("crm_role_id").references(() => role.id), // Our custom CRM role mapping
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invitation = pgTable("invitation", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organizationId").notNull().references(() => organization.id),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	inviterId: uuid("inviterId").notNull().references(() => user.id),
});

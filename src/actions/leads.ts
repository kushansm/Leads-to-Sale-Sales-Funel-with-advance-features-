"use server";

import { db } from "@/db";
import { lead, leadTag, tag } from "@/db/crm-schema";
import { user } from "@/db/schema";
import { requireOrgMember, type ActionResult } from "@/lib/action-utils";
import { and, eq, ilike, or, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Lead = typeof lead.$inferSelect;
export type LeadStatus = Lead["status"];
export type LeadTemperature = Lead["temperature"];

export type CreateLeadInput = {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  location?: string;
  sourceId?: string;
  status?: LeadStatus;
  temperature?: LeadTemperature;
  assignedTo?: string;
  nextAction?: string | null;
  nextActionDate?: Date | null;
};

export type UpdateLeadInput = Partial<CreateLeadInput>;

export type LeadWithRelations = Lead & {
  assignedUser: Pick<typeof user.$inferSelect, "id" | "name" | "email"> | null;
  tags: (typeof tag.$inferSelect)[];
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getLeads(
  organizationId: string,
  filters?: {
    status?: LeadStatus;
    temperature?: LeadTemperature;
    assignedTo?: string;
    search?: string;
  }
): Promise<ActionResult<Lead[]>> {
  try {
    await requireOrgMember(organizationId);

    const conditions: SQL[] = [eq(lead.organizationId, organizationId)];

    if (filters?.status) conditions.push(eq(lead.status, filters.status));
    if (filters?.temperature) conditions.push(eq(lead.temperature, filters.temperature));
    if (filters?.assignedTo) conditions.push(eq(lead.assignedTo, filters.assignedTo));
    if (filters?.search) {
      conditions.push(
        or(
          ilike(lead.name, `%${filters.search}%`),
          ilike(lead.email!, `%${filters.search}%`),
          ilike(lead.company!, `%${filters.search}%`)
        )!
      );
    }

    const leads = await db
      .select()
      .from(lead)
      .where(and(...conditions))
      .orderBy(lead.createdAt);

    return { success: true, data: leads };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getLeadById(
  organizationId: string,
  leadId: string
): Promise<ActionResult<LeadWithRelations>> {
  try {
    await requireOrgMember(organizationId);

    const [foundLead] = await db
      .select()
      .from(lead)
      .where(and(eq(lead.id, leadId), eq(lead.organizationId, organizationId)))
      .limit(1);

    if (!foundLead) return { success: false, error: "Lead not found" };

    // Fetch assigned user
    let assignedUser = null;
    if (foundLead.assignedTo) {
      const [u] = await db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, foundLead.assignedTo))
        .limit(1);
      assignedUser = u ?? null;
    }

    // Fetch tags via join table
    const tagRows = await db
      .select({ tag: tag })
      .from(leadTag)
      .innerJoin(tag, eq(leadTag.tagId, tag.id))
      .where(eq(leadTag.leadId, leadId));

    return {
      success: true,
      data: { ...foundLead, assignedUser, tags: tagRows.map((r) => r.tag) },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createLead(
  organizationId: string,
  input: CreateLeadInput
): Promise<ActionResult<Lead>> {
  try {
    await requireOrgMember(organizationId);
    const [created] = await db
      .insert(lead)
      .values({ ...input, organizationId })
      .returning();
    revalidatePath(`/${organizationId}/leads`);
    return { success: true, data: created };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateLead(
  organizationId: string,
  leadId: string,
  input: UpdateLeadInput
): Promise<ActionResult<Lead>> {
  try {
    await requireOrgMember(organizationId);
    const [updated] = await db
      .update(lead)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(lead.id, leadId), eq(lead.organizationId, organizationId)))
      .returning();
    if (!updated) return { success: false, error: "Lead not found" };
    revalidatePath(`/${organizationId}/leads`);
    return { success: true, data: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteLead(
  organizationId: string,
  leadId: string
): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db
      .delete(lead)
      .where(and(eq(lead.id, leadId), eq(lead.organizationId, organizationId)));
    revalidatePath(`/${organizationId}/leads`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

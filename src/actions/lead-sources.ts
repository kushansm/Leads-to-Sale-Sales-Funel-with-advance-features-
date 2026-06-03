"use server";

import { db } from "@/db";
import { leadSource } from "@/db/crm-schema";
import { requireOrgMember, type ActionResult } from "@/lib/action-utils";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LeadSource = typeof leadSource.$inferSelect;
export type NewLeadSource = Pick<LeadSource, "name" | "description">;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getLeadSources(
  organizationId: string
): Promise<ActionResult<LeadSource[]>> {
  try {
    await requireOrgMember(organizationId);
    const sources = await db
      .select()
      .from(leadSource)
      .where(eq(leadSource.organizationId, organizationId))
      .orderBy(leadSource.name);
    return { success: true, data: sources };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createLeadSource(
  organizationId: string,
  input: NewLeadSource
): Promise<ActionResult<LeadSource>> {
  try {
    await requireOrgMember(organizationId);
    const [created] = await db
      .insert(leadSource)
      .values({ ...input, organizationId })
      .returning();
    revalidatePath(`/${organizationId}`);
    return { success: true, data: created };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateLeadSource(
  organizationId: string,
  sourceId: string,
  input: Partial<NewLeadSource>
): Promise<ActionResult<LeadSource>> {
  try {
    await requireOrgMember(organizationId);
    const [updated] = await db
      .update(leadSource)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(
          eq(leadSource.id, sourceId),
          eq(leadSource.organizationId, organizationId)
        )
      )
      .returning();
    if (!updated) return { success: false, error: "Lead source not found" };
    revalidatePath(`/${organizationId}`);
    return { success: true, data: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteLeadSource(
  organizationId: string,
  sourceId: string
): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db
      .delete(leadSource)
      .where(
        and(
          eq(leadSource.id, sourceId),
          eq(leadSource.organizationId, organizationId)
        )
      );
    revalidatePath(`/${organizationId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

"use server";

import { db } from "@/db";
import { tag, leadTag } from "@/db/crm-schema";
import { requireOrgMember, type ActionResult } from "@/lib/action-utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Tag = typeof tag.$inferSelect;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getTags(
  organizationId: string
): Promise<ActionResult<Tag[]>> {
  try {
    await requireOrgMember(organizationId);
    const tags = await db
      .select()
      .from(tag)
      .where(eq(tag.organizationId, organizationId))
      .orderBy(tag.name);
    return { success: true, data: tags };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTag(
  organizationId: string,
  input: { name: string; color?: string }
): Promise<ActionResult<Tag>> {
  try {
    await requireOrgMember(organizationId);
    const [created] = await db
      .insert(tag)
      .values({ ...input, organizationId })
      .returning();
    revalidatePath(`/${organizationId}`);
    return { success: true, data: created };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateTag(
  organizationId: string,
  tagId: string,
  input: { name?: string; color?: string }
): Promise<ActionResult<Tag>> {
  try {
    await requireOrgMember(organizationId);
    const [updated] = await db
      .update(tag)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(tag.id, tagId), eq(tag.organizationId, organizationId)))
      .returning();
    if (!updated) return { success: false, error: "Tag not found" };
    revalidatePath(`/${organizationId}`);
    return { success: true, data: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTag(
  organizationId: string,
  tagId: string
): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db
      .delete(tag)
      .where(and(eq(tag.id, tagId), eq(tag.organizationId, organizationId)));
    revalidatePath(`/${organizationId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Assign / Remove tags from a lead ────────────────────────────────────────

export async function addTagToLead(
  organizationId: string,
  leadId: string,
  tagId: string
): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db.insert(leadTag).values({ leadId, tagId }).onConflictDoNothing();
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function removeTagFromLead(
  organizationId: string,
  leadId: string,
  tagId: string
): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db
      .delete(leadTag)
      .where(and(eq(leadTag.leadId, leadId), eq(leadTag.tagId, tagId)));
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

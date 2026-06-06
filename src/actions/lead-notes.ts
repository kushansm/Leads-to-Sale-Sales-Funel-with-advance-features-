"use server";

import { db } from "@/db";
import { leadNote } from "@/db/crm-schema";
import { requireOrgMember, type ActionResult } from "@/lib/action-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LeadNote = typeof leadNote.$inferSelect;

export async function getLeadNotes(organizationId: string, leadId: string): Promise<ActionResult<LeadNote[]>> {
  try {
    await requireOrgMember(organizationId);
    const notes = await db.select().from(leadNote).where(eq(leadNote.leadId, leadId)).orderBy(leadNote.createdAt);
    return { success: true, data: notes };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createLeadNote(organizationId: string, leadId: string, content: string): Promise<ActionResult<LeadNote>> {
  try {
    const { session } = await requireOrgMember(organizationId);
    const [note] = await db.insert(leadNote).values({ leadId, authorId: session.user.id, content }).returning();
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: note };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteLeadNote(organizationId: string, leadId: string, noteId: string): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db.delete(leadNote).where(eq(leadNote.id, noteId));
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

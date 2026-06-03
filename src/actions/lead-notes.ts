"use server";

import { db } from "@/db";
import { leadNote } from "@/db/crm-schema";
import { user } from "@/db/schema";
import { requireOrgMember, requireSession, type ActionResult } from "@/lib/action-utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LeadNote = typeof leadNote.$inferSelect;
export type LeadNoteWithAuthor = LeadNote & {
  author: Pick<typeof user.$inferSelect, "id" | "name" | "image">;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getLeadNotes(
  organizationId: string,
  leadId: string
): Promise<ActionResult<LeadNoteWithAuthor[]>> {
  try {
    await requireOrgMember(organizationId);
    const rows = await db
      .select({
        note: leadNote,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(leadNote)
      .innerJoin(user, eq(leadNote.authorId, user.id))
      .where(eq(leadNote.leadId, leadId))
      .orderBy(leadNote.createdAt);

    const notes: LeadNoteWithAuthor[] = rows.map((r) => ({
      ...r.note,
      author: r.author,
    }));
    return { success: true, data: notes };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createLeadNote(
  organizationId: string,
  leadId: string,
  content: string
): Promise<ActionResult<LeadNote>> {
  try {
    const { session } = await requireOrgMember(organizationId);
    const [created] = await db
      .insert(leadNote)
      .values({ leadId, authorId: session.user.id, content })
      .returning();
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: created };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateLeadNote(
  organizationId: string,
  noteId: string,
  content: string
): Promise<ActionResult<LeadNote>> {
  try {
    const { session } = await requireOrgMember(organizationId);
    // Only the original author can edit
    const [updated] = await db
      .update(leadNote)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(leadNote.id, noteId), eq(leadNote.authorId, session.user.id)))
      .returning();
    if (!updated)
      return { success: false, error: "Note not found or not authorized" };
    return { success: true, data: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteLeadNote(
  organizationId: string,
  noteId: string
): Promise<ActionResult> {
  try {
    const { session, member } = await requireOrgMember(organizationId);
    // Authors can always delete; admins/owners can delete anyone's notes
    const canForceDelete = ["owner", "admin"].includes(member.role);
    const condition = canForceDelete
      ? eq(leadNote.id, noteId)
      : and(eq(leadNote.id, noteId), eq(leadNote.authorId, session.user.id));

    await db.delete(leadNote).where(condition);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

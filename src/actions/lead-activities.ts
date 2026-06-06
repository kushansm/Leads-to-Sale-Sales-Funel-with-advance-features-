"use server";

import { db } from "@/db";
import { leadActivity } from "@/db/crm-schema";
import { requireOrgMember, type ActionResult } from "@/lib/action-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LeadActivity = typeof leadActivity.$inferSelect;

export async function getLeadActivities(organizationId: string, leadId: string): Promise<ActionResult<LeadActivity[]>> {
  try {
    await requireOrgMember(organizationId);
    const activities = await db.select().from(leadActivity).where(eq(leadActivity.leadId, leadId)).orderBy(leadActivity.occurredAt);
    return { success: true, data: activities };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createLeadActivity(organizationId: string, leadId: string, data: { type: "call" | "email" | "meeting", subject: string, description?: string, occurredAt: Date }): Promise<ActionResult<LeadActivity>> {
  try {
    const { session } = await requireOrgMember(organizationId);
    const [activity] = await db.insert(leadActivity).values({ 
      leadId, 
      authorId: session.user.id, 
      ...data 
    }).returning();
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: activity };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteLeadActivity(organizationId: string, leadId: string, activityId: string): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db.delete(leadActivity).where(eq(leadActivity.id, activityId));
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

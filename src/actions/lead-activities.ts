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
    const activities = await db.select().from(leadActivity).where(eq(leadActivity.leadId, leadId)).orderBy(leadActivity.date);
    return { success: true, data: activities };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createLeadActivity(organizationId: string, leadId: string, data: { 
  type: "call" | "whatsapp" | "email" | "meeting" | "site_visit" | "follow_up" | "quotation_sent";
  date: Date;
  notes: string;
  result: string;
  nextAction?: string | null;
  nextActionDate?: Date | null;
}): Promise<ActionResult<LeadActivity>> {
  try {
    const { session } = await requireOrgMember(organizationId);
    
    // Start a transaction if needed, but for simplicity we can just do two queries
    // Update the lead first or last
    if (data.nextAction || data.nextActionDate) {
      const { updateLead } = await import("./leads");
      await updateLead(organizationId, leadId, {
        nextAction: data.nextAction || null,
        nextActionDate: data.nextActionDate || null,
      });
    }

    const [activity] = await db.insert(leadActivity).values({ 
      leadId, 
      authorId: session.user.id, 
      ...data,
      nextAction: data.nextAction || null,
      nextActionDate: data.nextActionDate || null,
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

"use server";

import { db } from "@/db";
import { leadTask } from "@/db/crm-schema";
import { requireOrgMember, type ActionResult } from "@/lib/action-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LeadTask = typeof leadTask.$inferSelect;

export async function getLeadTasks(organizationId: string, leadId: string): Promise<ActionResult<LeadTask[]>> {
  try {
    await requireOrgMember(organizationId);
    const tasks = await db.select().from(leadTask).where(eq(leadTask.leadId, leadId)).orderBy(leadTask.dueDate);
    return { success: true, data: tasks };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createLeadTask(organizationId: string, leadId: string, data: { title: string, description?: string, dueDate?: Date, assigneeId?: string }): Promise<ActionResult<LeadTask>> {
  try {
    await requireOrgMember(organizationId);
    const [task] = await db.insert(leadTask).values({ 
      leadId, 
      ...data 
    }).returning();
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: task };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateLeadTaskStatus(organizationId: string, leadId: string, taskId: string, status: "pending" | "completed" | "cancelled"): Promise<ActionResult<LeadTask>> {
  try {
    await requireOrgMember(organizationId);
    const [task] = await db.update(leadTask).set({ status, updatedAt: new Date() }).where(eq(leadTask.id, taskId)).returning();
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: task };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteLeadTask(organizationId: string, leadId: string, taskId: string): Promise<ActionResult> {
  try {
    await requireOrgMember(organizationId);
    await db.delete(leadTask).where(eq(leadTask.id, taskId));
    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

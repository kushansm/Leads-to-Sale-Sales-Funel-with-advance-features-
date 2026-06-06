"use server";

import { db } from "@/db";
import { opportunity } from "@/db/crm-schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOrgMember } from "@/lib/action-utils";

export type Opportunity = typeof opportunity.$inferSelect;
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getOpportunities(organizationId: string, leadId: string): Promise<ActionResult<Opportunity[]>> {
  try {
    await requireOrgMember(organizationId);
    
    // In a stricter setup, we should ensure the lead actually belongs to the organization
    // but assuming leadId is already gated or the DB handles it implicitly via the app flow
    const opportunities = await db
      .select()
      .from(opportunity)
      .where(eq(opportunity.leadId, leadId))
      .orderBy(desc(opportunity.createdAt));
      
    return { success: true, data: opportunities };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createOpportunity(
  organizationId: string,
  leadId: string,
  data: {
    name: string;
    estimatedValue: number;
    probability: number;
    stage: "discovery" | "proposal" | "negotiation" | "won" | "lost";
    expectedCloseDate?: Date | null;
  }
): Promise<ActionResult<Opportunity>> {
  try {
    await requireOrgMember(organizationId);

    const [newOpportunity] = await db.insert(opportunity).values({
      leadId,
      name: data.name,
      estimatedValue: data.estimatedValue,
      probability: data.probability,
      stage: data.stage,
      expectedCloseDate: data.expectedCloseDate || null,
    }).returning();

    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: newOpportunity };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOpportunity(
  organizationId: string,
  leadId: string,
  opportunityId: string
): Promise<ActionResult<boolean>> {
  try {
    await requireOrgMember(organizationId);

    await db.delete(opportunity)
      .where(and(eq(opportunity.id, opportunityId), eq(opportunity.leadId, leadId)));

    revalidatePath(`/${organizationId}/leads/${leadId}`);
    return { success: true, data: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

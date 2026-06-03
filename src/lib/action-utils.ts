/**
 * Shared utilities for server actions.
 * All actions validate the caller's session and org membership
 * before touching the database.
 */
import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "@/db";
import { member } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Returns the current session or throws an unauthenticated error. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthenticated");
  return session;
}

/**
 * Verifies the current user belongs to the given organization.
 * Returns the member row so callers can check the role.
 */
export async function requireOrgMember(organizationId: string) {
  const session = await requireSession();
  const [m] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, organizationId)
      )
    )
    .limit(1);

  if (!m) throw new Error("Forbidden: not a member of this organization");
  return { session, member: m };
}

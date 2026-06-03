"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RootPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();

  useEffect(() => {
    if (!isPending) {
      if (session) {
        if (activeOrg) {
          router.push(`/${activeOrg.slug}`);
        } else {
          // You could fetch all organizations here and pick the first one
          // Or direct them to a page to create an org. 
          // For now, if no active org is set, we'll try to let them create one.
          // Since our registration flow creates one, this usually won't happen unless they don't have one.
          router.push("/register"); 
        }
      } else {
        router.push("/login");
      }
    }
  }, [session, isPending, activeOrg, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground animate-pulse">Loading...</div>
    </div>
  );
}

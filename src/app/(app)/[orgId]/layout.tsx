import { UserMenu } from "@/components/shared/user-menu";
import Link from "next/link";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 hidden md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <span className="font-semibold">CRM</span>
          </div>
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-2 gap-1">
            <Link href={`/${orgId}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary">
              Dashboard
            </Link>
            <Link href={`/${orgId}/leads`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary">
              Leads
            </Link>
            <Link href={`/${orgId}/contacts`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary">
              Contacts
            </Link>
            <Link href={`/${orgId}/settings`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary">
              Settings
            </Link>
          </nav>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen">
        <header className="flex h-14 items-center justify-end border-b px-4 lg:h-[60px] lg:px-6">
          <UserMenu />
        </header>
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

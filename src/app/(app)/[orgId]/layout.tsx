import { UserMenu } from "@/components/shared/user-menu";

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 hidden md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <span className="font-semibold">Org: {params.orgId}</span>
          </div>
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <span className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
              Dashboard
            </span>
            <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              CRM Deals
            </span>
            <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              Customers
            </span>
            <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              Settings
            </span>
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

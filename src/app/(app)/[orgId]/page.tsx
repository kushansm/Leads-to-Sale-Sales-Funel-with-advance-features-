import { getLeads } from "@/actions/leads";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const leadsRes = await getLeads(orgId);
  const leads = leadsRes.success ? leadsRes.data : [];

  const now = new Date();
  now.setHours(0, 0, 0, 0); // start of today

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  let todayFollowUps = 0;
  let overdueFollowUps = 0;
  let tomorrowFollowUps = 0;

  leads.forEach(lead => {
    // Only count active leads
    if (lead.status === "won" || lead.status === "lost" || lead.status === "unqualified") return;

    if (lead.nextActionDate) {
      const actionDate = new Date(lead.nextActionDate);
      if (actionDate < now) {
        overdueFollowUps++;
      } else if (actionDate >= now && actionDate < tomorrow) {
        todayFollowUps++;
      } else if (actionDate >= tomorrow && actionDate < dayAfterTomorrow) {
        tomorrowFollowUps++;
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to your CRM dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Today's Follow Ups</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{todayFollowUps}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Overdue Follow Ups</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{overdueFollowUps}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Tomorrow's Follow Ups</p>
          <p className="text-2xl font-bold mt-1 text-orange-500">{tomorrowFollowUps}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Active Leads</p>
          <p className="text-2xl font-bold mt-1">{leads.filter(l => !["won", "lost", "unqualified"].includes(l.status)).length}</p>
        </div>
      </div>
    </div>
  );
}

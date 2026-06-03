import { getLeads } from "@/actions/leads";
import { LeadsDataTable } from "@/components/leads/leads-data-table";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  const result = await getLeads(orgId);
  const leads = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and track your sales leads across the pipeline.
        </p>
      </div>

      {!result.success && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load leads: {result.error}
        </div>
      )}

      <LeadsDataTable leads={leads} organizationId={orgId} />
    </div>
  );
}

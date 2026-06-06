import { getLeads } from "@/actions/leads";
import { LeadsDataTable } from "@/components/leads/leads-data-table";
import { LeadPipelineBoard } from "@/components/leads/lead-pipeline-board";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutList, KanbanSquare } from "lucide-react";

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { orgId } = await params;
  const { view } = await searchParams;
  const isBoardView = view === "board";

  const result = await getLeads(orgId);
  const leads = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track your sales leads across the pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Link href={`/${orgId}/leads?view=list`}>
            <Button variant={!isBoardView ? "secondary" : "ghost"} size="sm" className="h-8">
              <LayoutList className="mr-2 h-4 w-4" />
              List
            </Button>
          </Link>
          <Link href={`/${orgId}/leads?view=board`}>
            <Button variant={isBoardView ? "secondary" : "ghost"} size="sm" className="h-8">
              <KanbanSquare className="mr-2 h-4 w-4" />
              Board
            </Button>
          </Link>
        </div>
      </div>

      {!result.success && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load leads: {result.error}
        </div>
      )}

      {isBoardView ? (
        <LeadPipelineBoard leads={leads} organizationId={orgId} />
      ) : (
        <LeadsDataTable leads={leads} organizationId={orgId} />
      )}
    </div>
  );
}

"use client";

import { LeadWithRelations, updateLead } from "@/actions/leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LeadDetailsHeader({ orgId, lead }: { orgId: string, lead: LeadWithRelations }) {
  const handleMarkWon = async () => {
    const res = await updateLead(orgId, lead.id, { status: "won" });
    if (res.success) toast.success("Lead marked as Won");
    else toast.error(res.error);
  };

  const handleMarkLost = async () => {
    const res = await updateLead(orgId, lead.id, { status: "lost" });
    if (res.success) toast.success("Lead marked as Lost");
    else toast.error(res.error);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgId}/leads`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {lead.name}
            <Badge variant={
              lead.status === "won" ? "default" :
              lead.status === "lost" ? "destructive" : "secondary"
            } className="text-sm">
              {lead.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            {lead.company ? `${lead.company} • ` : ""}
            Added {new Date(lead.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={handleMarkWon} disabled={lead.status === "won"}>
          Mark as Won
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMarkLost}>Mark as Lost</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

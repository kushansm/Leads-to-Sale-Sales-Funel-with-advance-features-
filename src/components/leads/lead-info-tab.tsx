"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type LeadWithRelations } from "@/actions/leads";

export function LeadInfoTab({ lead }: { lead: LeadWithRelations }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">Email</Label>
            <div className="col-span-2 font-medium">{lead.email || "—"}</div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">Phone</Label>
            <div className="col-span-2 font-medium">{lead.phone || "—"}</div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">Location</Label>
            <div className="col-span-2 font-medium">{lead.location || "—"}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">Company</Label>
            <div className="col-span-2 font-medium">{lead.company || "—"}</div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">Assigned To</Label>
            <div className="col-span-2 font-medium">{lead.assignedUser?.name || "Unassigned"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

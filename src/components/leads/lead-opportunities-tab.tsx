"use client";

import { useState } from "react";
import { Opportunity, createOpportunity, deleteOpportunity } from "@/actions/opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, DollarSign, Target, CalendarDays, TrendingUp } from "lucide-react";

export function LeadOpportunitiesTab({ orgId, leadId, opportunities }: { orgId: string, leadId: string, opportunities: Opportunity[] }) {
  const [name, setName] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [probability, setProbability] = useState("50");
  const [stage, setStage] = useState<"discovery" | "proposal" | "negotiation" | "won" | "lost">("discovery");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const valueNum = parseInt(estimatedValue) || 0;
    const probNum = parseInt(probability) || 0;

    const res = await createOpportunity(orgId, leadId, {
      name,
      estimatedValue: valueNum,
      probability: probNum,
      stage,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
    });

    if (res.success) {
      toast.success("Opportunity added successfully!");
      setName("");
      setEstimatedValue("");
      setProbability("50");
      setStage("discovery");
      setExpectedCloseDate("");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      const res = await deleteOpportunity(orgId, leadId, id);
      if (res.success) toast.success("Opportunity deleted");
      else toast.error(res.error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatStage = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opportunity Name</Label>
                <Input placeholder="e.g. Enterprise License Expansion" value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Value ($)</Label>
                <Input type="number" placeholder="5000" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} required disabled={loading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={stage} onValueChange={(v: any) => setStage(v)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input type="number" min="0" max="100" value={probability} onChange={e => setProbability(e.target.value)} required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} disabled={loading} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading || !name.trim()}>Create Opportunity</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Active Opportunities</h3>
        {opportunities.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50 text-muted-foreground">
            No opportunities attached to this lead yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map(opp => (
              <Card key={opp.id} className="relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${opp.stage === 'won' ? 'bg-green-500' : opp.stage === 'lost' ? 'bg-red-500' : 'bg-blue-500'}`} />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-semibold text-lg">{opp.name}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(opp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium text-foreground">{formatCurrency(opp.estimatedValue)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatStage(opp.stage)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>{opp.probability}% Prob.</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>{opp.expectedCloseDate ? format(new Date(opp.expectedCloseDate), "MMM d, yyyy") : 'No date'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

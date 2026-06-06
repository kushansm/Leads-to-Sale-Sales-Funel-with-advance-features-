"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadActivity, createLeadActivity, deleteLeadActivity } from "@/actions/lead-activities";
import { format } from "date-fns";
import { PhoneCall, Mail, Calendar, Trash2, MessageCircle, MapPin, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function LeadActivitiesTab({ orgId, leadId, activities }: { orgId: string, leadId: string, activities: LeadActivity[] }) {
  const [type, setType] = useState<"call" | "whatsapp" | "email" | "meeting" | "site_visit" | "follow_up" | "quotation_sent">("call");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !result.trim() || !date) return;
    setLoading(true);
    const res = await createLeadActivity(orgId, leadId, { 
      type, 
      date: new Date(date), 
      notes, 
      result, 
      nextAction: nextAction || null, 
      nextActionDate: nextActionDate ? new Date(nextActionDate) : null 
    });
    if (res.success) {
      setNotes("");
      setResult("");
      setNextAction("");
      setNextActionDate("");
      setDate("");
      toast.success("Activity logged");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (activityId: string) => {
    const res = await deleteLeadActivity(orgId, leadId, activityId);
    if (res.success) toast.success("Activity deleted");
    else toast.error(res.error);
  };

  const getIcon = (t: string) => {
    if (t === "call") return <PhoneCall className="h-4 w-4" />;
    if (t === "whatsapp") return <MessageCircle className="h-4 w-4" />;
    if (t === "email") return <Mail className="h-4 w-4" />;
    if (t === "meeting") return <Calendar className="h-4 w-4" />;
    if (t === "site_visit") return <MapPin className="h-4 w-4" />;
    if (t === "quotation_sent") return <FileText className="h-4 w-4" />;
    return <ArrowRight className="h-4 w-4" />;
  };

  const formatType = (t: string) => {
    return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="site_visit">Site Visit</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="quotation_sent">Quotation Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="datetime-local" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Details of the interaction..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Result / Outcome</Label>
              <Input 
                placeholder="What was the result?" 
                value={result} 
                onChange={(e) => setResult(e.target.value)} 
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Action (Optional)</Label>
                <Input 
                  placeholder="E.g., Call back in 2 days" 
                  value={nextAction} 
                  onChange={(e) => setNextAction(e.target.value)} 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Action Date (Optional)</Label>
                <Input 
                  type="datetime-local" 
                  value={nextActionDate} 
                  onChange={(e) => setNextActionDate(e.target.value)} 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading || !notes.trim() || !result.trim() || !date}>
                Log Activity
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {activities.map((activity, i) => (
          <div key={activity.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground">
                {getIcon(activity.type)}
              </div>
              {i !== activities.length - 1 && (
                <div className="h-full w-px bg-border my-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-semibold">
                      {formatType(activity.type)}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(activity.date), "MMM d, yyyy h:mm a")}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(activity.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</span>
                      <p className="text-sm mt-1">{activity.notes}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result</span>
                      <p className="text-sm font-medium mt-1">{activity.result}</p>
                    </div>
                    {(activity.nextAction || activity.nextActionDate) && (
                      <div className="border-l-2 border-primary pl-3 mt-3">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Next Action</span>
                        <p className="text-sm mt-1">
                          {activity.nextAction} 
                          {activity.nextActionDate && <span className="text-muted-foreground ml-2">({format(new Date(activity.nextActionDate), "MMM d, yyyy")})</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No activities logged.
          </div>
        )}
      </div>
    </div>
  );
}

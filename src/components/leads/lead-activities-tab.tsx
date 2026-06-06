"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadActivity, createLeadActivity, deleteLeadActivity } from "@/actions/lead-activities";
import { format } from "date-fns";
import { PhoneCall, Mail, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function LeadActivitiesTab({ orgId, leadId, activities }: { orgId: string, leadId: string, activities: LeadActivity[] }) {
  const [type, setType] = useState<"call" | "email" | "meeting">("call");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setLoading(true);
    const res = await createLeadActivity(orgId, leadId, { type, subject, description, occurredAt: new Date() });
    if (res.success) {
      setSubject("");
      setDescription("");
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
    if (t === "email") return <Mail className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Select value={type} onValueChange={(val: any) => setType(val)} disabled={loading}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                disabled={loading}
                className="flex-1"
              />
            </div>
            <Textarea 
              placeholder="Description (optional)" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !subject.trim()}>Log Activity</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {activities.map(activity => (
          <Card key={activity.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 font-medium">
                  {getIcon(activity.type)}
                  {activity.subject}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(activity.occurredAt), "MMM d, yyyy h:mm a")}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(activity.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
              {activity.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
              )}
            </CardContent>
          </Card>
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

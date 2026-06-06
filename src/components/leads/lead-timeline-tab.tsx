"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LeadNote } from "@/actions/lead-notes";
import { LeadActivity } from "@/actions/lead-activities";
import { LeadTask } from "@/actions/lead-tasks";
import { format } from "date-fns";
import { PhoneCall, Mail, Calendar, StickyNote, CheckSquare } from "lucide-react";

type TimelineItem = {
  id: string;
  type: "note" | "call" | "email" | "meeting" | "task";
  title: string;
  description?: string;
  date: Date;
  status?: string;
};

export function LeadTimelineTab({
  notes,
  activities,
  tasks,
}: {
  notes: LeadNote[];
  activities: LeadActivity[];
  tasks: LeadTask[];
}) {
  const items: TimelineItem[] = [
    ...notes.map((n) => ({
      id: n.id,
      type: "note" as const,
      title: "Note added",
      description: n.content,
      date: new Date(n.createdAt),
    })),
    ...activities.map((a) => ({
      id: a.id,
      type: a.type as "call" | "email" | "meeting",
      title: a.subject,
      description: a.description || undefined,
      date: new Date(a.occurredAt),
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      title: t.title,
      description: t.description || undefined,
      date: new Date(t.createdAt),
      status: t.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <p>No history for this lead yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "call": return <PhoneCall className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "meeting": return <Calendar className="h-4 w-4" />;
      case "note": return <StickyNote className="h-4 w-4" />;
      case "task": return <CheckSquare className="h-4 w-4" />;
      default: return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground">
              {getIcon(item.type)}
            </div>
            {i !== items.length - 1 && (
              <div className="h-full w-px bg-border my-2" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="font-semibold flex items-center gap-2">
                    {item.title}
                    {item.type === "task" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        item.status === "completed" ? "bg-green-100 text-green-700 border-green-200" :
                        item.status === "cancelled" ? "bg-gray-100 text-gray-700 border-gray-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(item.date, "MMM d, yyyy h:mm a")}
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}

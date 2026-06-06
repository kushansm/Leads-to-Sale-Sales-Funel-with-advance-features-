"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Lead } from "@/actions/leads";
import { updateLead } from "@/actions/leads";
import { Card, CardContent } from "@/components/ui/card";
import { LeadTemperatureBadge } from "@/components/shared/lead-badges";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const COLUMNS = [
  { id: "new", title: "New" },
  { id: "contacting", title: "Contacting" },
  { id: "interested", title: "Interested" },
  { id: "evaluating", title: "Evaluating" },
  { id: "proposal_sent", title: "Proposal Sent" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
  { id: "dormant", title: "Dormant" },
] as const;

export function LeadPipelineBoard({ leads: initialLeads, organizationId }: { leads: Lead[], organizationId: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  if (!isMounted) {
    return <div className="h-96 flex items-center justify-center">Loading board...</div>;
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as any;
    
    // Optimistic update
    const previousLeads = [...leads];
    const updatedLeads = leads.map(l => 
      l.id === draggableId ? { ...l, status: newStatus } : l
    );
    setLeads(updatedLeads);

    // Persist
    const res = await updateLead(organizationId, draggableId, { status: newStatus });
    if (!res.success) {
      toast.error(res.error);
      setLeads(previousLeads); // rollback
    } else {
      router.refresh(); // revalidate
    }
  };

  const leadsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = leads.filter(l => l.status === col.id);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] min-h-[600px] snap-x">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[300px] w-[300px] snap-center bg-muted/50 rounded-xl p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-sm">{col.title}</h3>
              <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border">
                {leadsByStatus[col.id].length}
              </span>
            </div>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 flex flex-col gap-2 rounded-lg transition-colors min-h-[150px] ${snapshot.isDraggingOver ? "bg-muted" : ""}`}
                >
                  {leadsByStatus[col.id].map((lead, index) => {
                    const isActive = !["won", "lost", "dormant"].includes(lead.status);
                    const needsFollowUp = isActive && !lead.nextActionDate;

                    return (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card
                              className={`shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${snapshot.isDragging ? "shadow-md ring-2 ring-primary/20" : ""}`}
                              onClick={() => router.push(`/${organizationId}/leads/${lead.id}`)}
                            >
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-medium text-sm leading-tight flex items-center gap-1.5">
                                    {lead.name}
                                    {needsFollowUp && (
                                      <span title="No Follow-Up Scheduled">
                                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                    </span>
                                    )}
                                  </div>
                                  <LeadTemperatureBadge temperature={lead.temperature} />
                                </div>
                                {lead.company && (
                                  <p className="text-xs text-muted-foreground mb-2">{lead.company}</p>
                                )}
                                <div className="flex justify-between items-end mt-2 pt-2 border-t">
                                  <div className="text-[10px] text-muted-foreground">
                                    {format(new Date(lead.createdAt), "MMM d")}
                                  </div>
                                  {lead.nextActionDate && isActive && (
                                    <div className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                      Next: {format(new Date(lead.nextActionDate), "MMM d")}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

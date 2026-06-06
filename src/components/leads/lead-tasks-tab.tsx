"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LeadTask, createLeadTask, updateLeadTaskStatus, deleteLeadTask } from "@/actions/lead-tasks";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function LeadTasksTab({ orgId, leadId, tasks }: { orgId: string, leadId: string, tasks: LeadTask[] }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const res = await createLeadTask(orgId, leadId, { title });
    if (res.success) {
      setTitle("");
      toast.success("Task created");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const toggleTask = async (task: LeadTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const res = await updateLeadTaskStatus(orgId, leadId, task.id, newStatus);
    if (!res.success) toast.error(res.error);
  };

  const removeTask = async (taskId: string) => {
    const res = await deleteLeadTask(orgId, leadId, taskId);
    if (res.success) toast.success("Task deleted");
    else toast.error(res.error);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              placeholder="Add a new task..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !title.trim()}>Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {tasks.map(task => (
          <Card key={task.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={task.status === "completed"} 
                  onCheckedChange={() => toggleTask(task)} 
                />
                <div className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-muted-foreground">
                  {format(new Date(task.createdAt), "MMM d")}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No tasks yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}

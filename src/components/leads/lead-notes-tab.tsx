"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LeadNote, createLeadNote, deleteLeadNote } from "@/actions/lead-notes";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function LeadNotesTab({ orgId, leadId, notes }: { orgId: string, leadId: string, notes: LeadNote[] }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const res = await createLeadNote(orgId, leadId, content);
    if (res.success) {
      setContent("");
      toast.success("Note added");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (noteId: string) => {
    const res = await deleteLeadNote(orgId, leadId, noteId);
    if (res.success) toast.success("Note deleted");
    else toast.error(res.error);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea 
              placeholder="Write a note..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !content.trim()}>Save Note</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map(note => (
          <Card key={note.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(note.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              <p className="whitespace-pre-wrap">{note.content}</p>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No notes yet.
          </div>
        )}
      </div>
    </div>
  );
}

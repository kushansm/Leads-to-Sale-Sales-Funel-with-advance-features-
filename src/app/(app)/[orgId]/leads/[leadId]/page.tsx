import { notFound } from "next/navigation";
import { getLeadById } from "@/actions/leads";
import { getLeadNotes } from "@/actions/lead-notes";
import { getLeadActivities } from "@/actions/lead-activities";
import { getLeadTasks } from "@/actions/lead-tasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadDetailsHeader } from "@/components/leads/lead-details-header";
import { LeadInfoTab } from "@/components/leads/lead-info-tab";
import { LeadTimelineTab } from "@/components/leads/lead-timeline-tab";
import { LeadNotesTab } from "@/components/leads/lead-notes-tab";
import { LeadActivitiesTab } from "@/components/leads/lead-activities-tab";
import { LeadTasksTab } from "@/components/leads/lead-tasks-tab";

export default async function LeadDetailsPage(props: { params: Promise<{ orgId: string, leadId: string }> }) {
  const params = await props.params;
  const { orgId, leadId } = params;

  const [leadRes, notesRes, activitiesRes, tasksRes] = await Promise.all([
    getLeadById(orgId, leadId),
    getLeadNotes(orgId, leadId),
    getLeadActivities(orgId, leadId),
    getLeadTasks(orgId, leadId),
  ]);

  if (!leadRes.success || !leadRes.data) {
    return notFound();
  }

  const lead = leadRes.data;
  const notes = notesRes.success ? notesRes.data : [];
  const activities = activitiesRes.success ? activitiesRes.data : [];
  const tasks = tasksRes.success ? tasksRes.data : [];

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <LeadDetailsHeader orgId={orgId} lead={lead} />

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto rounded-md bg-muted p-1">
          <TabsTrigger value="info" className="py-2">Info</TabsTrigger>
          <TabsTrigger value="timeline" className="py-2">Timeline</TabsTrigger>
          <TabsTrigger value="notes" className="py-2">Notes</TabsTrigger>
          <TabsTrigger value="activities" className="py-2">Activities</TabsTrigger>
          <TabsTrigger value="tasks" className="py-2">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <LeadInfoTab lead={lead} />
        </TabsContent>
        <TabsContent value="timeline">
          <LeadTimelineTab notes={notes} activities={activities} tasks={tasks} />
        </TabsContent>
        <TabsContent value="notes">
          <LeadNotesTab orgId={orgId} leadId={lead.id} notes={notes} />
        </TabsContent>
        <TabsContent value="activities">
          <LeadActivitiesTab orgId={orgId} leadId={lead.id} activities={activities} />
        </TabsContent>
        <TabsContent value="tasks">
          <LeadTasksTab orgId={orgId} leadId={lead.id} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

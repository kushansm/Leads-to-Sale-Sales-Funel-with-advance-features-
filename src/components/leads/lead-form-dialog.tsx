"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLead, updateLead, type Lead } from "@/actions/leads";

const STATUSES = [
  { value: "new",         label: "New" },
  { value: "contacted",   label: "Contacted" },
  { value: "qualified",   label: "Qualified" },
  { value: "proposal",    label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won",         label: "Won" },
  { value: "lost",        label: "Lost" },
  { value: "unqualified", label: "Unqualified" },
];

const TEMPERATURES = [
  { value: "hot",  label: "🔥 Hot" },
  { value: "warm", label: "☀️ Warm" },
  { value: "cold", label: "❄️ Cold" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  lead?: Lead; // if present → edit mode
};

export function LeadFormDialog({ open, onOpenChange, organizationId, lead }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name:        lead?.name        ?? "",
    phone:       lead?.phone       ?? "",
    email:       lead?.email       ?? "",
    company:     lead?.company     ?? "",
    location:    lead?.location    ?? "",
    status:      lead?.status      ?? "new",
    temperature: lead?.temperature ?? "warm",
  });

  const isEdit = !!lead;

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = isEdit
        ? await updateLead(organizationId, lead.id, form)
        : await createLead(organizationId, form as any);

      if (result.success) {
        toast.success(isEdit ? "Lead updated" : "Lead created");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the lead details below." : "Fill in the details to create a new lead."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="lead-name">Full Name *</Label>
            <Input
              id="lead-name"
              required
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Company + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead-company">Company</Label>
              <Input
                id="lead-company"
                placeholder="Acme Inc."
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-location">Location</Label>
              <Input
                id="lead-location"
                placeholder="New York, USA"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
          </div>

          {/* Status + Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleChange("status", v)}
              >
                <SelectTrigger id="lead-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Temperature</Label>
              <Select
                value={form.temperature}
                onValueChange={(v) => handleChange("temperature", v)}
              >
                <SelectTrigger id="lead-temperature">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Update Lead" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

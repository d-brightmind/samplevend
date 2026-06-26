import { z } from "zod";

export const engagementStatuses = [
  "UNSCHEDULED",
  "SCHEDULED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
] as const;

const optionalDate = z
  .string()
  .datetime()
  .optional()
  .or(z.literal(""));

export const engagementPayloadSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required.").max(140),
    clientName: z.string().trim().min(2, "Client name is required.").max(120),
    clientEmail: z.string().trim().email().optional().or(z.literal("")),
    clientPhone: z.string().trim().max(40).optional().or(z.literal("")),
    serviceType: z.string().trim().max(80).optional().or(z.literal("")),
    description: z.string().trim().max(1200).optional().or(z.literal("")),
    status: z.enum(engagementStatuses).default("UNSCHEDULED"),
    resourceId: z.string().uuid().optional().or(z.literal("")),
    scheduledStart: optionalDate,
    scheduledEnd: optionalDate,
    locationLabel: z.string().trim().max(180).optional().or(z.literal("")),
    latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
    longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal(""))
  })
  .superRefine((value, ctx) => {
    if ((value.status === "SCHEDULED" || value.status === "ASSIGNED") && (!value.scheduledStart || !value.scheduledEnd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledStart"],
        message: "Scheduled engagements need a start and end time."
      });
    }

    if (value.status === "ASSIGNED" && !value.resourceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resourceId"],
        message: "Assigned engagements need a resource."
      });
    }

    if (value.scheduledStart && value.scheduledEnd) {
      const start = new Date(value.scheduledStart);
      const end = new Date(value.scheduledEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledEnd"],
          message: "End time must be after start time."
        });
      }
    }
  });

export const engagementAssignmentSchema = z.object({
  resourceId: z.string().uuid("Select a valid resource."),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional()
});

export const engagementStatusSchema = z.object({
  status: z.enum(engagementStatuses),
  note: z.string().trim().max(400).optional()
});

export const cancelEngagementSchema = z.object({
  reason: z.string().trim().min(2, "Cancellation reason is required.").max(400)
});

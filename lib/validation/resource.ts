import { z } from "zod";

export const resourceStatuses = ["AVAILABLE", "BUSY", "OFFLINE", "ON_LEAVE", "DEACTIVATED"] as const;
export const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time format.");

export const availabilitySchema = z.object({
  weekday: z.enum(weekdays),
  startTime: timeSchema,
  endTime: timeSchema,
  timezone: z.string().min(2).max(80).default("UTC"),
  isWorking: z.boolean().default(true)
});

export const resourcePayloadSchema = z.object({
  photoUrl: z.string().url().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Name is required.").max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  title: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(resourceStatuses).default("AVAILABLE"),
  locationLabel: z.string().trim().max(160).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1).max(50)).max(12).default([]),
  availability: z.array(availabilitySchema).max(7).default([])
});

export const resourceStatusSchema = z.object({
  status: z.enum(resourceStatuses),
  note: z.string().trim().max(400).optional()
});

export const deactivateResourceSchema = z.object({
  reason: z.string().trim().max(400).optional()
});

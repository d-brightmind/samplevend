import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    serviceId: z.string().uuid().optional().or(z.literal("")),
    serviceName: z.string().trim().min(2, "Choose a service.").max(120),
    requestedStart: z.string().datetime("Choose a valid date and time."),
    clientName: z.string().trim().min(2, "Enter your name.").max(120),
    clientEmail: z.string().trim().email("Enter a valid email.").transform((value) => value.toLowerCase()),
    clientPhone: z.string().trim().max(40).optional().or(z.literal("")),
    locationLabel: z.string().trim().min(2, "Enter the service address or area.").max(180),
    notes: z.string().trim().max(1000).optional().or(z.literal(""))
  })
  .superRefine((value, ctx) => {
    const requestedStart = new Date(value.requestedStart);
    if (Number.isNaN(requestedStart.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requestedStart"],
        message: "Choose a valid date and time."
      });
      return;
    }

    if (requestedStart.getTime() < Date.now() + 30 * 60 * 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requestedStart"],
        message: "Choose a time at least 30 minutes from now."
      });
    }
  });

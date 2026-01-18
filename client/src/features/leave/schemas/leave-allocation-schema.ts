import * as z from "zod";
import { LeaveMessages } from "@/lib/constants";

export const createLeaveAllocationSchema = (mode: "create" | "view" | "edit") => {
  return z.object({
    leave_type:
      mode === "edit"
        ? z.number().optional()
        : z
            .number({
              required_error: LeaveMessages.Validation.LEAVE_TYPE_REQUIRED,
            })
            .min(1, LeaveMessages.Validation.LEAVE_TYPE_INVALID),
    name: z.string().optional(),
    description: z.string().optional(),
    total_days: z
      .string()
      .min(1, LeaveMessages.Validation.TOTAL_DAYS_REQUIRED)
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, LeaveMessages.Validation.TOTAL_DAYS_POSITIVE),
    max_carry_forward_days: z
      .string()
      .min(1, LeaveMessages.Validation.CARRY_FORWARD_DAYS_REQUIRED)
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, LeaveMessages.Validation.CARRY_FORWARD_DAYS_POSITIVE),
    roles: z.array(z.number()).min(1, LeaveMessages.Validation.ROLES_REQUIRED),
    effective_from: z.date({
      required_error: LeaveMessages.Validation.EFFECTIVE_FROM_REQUIRED,
    }),
    effective_to: z.date().optional(),
  })
  .refine((data) => {
    const totalDays = parseFloat(data.total_days);
    const carryForwardDays = parseFloat(data.max_carry_forward_days);
    return carryForwardDays <= totalDays;
  }, {
    message: LeaveMessages.Validation.CARRY_FORWARD_EXCEEDS_TOTAL,
    path: ["max_carry_forward_days"],
  })
  .refine((data) => {
    if (data.effective_to) {
      return data.effective_to >= data.effective_from;
    }
    return true;
  }, {
    message: LeaveMessages.Validation.EFFECTIVE_TO_BEFORE_FROM,
    path: ["effective_to"],
  });
};

export type LeaveAllocationFormValues = z.infer<ReturnType<typeof createLeaveAllocationSchema>>;

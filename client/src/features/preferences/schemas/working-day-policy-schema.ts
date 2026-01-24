import * as z from "zod";
import { WorkingDayPolicyMessages } from "@/lib/constants/leave-messages";

export const workingDayPolicySchema = z.object({
  sunday_off: z.boolean(),
  saturday_off_pattern: z.string().min(1, WorkingDayPolicyMessages.Validation.SATURDAY_PATTERN_REQUIRED),
  effective_from: z.date({
    required_error: WorkingDayPolicyMessages.Validation.EFFECTIVE_FROM_REQUIRED,
  }),
  effective_to: z.date().optional().nullable(),
})
.refine((data) => {
  if (data.effective_to) {
    return data.effective_to >= data.effective_from;
  }
  return true;
}, {
  message: WorkingDayPolicyMessages.Validation.EFFECTIVE_TO_BEFORE_FROM,
  path: ["effective_to"],
});

export type WorkingDayPolicyFormValues = z.infer<typeof workingDayPolicySchema>;

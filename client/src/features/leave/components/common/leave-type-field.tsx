import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type LeaveType } from "@/lib/api/leave-api";

interface LeaveTypeFieldProps {
  control: Control<any>;
  leaveTypes: LeaveType[];
  mode: "create" | "view" | "edit";
  initialLeaveTypeName?: string;
}

export function LeaveTypeField({ 
  control, 
  leaveTypes, 
  mode,
  initialLeaveTypeName 
}: LeaveTypeFieldProps) {
  const isReadOnly = mode === "view" || mode === "edit";

  return (
    <FormField
      control={control}
      name="leave_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Leave Type *</FormLabel>
          {isReadOnly ? (
            <div className="rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
              {initialLeaveTypeName || "Not selected"}
            </div>
          ) : (
            <Select
              onValueChange={(value) => field.onChange(parseInt(value))}
              value={field.value > 0 ? field.value.toString() : undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name} ({type.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormDescription>
            {mode === "edit" 
              ? "Leave type cannot be changed after creation" 
              : "Choose the type of leave for this allocation"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

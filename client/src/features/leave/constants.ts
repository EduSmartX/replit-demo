/**
 * Leave Management Constants
 * Synced with backend edusphere/leave/constants.py
 */

export const LeaveRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type LeaveRequestStatusType = (typeof LeaveRequestStatus)[keyof typeof LeaveRequestStatus];

export const LEAVE_STATUS_CONFIG = {
  [LeaveRequestStatus.PENDING]: {
    variant: "default" as const,
    className: "bg-yellow-500 hover:bg-yellow-600",
    label: "Pending",
  },
  [LeaveRequestStatus.APPROVED]: {
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
    label: "Approved",
  },
  [LeaveRequestStatus.REJECTED]: {
    variant: "destructive" as const,
    className: "",
    label: "Rejected",
  },
  [LeaveRequestStatus.CANCELLED]: {
    variant: "secondary" as const,
    className: "",
    label: "Cancelled",
  },
} as const;

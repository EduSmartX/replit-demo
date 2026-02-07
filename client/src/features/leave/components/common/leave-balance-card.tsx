/**
 * Leave Balance Card Component
 * Displays a single leave balance with type, allocated, used, and available days
 * Reusable across Admin, Teacher, and Student dashboards
 */

import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LeaveBalance } from "@/lib/api/leave-api";

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const usagePercentage =
    balance.total_allocated > 0 ? (balance.used / balance.total_allocated) * 100 : 0;

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) {
      return "text-red-600";
    }
    if (percentage >= 50) {
      return "text-yellow-600";
    }
    return "text-green-600";
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg">
              {balance.leave_allocation?.name || balance.leave_allocation?.leave_type?.name || "-"}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {balance.leave_allocation?.leave_type?.code || "-"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{balance.total_allocated}</div>
            <div className="text-muted-foreground text-xs">Allocated</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${getUsageColor(usagePercentage)}`}>
              {balance.used}
            </div>
            <div className="text-muted-foreground text-xs">Used</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{balance.available}</div>
            <div className="text-muted-foreground text-xs">Available</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className={`font-medium ${getUsageColor(usagePercentage)}`}>
              {usagePercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        {balance.carried_forward > 0 && (
          <div className="text-muted-foreground flex items-center space-x-2 rounded bg-indigo-50 p-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>{balance.carried_forward} days carried forward</span>
          </div>
        )}

        <div className="text-muted-foreground flex items-center space-x-2 border-t pt-2 text-xs">
          <Clock className="h-3 w-3" />
          <span>Updated: {new Date(balance.updated_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

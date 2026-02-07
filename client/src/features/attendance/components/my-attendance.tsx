/**
 * My Attendance Component
 * Allows users to check in/out and view their attendance history
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { checkIn, checkOut, getMyAttendance, getTodayAttendance } from "@/lib/api/attendance-api";

export function MyAttendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  // Fetch today's attendance status
  const {
    data: todayData,
    isLoading: todayLoading,
    error: todayError,
    refetch: refetchToday,
  } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: getTodayAttendance,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch attendance history
  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["my-attendance"],
    queryFn: () => getMyAttendance(),
    staleTime: 30000,
  });

  const today = todayData?.data;
  const history = historyData?.data;

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      toast({
        title: "Checked In Successfully",
        description: `You checked in at ${format(new Date(), "hh:mm a")}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      toast({
        title: "Checked Out Successfully",
        description: `You checked out at ${format(new Date(), "hh:mm a")}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-out Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate({});
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({});
  };

  // Show full loading only on initial load when there's no data
  if (todayLoading && !todayData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading your attendance information...</p>
        </div>
      </div>
    );
  }

  if (todayError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load attendance data. {(todayError as Error).message}
          <Button variant="outline" size="sm" onClick={() => refetchToday()} className="ml-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      case "HALF_DAY":
        return "bg-yellow-100 text-yellow-800";
      case "ON_LEAVE":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
          <p className="text-muted-foreground">Track your attendance and working hours</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchToday();
            refetchHistory();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Today's Attendance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Attendance
          </CardTitle>
          <CardDescription>{format(currentTime, "EEEE, MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Time Display */}
            <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <Clock className="mb-4 h-12 w-12 text-blue-600" />
              <div className="text-4xl font-bold text-blue-900">
                {format(currentTime, "hh:mm:ss a")}
              </div>
              <div className="mt-2 text-sm text-blue-700">Current Time</div>
            </div>

            {/* Check-in/out Status */}
            <div className="space-y-4">
              {today?.has_checked_in ? (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">Checked In</div>
                    <div className="text-sm text-green-700">
                      {today.check_in_time
                        ? format(new Date(today.check_in_time), "hh:mm a")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="h-auto w-full bg-green-600 py-6 hover:bg-green-700"
                  size="lg"
                >
                  {checkInMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Check In
                    </>
                  )}
                </Button>
              )}

              {today?.has_checked_in && !today?.has_checked_out && (
                <Button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="h-auto w-full bg-orange-600 py-6 hover:bg-orange-700"
                  size="lg"
                >
                  {checkOutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-5 w-5" />
                      Check Out
                    </>
                  )}
                </Button>
              )}

              {today?.has_checked_out && (
                <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-semibold text-orange-900">Checked Out</div>
                    <div className="text-sm text-orange-700">
                      {today.check_out_time
                        ? format(new Date(today.check_out_time), "hh:mm a")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              )}

              {today?.work_hours !== null && today?.work_hours !== undefined && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-sm text-blue-700">Today&apos;s Work Hours</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {today.work_hours.toFixed(2)} hours
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      {historyLoading && !historyData ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
              <p className="text-muted-foreground text-sm">Loading attendance history...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        history && (
          <>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Attendance Summary</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg bg-blue-100 p-6">
                  <div className="text-5xl font-bold">{history.summary.total_days}</div>
                  <div className="mt-2 text-sm font-semibold">Total Days</div>
                </div>
                <div className="rounded-lg bg-green-100 p-6">
                  <div className="text-5xl font-bold">{history.summary.present_days}</div>
                  <div className="mt-2 text-sm font-semibold">Present Days</div>
                </div>
                <div className="rounded-lg bg-red-100 p-6">
                  <div className="text-5xl font-bold">{history.summary.absent_days}</div>
                  <div className="mt-2 text-sm font-semibold">Absent Days</div>
                </div>
                <div className="rounded-lg bg-yellow-100 p-6">
                  <div className="text-5xl font-bold">{history.summary.half_days}</div>
                  <div className="mt-2 text-sm font-semibold">Half Days</div>
                </div>
                <div className="rounded-lg bg-purple-100 p-6">
                  <div className="text-5xl font-bold">
                    {history.summary.attendance_percentage.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-sm font-semibold">Attendance Rate</div>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your attendance records for this month</CardDescription>
              </CardHeader>
              <CardContent>
                {history.records.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No attendance records found.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {history.records.slice(0, 10).map((record) => (
                      <div
                        key={record.public_id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(record.date), "EEEE, MMM d, yyyy")}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {record.check_in_time
                                ? `In: ${format(new Date(record.check_in_time), "hh:mm a")}`
                                : "No check-in"}
                              {record.check_out_time &&
                                ` | Out: ${format(new Date(record.check_out_time), "hh:mm a")}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {record.work_hours > 0 && (
                            <div className="text-sm font-medium text-gray-700">
                              {record.work_hours.toFixed(2)}h
                            </div>
                          )}
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}

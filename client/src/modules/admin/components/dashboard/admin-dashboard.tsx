/**
 * Admin Dashboard Component
 * Main overview dashboard displaying key metrics, charts, and recent activity.
 * Shows statistics for students, teachers, classes, attendance trends, and leave requests.
 * Uses mock data for demonstration - integrate with real API in production.
 */

import { Users, BookOpen, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const attendanceData = [
  { day: "Mon", present: 145, absent: 15, late: 8 },
  { day: "Tue", present: 148, absent: 10, late: 6 },
  { day: "Wed", present: 142, absent: 18, late: 10 },
  { day: "Thu", present: 150, absent: 12, late: 4 },
  { day: "Fri", present: 146, absent: 14, late: 7 },
];

const leaveData = [
  { name: "Approved", value: 45, color: "#10b981" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Rejected", value: 3, color: "#ef4444" },
];

const stats = [
  {
    label: "Total Students",
    value: "1,245",
    change: "+12",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
  },
  {
    label: "Total Teachers",
    value: "85",
    change: "+2",
    icon: Users,
    color: "text-green-600",
    bg: "bg-gradient-to-br from-green-50 to-green-100",
  },
  {
    label: "Active Classes",
    value: "42",
    change: "=",
    icon: BookOpen,
    color: "text-teal-600",
    bg: "bg-gradient-to-br from-teal-50 to-teal-100",
  },
  {
    label: "Today's Attendance",
    value: "94.2%",
    change: "+1.2%",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-gradient-to-br from-orange-50 to-orange-100",
  },
];

const recentActivities = [
  {
    type: "leave_request",
    description: "New leave request from Ms. Sarah (Class 5A)",
    time: "2 hours ago",
    status: "pending",
  },
  {
    type: "attendance",
    description: "Attendance marked for Class 3B",
    time: "4 hours ago",
    status: "completed",
  },
  {
    type: "event",
    description: "Science Fair scheduled for next week",
    time: "1 day ago",
    status: "completed",
  },
  {
    type: "notice",
    description: "School Annual Day planning meeting",
    time: "2 days ago",
    status: "completed",
  },
];

const upcomingEvents = [
  { title: "Parent-Teacher Meeting", date: "Dec 30, 2025", type: "Meeting" },
  { title: "Annual Day Celebration", date: "Jan 15, 2026", type: "Event" },
  { title: "Term 2 Exams Begin", date: "Jan 20, 2026", type: "Exam" },
  { title: "Sports Day", date: "Feb 5, 2026", type: "Event" },
];

export function DashboardContent() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-4xl font-bold text-transparent">
          Welcome back, John
        </h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening at your school today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              data-testid={`stat-card-${index}`}
              className={`${stat.bg} border-0 shadow-lg transition-shadow hover:shadow-xl`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div
                  className={`bg-gradient-to-r text-2xl font-bold ${stat.color === "text-blue-600" ? "from-blue-600 to-teal-600" : stat.color === "text-green-600" ? "from-green-600 to-emerald-600" : "from-teal-600 to-green-600"} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <p className="mt-1 text-xs font-semibold text-green-600">
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Chart */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur lg:col-span-2">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="text-blue-900">Weekly Attendance</CardTitle>
            <CardDescription className="text-blue-700">
              Daily attendance overview for this week
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Status Pie Chart */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="text-green-900">Leave Requests</CardTitle>
            <CardDescription className="text-green-700">
              Current status of leave applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-blue-900">Recent Activities</CardTitle>
            <CardDescription className="text-blue-700">
              Latest updates in your school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 border-b border-gray-100 pb-4 last:border-0"
                data-testid={`activity-${index}`}
              >
                <div className="mt-1">
                  {activity.status === "pending" ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-green-900">Upcoming Events</CardTitle>
            <CardDescription className="text-green-700">
              Important dates and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-0"
                data-testid={`event-${index}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{event.date}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-green-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                  {event.type}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

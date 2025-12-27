import { Calendar, Users, BookOpen, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  },
  {
    label: "Total Teachers",
    value: "85",
    change: "+2",
    icon: Users,
    color: "text-purple-600",
  },
  {
    label: "Active Classes",
    value: "42",
    change: "=",
    icon: BookOpen,
    color: "text-green-600",
  },
  {
    label: "Today's Attendance",
    value: "94.2%",
    change: "+1.2%",
    icon: TrendingUp,
    color: "text-orange-600",
  },
];

const recentActivities = [
  { type: "leave_request", description: "New leave request from Ms. Sarah (Class 5A)", time: "2 hours ago", status: "pending" },
  { type: "attendance", description: "Attendance marked for Class 3B", time: "4 hours ago", status: "completed" },
  { type: "event", description: "Science Fair scheduled for next week", time: "1 day ago", status: "completed" },
  { type: "notice", description: "School Annual Day planning meeting", time: "2 days ago", status: "completed" },
];

const upcomingEvents = [
  { title: "Parent-Teacher Meeting", date: "Dec 30, 2025", type: "Meeting" },
  { title: "Annual Day Celebration", date: "Jan 15, 2026", type: "Event" },
  { title: "Term 2 Exams Begin", date: "Jan 20, 2026", type: "Exam" },
  { title: "Sports Day", date: "Feb 5, 2026", type: "Event" },
];

export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, John</h1>
        <p className="text-muted-foreground">Here's what's happening at your school today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change} from last week</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Daily attendance overview for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Current status of leave applications</CardDescription>
          </CardHeader>
          <CardContent>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates in your school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0" data-testid={`activity-${index}`}>
                <div className="mt-1">
                  {activity.status === "pending" ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Important dates and activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-border last:border-0" data-testid={`event-${index}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
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

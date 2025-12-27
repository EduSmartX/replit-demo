import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, BookOpen, Clock, TrendingUp } from "lucide-react";

const classPerformance = [
  { class: "Class 9A", avg: 78, present: 38, absent: 2 },
  { class: "Class 9B", avg: 82, present: 40, absent: 0 },
  { class: "Class 10A", avg: 75, present: 35, absent: 5 },
  { class: "Class 10B", avg: 88, present: 42, absent: 0 },
];

const studentProgress = [
  { name: "Excellent", value: 45, color: "#10b981" },
  { name: "Good", value: 65, color: "#3b82f6" },
  { name: "Average", value: 35, color: "#f59e0b" },
  { name: "Needs Help", value: 15, color: "#ef4444" },
];

const stats = [
  {
    label: "Total Students",
    value: "152",
    change: "+5",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
  },
  {
    label: "Classes",
    value: "4",
    change: "=",
    icon: BookOpen,
    color: "text-pink-600",
    bg: "bg-gradient-to-br from-pink-50 to-pink-100",
  },
  {
    label: "Avg Attendance",
    value: "95.2%",
    change: "+2.1%",
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
  },
  {
    label: "High Performers",
    value: "45",
    change: "+3",
    icon: TrendingUp,
    color: "text-pink-600",
    bg: "bg-gradient-to-br from-pink-50 to-pink-100",
  },
];

const upcomingClasses = [
  { class: "Class 9A - Mathematics", time: "10:00 AM", room: "Room 102" },
  { class: "Class 10B - Science", time: "1:00 PM", room: "Lab 1" },
  { class: "Class 9B - Mathematics", time: "2:30 PM", room: "Room 105" },
];

export function TeacherDashboardContent({ username }: { username: string }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome, {username}
        </h1>
        <p className="text-gray-600">Manage your classes and track student progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              data-testid={`stat-card-${index}`}
              className={`${stat.bg} border-0 shadow-lg hover:shadow-xl transition-shadow`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-xs text-purple-600 mt-1 font-semibold">{stat.change} this month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
            <CardTitle className="text-purple-900">Class Performance</CardTitle>
            <CardDescription className="text-purple-700">Average scores by class</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="#a855f7" name="Avg Score" radius={[8, 8, 0, 0]} />
                <Bar dataKey="present" fill="#ec4899" name="Present" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
            <CardTitle className="text-pink-900">Student Progress</CardTitle>
            <CardDescription className="text-pink-700">Overall performance distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentProgress}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="text-purple-900">Today's Classes</CardTitle>
          <CardDescription className="text-purple-700">Your scheduled classes for today</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {upcomingClasses.map((cls, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cls.class}</p>
                  <p className="text-xs text-gray-500 mt-1">{cls.time} • {cls.room}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

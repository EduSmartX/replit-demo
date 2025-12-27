import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { User, TrendingUp, Calendar, BookOpen } from "lucide-react";

const attendanceData = [
  { week: "Week 1", attendance: 95 },
  { week: "Week 2", attendance: 92 },
  { week: "Week 3", attendance: 98 },
  { week: "Week 4", attendance: 96 },
  { week: "Week 5", attendance: 99 },
];

const marksData = [
  { subject: "Mathematics", marks: 85 },
  { subject: "Science", marks: 88 },
  { subject: "English", marks: 82 },
  { subject: "History", marks: 79 },
  { subject: "PE", marks: 90 },
];

const stats = [
  {
    label: "Current Attendance",
    value: "95.2%",
    change: "Good",
    icon: Calendar,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
  },
  {
    label: "Average Score",
    value: "84.8%",
    change: "Excellent",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-gradient-to-br from-orange-50 to-orange-100",
  },
  {
    label: "Classes",
    value: "5",
    change: "Active",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
  },
];

const recentUpdates = [
  { title: "Science Project Submitted", date: "Today", status: "completed" },
  { title: "Mathematics Test Results", date: "Yesterday", status: "completed" },
  { title: "Parent-Teacher Meeting", date: "Dec 30", status: "upcoming" },
  { title: "Sports Day Registration", date: "Jan 5", status: "upcoming" },
];

export function ParentDashboardContent({ username }: { username: string }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Welcome, {username}
        </h1>
        <p className="text-gray-600">Track your child's progress and school activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className={`text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-xs text-amber-600 mt-1 font-semibold">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <CardTitle className="text-amber-900">Weekly Attendance</CardTitle>
            <CardDescription className="text-amber-700">Attendance trend over weeks</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#d97706" strokeWidth={2} dot={{ fill: "#d97706" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
            <CardTitle className="text-orange-900">Subject-wise Scores</CardTitle>
            <CardDescription className="text-orange-700">Current academic performance</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="marks" fill="#d97706" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <CardTitle className="text-amber-900">Recent Updates</CardTitle>
          <CardDescription className="text-amber-700">Latest school activities and results</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="mt-1">
                  {update.status === "completed" ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{update.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{update.date}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  update.status === "completed" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {update.status === "completed" ? "Done" : "Upcoming"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

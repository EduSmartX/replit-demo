import { 
  GraduationCap, 
  Users, 
  CalendarCheck, 
  ClipboardList, 
  BookOpen, 
  Shield,
  BarChart3,
  Bell,
  Quote,
  Star
} from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { COMPANY_NAME } from "@/lib/constants/app-config";
import heroImage from "../assets/images/hero-illustration.png";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Efficiently manage student records, enrollment, and academic progress in one centralized system.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: GraduationCap,
      title: "Teacher Portal",
      description: "Empower teachers with tools for attendance tracking, grade management, and parent communication.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: CalendarCheck,
      title: "Attendance Tracking",
      description: "Real-time attendance monitoring with automated notifications for parents and administrators.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: ClipboardList,
      title: "Leave Management",
      description: "Streamlined leave request and approval system for both students and staff members.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BookOpen,
      title: "Class Scheduling",
      description: "Create and manage class schedules, subject allocations, and academic calendars effortlessly.",
      color: "from-blue-600 to-indigo-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive dashboards and reports for data-driven decision making.",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control and data encryption.",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated alerts and notifications keep everyone informed and connected.",
      color: "from-emerald-600 to-green-500"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Principal",
      school: "Springfield High School",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
      review: "EduCard has revolutionized how we manage our school. The attendance tracking and parent communication features have saved us countless hours. Highly recommended!"
    },
    {
      name: "Michael Chen",
      role: "IT Administrator",
      school: "Riverside Academy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      rating: 5,
      review: "The implementation was seamless, and the support team was exceptional. Our teachers adapted to the platform within days. The analytics dashboard is a game-changer."
    },
    {
      name: "Emily Rodriguez",
      role: "Vice Principal",
      school: "Oakwood Elementary",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      rating: 5,
      review: "We've seen a 40% reduction in administrative overhead since adopting EduCard. The leave management system alone has paid for itself multiple times over."
    },
    {
      name: "James Williams",
      role: "School Director",
      school: "Greenfield International",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      rating: 5,
      review: "Outstanding platform! The mobile app keeps parents engaged and informed. Student attendance has improved significantly since we started using EduCard."
    },
    {
      name: "Dr. Priya Patel",
      role: "Academic Coordinator",
      school: "Hillside Academy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      rating: 5,
      review: "EduCard's class scheduling feature has eliminated conflicts and confusion. Teachers love the intuitive interface, and parents appreciate the real-time updates."
    },
    {
      name: "Robert Anderson",
      role: "Superintendent",
      school: "Metro School District",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
      rating: 5,
      review: "We rolled out EduCard across 12 schools in our district. The centralized management and reporting capabilities have transformed our operations."
    }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <div className="relative flex min-h-[600px] w-full flex-col overflow-hidden lg:min-h-[600px] lg:flex-row lg:items-center">
        {/* Content */}
        <div className="relative flex w-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-6 lg:w-3/5 lg:py-12 lg:px-12 z-10">
          <div className="w-full max-w-3xl space-y-8">
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                Smarter Learning, Simplified
              </div>
              <h1 className="text-foreground font-serif text-3xl font-bold leading-[1.15] tracking-tight lg:text-4xl">
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">E</span>mpower Your{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">E</span>ducational Journey With{" "}
                <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {COMPANY_NAME}
                </span>
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                A unified platform connecting management system brings students, educators, and parents through intelligent tools for learning, communication and administration.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <Button 
                size="lg" 
                className="group text-base h-12 px-8 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setLocation("/auth")}
              >
                Launch Your Future
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base h-12 px-8 border-2 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50"
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <div className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent lg:text-4xl">
                  20K+
                </div>
                <div className="text-muted-foreground text-xs font-medium">Users</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent lg:text-4xl">
                  1K+
                </div>
                <div className="text-muted-foreground text-xs font-medium">Educators</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent lg:text-4xl">
                  100+
                </div>
                <div className="text-muted-foreground text-xs font-medium">Institutions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section - Using PNG Image */}
        <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-blue-50/30 via-slate-50/50 to-emerald-50/30 lg:flex lg:w-2/5 lg:items-center lg:justify-center">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Circles */}
            <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-blue-200/20 blur-2xl"></div>
            <div className="absolute bottom-20 left-10 h-32 w-32 rounded-full bg-emerald-200/20 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-teal-200/20 blur-2xl"></div>
            
            {/* Floating Shapes */}
            <div className="absolute top-20 right-1/4 h-3 w-3 rounded-full bg-blue-400/30 animate-float"></div>
            <div className="absolute bottom-32 right-16 h-2 w-2 rounded-full bg-emerald-400/30 animate-float animation-delay-200"></div>
            <div className="absolute top-1/3 right-12 h-4 w-4 rounded bg-teal-400/20 animate-float animation-delay-400"></div>
          </div>

          {/* Hero Image with Float Animation */}
          <div className="hero-image relative z-10 flex items-center justify-center p-8">
            <img 
              src={heroImage} 
              alt="EduSphere Platform Illustration" 
              className="w-full max-w-xl h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="w-full bg-muted/30 px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-3 font-serif text-3xl font-bold lg:text-4xl">
              Everything You Need to Manage Your School
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base lg:text-lg">
              Our comprehensive platform provides all the tools you need to streamline 
              operations and enhance the educational experience.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group border-2 transition-all hover:shadow-lg hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} shadow-lg transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full bg-background px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-3 font-serif text-3xl font-bold lg:text-4xl">
              Loved by Schools Worldwide
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base lg:text-lg">
              See what educators are saying about their experience with EduCard
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full border-2 transition-all hover:shadow-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                              <p className="text-[10px] text-primary font-medium">{testimonial.school}</p>
                            </div>
                          </div>
                          <Quote className="h-6 w-6 text-primary/20" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          &ldquo;{testimonial.review}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-primary px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-5 font-serif text-3xl font-bold text-white lg:text-4xl">
            Ready to Transform Your School?
          </h2>
          <p className="mb-6 text-base text-primary-foreground/90 lg:text-lg">
            Join hundreds of schools already using EduCard to improve their operations 
            and enhance the learning experience.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-base h-12 px-8"
              onClick={() => setLocation("/auth")}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base h-12 border-2 border-white bg-transparent px-8 text-white hover:bg-white hover:text-primary"
              onClick={() => setLocation("/auth")}
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background px-6 py-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">EduCard</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 EduCard. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button type="button" className="text-muted-foreground hover:text-foreground text-sm">
                Privacy Policy
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground text-sm">
                Terms of Service
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground text-sm">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClerkAuthContext } from "@/contexts/ClerkAuthContext";
import { Briefcase, CheckCircle, Clock, LineChart } from "lucide-react";

const SimpleDashboard = () => {
  const { user } = useClerkAuthContext();

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome {user?.firstName || 'User'}! Track your job search progress here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">+1 since last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers</CardTitle>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">New this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <LineChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Software Engineer application submitted</p>
                    <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </li>
                <li className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Interview scheduled</p>
                    <p className="text-sm text-muted-foreground">InnovateSoft Solutions</p>
                  </div>
                  <span className="text-sm text-muted-foreground">5 days ago</span>
                </li>
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Skills assessment completed</p>
                    <p className="text-sm text-muted-foreground">GlobalTech Industries</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 week ago</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SimpleDashboard; 
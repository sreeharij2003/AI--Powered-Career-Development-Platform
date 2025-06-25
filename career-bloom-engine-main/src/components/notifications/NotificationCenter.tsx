import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Bell,
    CircleCheck,
    Clock,
    Info,
    MoreVertical,
    Settings,
    X
} from "lucide-react";
import { useState } from "react";

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    title: "New job match",
    description: "A new Senior Frontend Developer position matches your profile",
    time: "5 minutes ago",
    read: false,
    type: "job",
  },
  {
    id: 2,
    title: "Application status update",
    description: "Your application for UX Designer at InnovateSoft has been viewed",
    time: "2 hours ago",
    read: false,
    type: "application",
  },
  {
    id: 3,
    title: "Interview reminder",
    description: "Your interview with InnovateSoft is scheduled for tomorrow at 10:00 AM",
    time: "1 day ago",
    read: true,
    type: "reminder",
  },
  {
    id: 4,
    title: "Skill assessment available",
    description: "New assessment available: React Advanced Concepts",
    time: "2 days ago",
    read: true,
    type: "assessment",
  },
];

interface NotificationItemProps {
  notification: {
    id: number;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: string;
  };
  onRead: (id: number) => void;
}

const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case "job":
        return <Bell className="h-5 w-5 text-primary" />;
      case "application":
        return <CircleCheck className="h-5 w-5 text-green-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "assessment":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div
      className={`p-4 flex gap-3 border-b ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="mt-1 shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
            {notification.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {notification.time}
            </span>
            {!notification.read && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onRead(notification.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Mark as read</span>
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {notification.description}
        </p>
      </div>
    </div>
  );
};

export const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="font-medium">Email Notifications</div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">Job Matches</span>
              <span className="text-xs text-muted-foreground">
                Receive emails for new job matches
              </span>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">Application Updates</span>
              <span className="text-xs text-muted-foreground">
                Get notified when your application status changes
              </span>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">Interview Reminders</span>
              <span className="text-xs text-muted-foreground">
                Receive email reminders before scheduled interviews
              </span>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">New Messages</span>
              <span className="text-xs text-muted-foreground">
                Get notified when you receive new messages
              </span>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">Weekly Digest</span>
              <span className="text-xs text-muted-foreground">
                Receive a weekly summary of your job search activity
              </span>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="font-medium">Push Notifications</div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm">Enable Push Notifications</span>
              <span className="text-xs text-muted-foreground">
                Allow browser notifications for important updates
              </span>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full"
          >
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0 gap-0">
          <DialogHeader className="px-4 pt-5 pb-0">
            <div className="flex items-center justify-between mb-2">
              <DialogTitle>Notifications</DialogTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-8"
                  >
                    Mark all as read
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={() => setIsDialogOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Notification Settings</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>
          <ScrollArea className="h-[350px]">
            <TabsContent value="all" className="m-0">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="jobs" className="m-0">
              {notifications.filter((n) => n.type === "job").length > 0 ? (
                notifications
                  .filter((n) => n.type === "job")
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                    />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No job notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you when new job matches become available
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="applications" className="m-0">
              {notifications.filter((n) => n.type === "application").length >
              0 ? (
                notifications
                  .filter((n) => n.type === "application")
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                    />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <CircleCheck className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No application updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for updates on your applications
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="reminders" className="m-0">
              {notifications.filter((n) => n.type === "reminder").length > 0 ? (
                notifications
                  .filter((n) => n.type === "reminder")
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                    />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    You have no upcoming reminders at the moment
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
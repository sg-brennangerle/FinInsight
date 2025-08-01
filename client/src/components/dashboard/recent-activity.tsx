import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, BarChart, Download } from "lucide-react";

export default function RecentActivity() {
  const { data: files } = useQuery<any[]>({
    queryKey: ['/api/files'],
  });

  const { data: reports } = useQuery<any[]>({
    queryKey: ['/api/reports'],
  });

  // Create activity timeline from files and reports
  const activities: any[] = [];
  
  if (files) {
    files.forEach((file: any) => {
      activities.push({
        id: `file-${file.id}`,
        type: 'upload',
        title: `${file.originalName} uploaded`,
        time: new Date(file.uploadedAt),
        icon: Upload,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      });
    });
  }

  if (reports) {
    reports.forEach((report: any) => {
      activities.push({
        id: `report-${report.id}`,
        type: 'report',
        title: `${report.title} generated`,
        time: new Date(report.generatedAt),
        icon: FileText,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      });
    });
  }

  // Sort by time (most recent first) and take top 4
  const recentActivities = activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 4);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No recent activity</p>
              <p className="text-sm text-slate-400 mt-1">Upload a file to get started</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium">{activity.title}</p>
                  <p className="text-xs text-slate-500">{formatTimeAgo(activity.time)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {recentActivities.length > 0 && (
          <Button variant="ghost" className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800">
            View all activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

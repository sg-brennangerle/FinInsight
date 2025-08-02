import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Share, FileText, BarChart, TrendingUp, Clock, CheckCircle } from "lucide-react";
import PresentationReportModal from "@/components/modals/presentation-report-modal";



export default function ReportsTable() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ['/api/reports'],
  });

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'executive_summary':
        return FileText;
      case 'kpi_analysis':
        return BarChart;
      case 'trend_analysis':
        return TrendingUp;
      default:
        return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return (
          <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
          <Button variant="ghost" className="text-sm text-blue-600 hover:text-blue-800">
            View all reports
          </Button>
        </CardHeader>
        <CardContent>
          {!reports || reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No reports generated yet</p>
              <p className="text-sm text-slate-400 mt-1">Upload a P&L file to generate your first report</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider rounded-tl-lg">
                      Report Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reports.map((report: any) => {
                    const ReportIcon = getReportIcon(report.type);
                    const isReady = report.status === 'ready';
                    
                    return (
                      <tr key={report.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <ReportIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{report.title}</div>
                              <div className="text-sm text-slate-500">
                                {report.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                          {report.period}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatTimeAgo(report.generatedAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={isReady ? "text-blue-600 hover:text-blue-900" : "text-slate-300 cursor-not-allowed"}
                              disabled={!isReady}
                              onClick={() => isReady && setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={isReady ? "text-slate-400 hover:text-slate-600" : "text-slate-300 cursor-not-allowed"}
                              disabled={!isReady}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={isReady ? "text-slate-400 hover:text-slate-600" : "text-slate-300 cursor-not-allowed"}
                              disabled={!isReady}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReport && (
        <PresentationReportModal 
          reportId={selectedReport.id}
          isOpen={true}
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </>
  );
}



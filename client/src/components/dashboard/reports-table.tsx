import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Share, FileText, BarChart, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface ReportModalProps {
  report: any;
  onClose: () => void;
}

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
        <ReportModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </>
  );
}

function ReportModal({ report, onClose }: ReportModalProps) {
  const formatKPI = (value: any, type: string) => {
    if (typeof value === 'number') {
      if (type.includes('margin') || type.includes('growth')) {
        return `${value.toFixed(1)}%`;
      }
      if (type.includes('revenue') || type.includes('profit') || type.includes('income')) {
        return `$${(value / 1000000).toFixed(1)}M`;
      }
      return value.toLocaleString();
    }
    return value?.toString() || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Close</span>
            ×
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="prose max-w-none">
            <h4 className="text-xl font-semibold text-slate-900 mb-4">Executive Summary</h4>
            <p className="text-slate-700 mb-6">{report.narrative}</p>
            
            {report.kpis && (
              <>
                <h5 className="text-lg font-semibold text-slate-900 mb-3">Key Performance Indicators</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(report.kpis).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-500 font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {formatKPI(value, key)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {report.keyInsights && report.keyInsights.length > 0 && (
              <>
                <h5 className="text-lg font-semibold text-slate-900 mb-3">Key Insights</h5>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                  {report.keyInsights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </>
            )}

            {report.recommendations && report.recommendations.length > 0 && (
              <>
                <h5 className="text-lg font-semibold text-slate-900 mb-3">Recommendations</h5>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {report.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, PieChart, DollarSign, Calendar } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/reports'],
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['/api/files'],
  });

  if (statsLoading || reportsLoading || filesLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title="Analytics"
            subtitle="Comprehensive insights from your financial data"
          />
          <div className="flex-1 overflow-auto p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white h-32 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const processedFiles = (files as any[])?.filter((f: any) => f.status === 'processed') || [];
  const totalRevenue = (reports as any[])?.reduce((sum: number, report: any) => {
    const revenue = report.kpis?.totalRevenue || 0;
    return sum + (typeof revenue === 'string' ? parseFloat(revenue.replace(/[^0-9.-]/g, '')) : revenue);
  }, 0) || 0;

  const avgGrossMargin = (reports as any[])?.length > 0 
    ? (reports as any[]).reduce((sum: number, report: any) => {
        const margin = report.kpis?.grossMargin || 0;
        return sum + (typeof margin === 'string' ? parseFloat(margin.replace('%', '')) : margin);
      }, 0) / (reports as any[]).length 
    : 0;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Analytics"
          subtitle="Comprehensive insights from your financial data"
        />
        <div className="flex-1 overflow-auto p-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {(reports as any[])?.length || 0} reports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Gross Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgGrossMargin.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Financial health indicator
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedFiles.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats as any)?.timeSaved || 0}h
              </div>
              <p className="text-xs text-muted-foreground">
                In manual analysis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Report Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports && (reports as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(reports as any[]).slice(0, 5).map((report: any, index: number) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        <p className="text-xs text-slate-600">{report.period}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {report.kpis?.grossMargin || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-600">Gross Margin</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No reports available yet</p>
                  <p className="text-sm">Upload your first P&L file to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Key Insights Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports && (reports as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(reports as any[]).slice(0, 3).map((report: any) => (
                    <div key={report.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-sm mb-2">{report.title}</h4>
                      <div className="space-y-1">
                        {report.keyInsights?.slice(0, 2).map((insight: string, idx: number) => (
                          <p key={idx} className="text-xs text-slate-600">• {insight}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No insights available yet</p>
                  <p className="text-sm">Process financial data to generate insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Processing Status */}
        <Card>
          <CardHeader>
            <CardTitle>File Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            {files && (files as any[]).length > 0 ? (
              <div className="space-y-3">
                {(files as any[]).map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        file.status === 'processed' ? 'bg-green-500' :
                        file.status === 'processing' ? 'bg-yellow-500' :
                        file.status === 'error' ? 'bg-red-500' : 'bg-slate-300'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{file.originalName}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{file.status}</div>
                      <div className="text-xs text-slate-600">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No files uploaded yet</p>
                <p className="text-sm">Start by uploading your first P&L file</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
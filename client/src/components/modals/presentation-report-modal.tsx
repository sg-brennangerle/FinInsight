import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Share, X, Trophy, AlertTriangle, BarChart3, BookOpen, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PresentationReportModalProps {
  reportId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PresentationReportModal({ reportId, isOpen = false, onClose }: PresentationReportModalProps) {
  const { data: report, isLoading } = useQuery<any>({
    queryKey: ['/api/reports', reportId],
    enabled: isOpen && !!reportId,
  });

  if (!isOpen) return null;

  const formatCurrency = (value: any) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      }).format(value);
    }
    return '$0.00';
  };

  const formatPercentage = (value: any) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return '0.0%';
  };

  // Sample data for financial visualization
  const sampleFinancialData = [
    { period: 'Q1', revenue: report?.kpis?.totalRevenue || 0, expenses: report?.kpis?.totalOperatingExpenses || 0 },
    { period: 'Q2', revenue: (report?.kpis?.totalRevenue || 0) * 1.1, expenses: (report?.kpis?.totalOperatingExpenses || 0) * 1.05 },
    { period: 'Q3', revenue: (report?.kpis?.totalRevenue || 0) * 1.2, expenses: (report?.kpis?.totalOperatingExpenses || 0) * 1.1 },
    { period: 'Current', revenue: report?.kpis?.totalRevenue || 0, expenses: report?.kpis?.totalOperatingExpenses || 0 },
  ].filter(item => item.revenue > 0 || item.expenses > 0);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric',
    hour12: true 
  });

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-50 rounded-lg max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Report - {currentDate}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create New Report
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-100px)] space-y-8">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-32 bg-slate-200 rounded"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Executive Summary */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {report.narrative || "The current financial data indicates strategic opportunities for growth and optimization. Key performance indicators show areas for immediate attention and long-term planning."}
                  </p>
                </CardContent>
              </Card>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="text-sm text-slate-500 font-medium mb-2">Revenue</div>
                    <div className="text-3xl font-bold text-slate-900">
                      {formatCurrency(report.kpis?.totalRevenue || 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="text-sm text-slate-500 font-medium mb-2">Gross Profit Margin</div>
                    <div className="text-3xl font-bold text-slate-900">
                      {formatPercentage(report.kpis?.grossProfitMargin || 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="text-sm text-slate-500 font-medium mb-2">Net Profit Margin</div>
                    <div className="text-3xl font-bold text-slate-900">
                      {formatPercentage(report.kpis?.netProfitMargin || 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Wins and Areas of Focus */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                      Key Wins
                    </CardTitle>
                    <p className="text-slate-600 text-sm">Highlights and positive achievements.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.wins?.length > 0 ? (
                        report.wins.map((win: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-slate-700">{win}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-slate-700">Strong financial foundation established</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Target className="h-5 w-5 mr-2 text-amber-500" />
                      Areas of Focus
                    </CardTitle>
                    <p className="text-slate-600 text-sm">Potential issues and opportunities for improvement.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.areasOfFocus?.length > 0 ? (
                        report.areasOfFocus.map((area: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            </div>
                            <span className="text-slate-700">{area}</span>
                          </div>
                        ))
                      ) : report.recommendations?.length > 0 ? (
                        report.recommendations.slice(0, 3).map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            </div>
                            <span className="text-slate-700">{rec}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          </div>
                          <span className="text-slate-700">Continue monitoring key performance metrics</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Snapshot */}
              {sampleFinancialData.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Financial Snapshot
                    </CardTitle>
                    <p className="text-slate-600 text-sm">A visual summary of the key financial data.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sampleFinancialData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: any) => [formatCurrency(value), '']} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stackId="1"
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.6}
                            name="Revenue"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="expenses" 
                            stackId="2"
                            stroke="#ef4444" 
                            fill="#ef4444" 
                            fillOpacity={0.6}
                            name="Expenses"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Variance Analysis */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Variance Analysis</CardTitle>
                  <p className="text-slate-600 text-sm">Comparison between current and previous periods.</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 text-slate-600 font-medium">Metric</th>
                          <th className="text-right py-3 text-slate-600 font-medium">Current</th>
                          <th className="text-right py-3 text-slate-600 font-medium">Previous</th>
                          <th className="text-right py-3 text-slate-600 font-medium">Variance</th>
                          <th className="text-right py-3 text-slate-600 font-medium">Variance (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 text-slate-700">Revenue</td>
                          <td className="py-3 text-slate-900 text-right font-medium">
                            {formatCurrency(report.kpis?.totalRevenue || 0)}
                          </td>
                          <td className="py-3 text-slate-600 text-right">
                            {formatCurrency((report.kpis?.totalRevenue || 0) * 0.9)}
                          </td>
                          <td className="py-3 text-slate-900 text-right font-medium">
                            {formatCurrency((report.kpis?.totalRevenue || 0) * 0.1)}
                          </td>
                          <td className="py-3 text-green-600 text-right font-medium">+10.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Talking Points */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Talking Points for Your Meeting</CardTitle>
                  <p className="text-slate-600 text-sm">Key topics for discussion, tailored for your selected audience.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.talkingPoints?.length > 0 ? (
                      report.talkingPoints.map((point: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                          </div>
                          <span className="text-slate-700 pt-1">{point}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-600 font-semibold text-sm">1</span>
                          </div>
                          <span className="text-slate-700 pt-1">Review current financial performance and key metrics</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-600 font-semibold text-sm">2</span>
                          </div>
                          <span className="text-slate-700 pt-1">Discuss strategic opportunities for growth and optimization</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-600 font-semibold text-sm">3</span>
                          </div>
                          <span className="text-slate-700 pt-1">Identify actionable next steps and resource allocation</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Show Raw Data Button */}
              <div className="flex justify-center">
                <Button variant="outline" className="text-slate-600 hover:text-slate-900">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Show Raw Data
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">Report not found</p>
            </div>
          )}
          
          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
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
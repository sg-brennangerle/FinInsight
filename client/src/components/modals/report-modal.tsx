import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, Share, X } from "lucide-react";

interface ReportModalProps {
  reportId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ReportModal({ reportId, isOpen = false, onClose }: ReportModalProps) {
  const { data: report, isLoading } = useQuery<any>({
    queryKey: ['/api/reports', reportId],
    enabled: isOpen && !!reportId,
  });

  if (!isOpen) return null;

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
          <h3 className="text-lg font-semibold text-slate-900">
            {report?.title || 'Loading...'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ) : report ? (
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
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Report not found</p>
            </div>
          )}
          
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

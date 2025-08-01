import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen?: boolean;
}

export default function LoadingModal({ isOpen = false }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Processing Your Data</h3>
          <p className="text-slate-500 mb-6">We're analyzing your P&L data and generating insights...</p>
          <Progress value={65} className="w-full mb-2" />
          <p className="text-sm text-slate-500">Estimated time remaining: 30 seconds</p>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Bell, Plus, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [, setLocation] = useLocation();

  // Check for processing files
  const { data: files } = useQuery({
    queryKey: ['/api/files'],
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const hasProcessingFiles = (files as any[])?.some((file: any) => file.status === 'processing') || false;

  const handleUploadClick = () => {
    setLocation('/upload');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {hasProcessingFiles && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Button onClick={handleUploadClick} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Upload New Data
          </Button>
        </div>
      </div>
    </header>
  );
}

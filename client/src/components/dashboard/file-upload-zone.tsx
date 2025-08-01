import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, Link, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function FileUploadZone() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await apiRequest('POST', '/api/upload', formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return await response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: "Your P&L data is being processed. You'll receive a notification when the analysis is complete.",
      });
      setValidationError(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      
      // Start polling for processing status
      pollProcessingStatus(data.fileId);
    },
    onError: (error: any) => {
      setValidationError(error.message || "File upload failed");
      toast({
        title: "Upload failed",
        description: error.message || "Please try again with a valid P&L file.",
        variant: "destructive",
      });
    },
  });

  const pollProcessingStatus = async (fileId: string) => {
    const checkStatus = async () => {
      try {
        const response = await apiRequest('GET', `/api/file/${fileId}/status`);
        const data = await response.json();
        
        if (data.status === 'processed') {
          toast({
            title: "Analysis complete",
            description: "Your financial report is ready to view.",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
          setUploadProgress(0);
        } else if (data.status === 'error') {
          toast({
            title: "Processing failed",
            description: "There was an error processing your file.",
            variant: "destructive",
          });
          setUploadProgress(0);
        } else {
          // Still processing, check again
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
        setUploadProgress(0);
      }
    };
    
    setTimeout(checkStatus, 1000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setValidationError(null);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Quick Upload</CardTitle>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? "border-blue-400 bg-blue-50" 
              : "border-slate-300 hover:border-blue-400"
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-slate-400" />
          </div>
          
          <h4 className="text-lg font-medium text-slate-900 mb-2">Upload P&L Data</h4>
          <p className="text-slate-500 mb-4">
            {isDragActive 
              ? "Drop your file here..." 
              : "Drag and drop your CSV or Excel files here, or click to browse"
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              type="button" 
              disabled={uploadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button variant="outline" disabled>
              <Link className="h-4 w-4 mr-2" />
              Connect QuickBooks
            </Button>
          </div>
          
          <p className="text-xs text-slate-400 mt-4">
            Supports CSV, XLS, XLSX • Max file size: 10MB
          </p>
        </div>

        {uploadMutation.isPending && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Processing your data...</span>
              <span className="text-sm text-slate-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {validationError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>File validation failed:</strong> {validationError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

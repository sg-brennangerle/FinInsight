import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FileUploadZone from "@/components/dashboard/file-upload-zone";

export default function Upload() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Upload Data"
          subtitle="Upload your P&L files to generate financial narratives"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <FileUploadZone />
          </div>
        </div>
      </main>
    </div>
  );
}

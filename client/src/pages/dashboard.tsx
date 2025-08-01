import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import FileUploadZone from "@/components/dashboard/file-upload-zone";
import RecentActivity from "@/components/dashboard/recent-activity";
import ReportsTable from "@/components/dashboard/reports-table";
import LoadingModal from "@/components/modals/loading-modal";
import ReportModal from "@/components/modals/report-modal";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard"
          subtitle="Transform your financial data into compelling narratives"
        />
        <div className="flex-1 overflow-auto p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <FileUploadZone />
            </div>
            <RecentActivity />
          </div>

          <div className="mt-8">
            <ReportsTable />
          </div>
        </div>
      </main>
      
      <LoadingModal />
      <ReportModal />
    </div>
  );
}

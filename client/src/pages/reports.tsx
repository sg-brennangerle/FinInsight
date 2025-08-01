import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ReportsTable from "@/components/dashboard/reports-table";
import ReportModal from "@/components/modals/report-modal";

export default function Reports() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Reports"
          subtitle="View and manage your generated financial reports"
        />
        <div className="flex-1 overflow-auto p-6">
          <ReportsTable />
        </div>
      </main>
      
      <ReportModal />
    </div>
  );
}

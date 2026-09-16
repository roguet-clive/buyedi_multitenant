import { Head, usePage } from "@inertiajs/react";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";
import { useEffect } from "react";

function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="h-1 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-blue-500"></div>
      <div className="px-4 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Buyedi. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default function DashboardLayout({ children, title }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.message) toast(flash.message);
  }, [flash]);

  return (
    <>
      <Toaster 
        position="top-right" 
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            padding: '16px 20px',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: '#0B1A2D',
              color: '#FFFFFF',
              border: '1px solid #1E293B',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            style: {
              background: '#FFF1F2',
              color: '#9F1239',
              border: '1px solid #FECDD3',
            },
          },
        }}
      />
      <Head title={title} />
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-300 print:bg-white print:min-h-0">
        {/* Sidebar sticky */}
        <div className="print:hidden">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-slate-50 dark:bg-[#060b13] print:bg-white print:min-h-0 print:overflow-visible">
          <div className="print:hidden">
            <Header />
          </div>
          <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-auto print:p-0 print:space-y-0 print:overflow-visible">{children}</main>
          <div className="print:hidden">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

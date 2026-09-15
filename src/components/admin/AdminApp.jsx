"use client";

import dynamic from "next/dynamic";

// The dashboard reads its draft from localStorage, so it only renders in the browser.
const AdminDashboard = dynamic(() => import("./AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-screen flex-1 place-items-center bg-[#f3f0e9] text-sm text-[#77766f]">
      Admin panel yüklənir…
    </div>
  ),
});

export default function AdminApp({ initialData }) {
  return <AdminDashboard initialData={initialData} />;
}

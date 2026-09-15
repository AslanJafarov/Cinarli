import AdminApp from "@/components/admin/AdminApp";
import * as mockData from "@/data/mock";

export const metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

const page = () => {
  // Every export in src/data/mock.js becomes an editable section.
  const initialData = { ...mockData };

  return <AdminApp initialData={initialData} />;
};

export default page;

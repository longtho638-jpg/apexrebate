import { Suspense } from 'react';

// Define a specific and correct type for this page's props.
// This avoids using a potentially incorrect global PageProps.
// `params` is a synchronous object, not a Promise.
type AdminPageProps = {
  params: {
    locale: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

async function AdminDashboard() {
  // In a real component, you would fetch admin-specific data here.
  return <div>Admin Dashboard Content</div>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel (Locale: {params.locale})</h1>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
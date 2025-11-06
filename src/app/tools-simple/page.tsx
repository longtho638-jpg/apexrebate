'use client';

export default function ToolsSimple() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-4">Chợ Công Cụ (Simple Test)</h1>
      <p>Nếu bạn thấy trang này, nghĩa là Next.js rendering OK.</p>
      <p>Lỗi 500 ở /tools có thể do:</p>
      <ul className="list-disc ml-6 mt-4">
        <li>next-intl useTranslations() hook</li>
        <li>next-auth useSession() hook</li>
        <li>Hoặc một component khác trong page</li>
      </ul>
    </div>
  );
}

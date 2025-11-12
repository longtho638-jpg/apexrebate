export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to {{PROJECT_NAME}}</h1>
        <p className="text-lg text-gray-600">
          Built with Next.js + Agentic K2 Relay Factory
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Edit <code className="bg-gray-100 px-2 py-1">src/app/page.tsx</code> and save to see changes.
        </p>
      </div>
    </main>
  );
}

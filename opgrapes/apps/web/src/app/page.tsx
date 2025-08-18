export const dynamic = 'force-dynamic';

import { ProjectTracker } from '../components/ProjectTracker';

async function getHealth(): Promise<"ok" | "down"> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    return res.ok && (json as { ok?: boolean })?.ok ? "ok" : "down";
  } catch {
    return "down";
  }
}

export default async function Home() {
  const status = await getHealth();
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🍇 OPGrapes Project Tracker</h1>
        <p className="text-lg text-gray-600">
          Modern monorepo with Next.js, Express API, and shared UI components
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-gray-500">API Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {status === "ok" ? "🟢 Healthy" : "🔴 Down"}
          </span>
        </div>
      </div>
      
      <ProjectTracker />
    </main>
  );
}

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Bank Pledge' };
export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Bank Pledge</h1>
        <p className="text-sm text-zinc-500 mt-1">Phase 2+ — Coming soon</p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-12 flex flex-col items-center justify-center text-center gap-3">
        <div className="text-4xl">🚧</div>
        <p className="text-zinc-400 font-medium">Bank Pledge module</p>
        <p className="text-sm text-zinc-600">This section will be implemented in Phase 2+</p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export function TestSupabaseButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/test-brief", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-4 mt-4 w-full">
      <h3 className="text-lg font-semibold text-on-surface mb-2">Test Supabase Connection</h3>
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-secondary text-on-secondary px-4 py-2 rounded-md hover:bg-secondary-fixed transition-colors disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Create Brief"}
      </button>
      {result && (
        <pre className="mt-4 p-2 bg-surface-container-highest rounded text-xs text-on-surface-variant overflow-auto max-h-40">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

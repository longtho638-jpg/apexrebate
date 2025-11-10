"use client";

import { useEffect, useState } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";

interface DLQItem {
  id: string;
  kind: string;
  source: string;
  payload: unknown;
  attempts: number;
  createdAt: string;
}

export default function DLQPage() {
  const [items, setItems] = useState<DLQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/dlq/list");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching DLQ items:", error);
    } finally {
      setLoading(false);
    }
  }

  async function replayItem(id: string) {
    const token = prompt("Enter 2-eyes token:");
    if (!token) return;

    try {
      const res = await fetch("/api/admin/dlq/replay", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-two-eyes": token,
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Replay failed");
      await fetchItems();
    } catch (error) {
      console.error("Replay error:", error);
    }
  }

  async function deleteItem(id: string) {
    const token = prompt("Enter 2-eyes token:");
    if (!token) return;

    try {
      const res = await fetch("/api/admin/dlq/delete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-two-eyes": token,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">DLQ Replay Center</h1>

      {items.length === 0 ? (
        <p>No items in DLQ</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Kind</th>
              <th className="border p-2 text-left">Source</th>
              <th className="border p-2 text-left">Attempts</th>
              <th className="border p-2 text-left">Created</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border p-2 font-mono text-sm">{item.id}</td>
                <td className="border p-2">{item.kind}</td>
                <td className="border p-2">{item.source}</td>
                <td className="border p-2 text-center">{item.attempts}</td>
                <td className="border p-2 text-sm">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => replayItem(item.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Replay
                  </button>
                  <ConfirmButton
                    onConfirm={() => deleteItem(item.id)}
                    variant="destructive"
                  >
                    Delete
                  </ConfirmButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

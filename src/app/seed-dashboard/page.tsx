import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seed Dashboard UI v1.0",
  description:
    "A minimal ApexRebate Seed Dashboard UI (static) for quick layout iteration.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            ApexRebate · Seed Dashboard
          </h1>
          <nav className="flex space-x-4">
            <button className="text-sm font-medium hover:text-indigo-600 transition">
              Overview
            </button>
            <button className="text-sm font-medium hover:text-indigo-600 transition">
              Metrics
            </button>
            <button className="text-sm font-medium hover:text-indigo-600 transition">
              Logs
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Overview Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-2xl p-5 border border-gray-100">
            <h2 className="text-sm text-gray-500 mb-1">Total Rebates</h2>
            <p className="text-2xl font-semibold text-gray-900">$12,430</p>
            <p className="text-xs text-green-600 mt-1">+12% from last week</p>
          </div>
          <div className="bg-white shadow rounded-2xl p-5 border border-gray-100">
            <h2 className="text-sm text-gray-500 mb-1">Pending Claims</h2>
            <p className="text-2xl font-semibold text-gray-900">23</p>
            <p className="text-xs text-yellow-600 mt-1">2 awaiting approval</p>
          </div>
          <div className="bg-white shadow rounded-2xl p-5 border border-gray-100">
            <h2 className="text-sm text-gray-500 mb-1">Active Partners</h2>
            <p className="text-2xl font-semibold text-gray-900">54</p>
            <p className="text-xs text-green-600 mt-1">+3 new this month</p>
          </div>
          <div className="bg-white shadow rounded-2xl p-5 border border-gray-100">
            <h2 className="text-sm text-gray-500 mb-1">Avg. Payout Time</h2>
            <p className="text-2xl font-semibold text-gray-900">1.8d</p>
            <p className="text-xs text-blue-600 mt-1">Target ≤ 2.0d</p>
          </div>
        </section>

        {/* Charts Placeholder */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Weekly Rebates Trend
            </h3>
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">
              (Chart placeholder)
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Partner Performance
            </h3>
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">
              (Chart placeholder)
            </div>
          </div>
        </section>

        {/* Logs */}
        <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activities
          </h3>
          <ul className="divide-y divide-gray-100 text-sm">
            <li className="py-3 flex justify-between">
              <span className="text-gray-600">Partner #23 submitted claim #A102</span>
              <span className="text-gray-400">2h ago</span>
            </li>
            <li className="py-3 flex justify-between">
              <span className="text-gray-600">Claim #A099 approved</span>
              <span className="text-gray-400">5h ago</span>
            </li>
            <li className="py-3 flex justify-between">
              <span className="text-gray-600">New partner onboarded (#55)</span>
              <span className="text-gray-400">1d ago</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

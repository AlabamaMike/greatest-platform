import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { BarChart3, TrendingUp, TrendingDown, Globe, AlertCircle } from 'lucide-react';
import { dataAPI } from '@/lib/api';

export default function DataAnalytics() {
  const [indicators, setIndicators] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI.getAllIndicators()
      .then(res => {
        setIndicators(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const sdgs = [
    { id: 1, name: 'No Poverty', color: 'bg-red-500', progress: 38 },
    { id: 2, name: 'Zero Hunger', color: 'bg-yellow-500', progress: 22 },
    { id: 3, name: 'Good Health', color: 'bg-green-500', progress: 52 },
    { id: 4, name: 'Quality Education', color: 'bg-blue-500', progress: 48 },
    { id: 5, name: 'Gender Equality', color: 'bg-orange-500', progress: 41 },
    { id: 8, name: 'Decent Work', color: 'bg-purple-500', progress: 55 },
  ];

  return (
    <>
      <Head>
        <title>Data & Analytics - Nexus Platform</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Data & SDG Tracking</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of all 17 UN SDGs with evidence-based analytics.
          </p>
        </div>

        {/* Global Stats */}
        {indicators && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600">{indicators.total_indicators}</div>
              <div className="text-sm text-gray-600">Total Indicators</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600">{indicators.with_data}</div>
              <div className="text-sm text-gray-600">With Data</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600">{indicators.data_coverage}%</div>
              <div className="text-sm text-gray-600">Data Coverage</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600">0/17</div>
              <div className="text-sm text-gray-600">Goals On Track</div>
            </div>
          </div>
        )}

        {/* Alert Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">None of the 17 UN SDGs are on track for 2030</h3>
            <p className="text-sm text-red-700 mt-1">
              Technology and data-driven decisions are critical to accelerating progress. Nexus provides real-time tracking and evidence-based recommendations.
            </p>
          </div>
        </div>

        {/* SDG Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sustainable Development Goals Progress</h2>
          <div className="space-y-4">
            {sdgs.map((sdg) => (
              <div key={sdg.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${sdg.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {sdg.id}
                    </div>
                    <span className="font-medium text-gray-900">{sdg.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{sdg.progress}%</span>
                    {sdg.progress < 50 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${sdg.color} h-2 rounded-full transition-all`}
                    style={{ width: `${sdg.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 text-purple-600 font-medium hover:text-purple-700">
            View All 17 Goals →
          </button>
        </div>

        {/* Platform Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-1">SDG 3: Health</div>
            <div className="text-3xl font-bold mb-2">450K</div>
            <div className="text-sm opacity-90">People with healthcare access</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-1">SDG 4: Education</div>
            <div className="text-3xl font-bold mb-2">125K</div>
            <div className="text-sm opacity-90">Learners trained</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-1">SDG 8: Jobs</div>
            <div className="text-3xl font-bold mb-2">12.8K</div>
            <div className="text-sm opacity-90">Employment opportunities</div>
          </div>
        </div>

        {/* Open Data */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            Open Data Platform
          </h2>
          <p className="text-gray-600 mb-4">
            Access anonymized, aggregated data for research and policy-making. All data follows GDPR and privacy best practices.
          </p>
          <div className="flex gap-3">
            <button className="bg-purple-600 text-white px-6 py-2 rounded-md font-medium hover:bg-purple-700">
              Browse Datasets
            </button>
            <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-md font-medium hover:bg-purple-50">
              API Documentation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

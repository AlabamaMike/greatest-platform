import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AlertTriangle, MapPin, Users, Radio, Shield, Bell } from 'lucide-react';
import { crisisAPI } from '@/lib/api';

export default function Crisis() {
  const [alerts, setAlerts] = useState([]);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      crisisAPI.getAlerts(),
      crisisAPI.getCrisisMap(),
    ])
      .then(([alertsRes, mapRes]) => {
        setAlerts(alertsRes.data.data || []);
        setMapData(mapRes.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const features = [
    { icon: MapPin, title: 'Crisis Mapping', description: 'Real-time crowdsourced incident reporting' },
    { icon: Users, title: 'Volunteer Coordination', description: 'Mobilize and deploy volunteers' },
    { icon: Radio, title: 'Alert System', description: 'Multi-channel emergency alerts' },
    { icon: Shield, title: 'Early Warning', description: 'AI-powered predictive analytics' },
  ];

  return (
    <>
      <Head>
        <title>Crisis Response - Nexus Platform</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🆘 Crisis Response</h1>
          <p className="text-gray-600 mt-2">
            Real-time crisis mapping, resource coordination, and early warning systems.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">145</div>
            <div className="text-sm text-gray-600">Coverage Areas</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">{mapData?.total || 0}</div>
            <div className="text-sm text-gray-600">Active Incidents</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">12K+</div>
            <div className="text-sm text-gray-600">Volunteers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <div className="text-sm text-gray-600">Monitoring</div>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-600" />
              Active Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="bg-white p-4 rounded-lg border border-orange-300">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
                      <span className="font-semibold text-gray-900">{alert.message}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Areas: {alert.affected_areas?.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Issued: {new Date(alert.issued_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crisis Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crisis Map</h2>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Interactive map would be displayed here</p>
              <p className="text-sm mt-1">Using Leaflet/OpenStreetMap for crisis visualization</p>
              {mapData && (
                <div className="mt-4">
                  <p className="font-medium">{mapData.total} incidents</p>
                  <p className="text-sm">{mapData.coverage_areas} coverage areas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <Icon className="w-10 h-10 text-orange-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Report Incident */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Report an Incident</h2>
          <p className="mb-4 opacity-90">
            Help save lives by reporting incidents in real-time. Your report will be verified and shared with response teams.
          </p>
          <button className="bg-white text-orange-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100">
            Report Incident
          </button>
        </div>

        {/* Volunteer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Opportunities</h2>
          <p className="text-gray-600 mb-4">
            Join our network of 12,000+ volunteers responding to crises worldwide. Training provided.
          </p>
          <button className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700">
            Become a Volunteer
          </button>
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import {
  Activity, BookOpen, Briefcase, BarChart3, AlertTriangle,
  Calendar, Award, DollarSign, TrendingUp
} from 'lucide-react';
import { dataAPI } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch platform impact data
    dataAPI.getImpact()
      .then(res => {
        setImpactData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch impact data:', err);
        setLoading(false);
      });
  }, [isAuthenticated, router]);

  const modules = [
    {
      icon: Activity,
      title: 'Healthcare',
      description: 'Book appointments, access telemedicine',
      link: '/healthcare',
      color: 'bg-red-50 text-red-600 border-red-200',
      stat: impactData?.healthcare_consultations?.toLocaleString() || '0',
      statLabel: 'Consultations',
    },
    {
      icon: BookOpen,
      title: 'Education',
      description: 'Browse courses, track progress',
      link: '/education',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      stat: impactData?.courses_completed?.toLocaleString() || '0',
      statLabel: 'Courses Completed',
    },
    {
      icon: Briefcase,
      title: 'Economic',
      description: 'Find jobs, access microloans',
      link: '/economic',
      color: 'bg-green-50 text-green-600 border-green-200',
      stat: impactData?.jobs_created?.toLocaleString() || '0',
      statLabel: 'Jobs Created',
    },
    {
      icon: BarChart3,
      title: 'Data & SDGs',
      description: 'Track SDG progress, view analytics',
      link: '/data',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      stat: '231',
      statLabel: 'SDG Indicators',
    },
    {
      icon: AlertTriangle,
      title: 'Crisis Response',
      description: 'View crisis map, get alerts',
      link: '/crisis',
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      stat: '145',
      statLabel: 'Coverage Areas',
    },
  ];

  const quickActions = [
    { icon: Calendar, label: 'Book Appointment', link: '/healthcare#appointments' },
    { icon: BookOpen, label: 'Browse Courses', link: '/education#courses' },
    { icon: Briefcase, label: 'Find Jobs', link: '/economic#jobs' },
    { icon: Award, label: 'My Certificates', link: '/education#certificates' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Nexus Platform</title>
      </Head>

      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your impact dashboard. Together we're changing the world.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.link}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <Icon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 text-center">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Global Impact Stats */}
        {impactData && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Platform Impact (Real-Time)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-3xl font-bold">{impactData.users_served?.toLocaleString()}</div>
                <div className="text-sm opacity-90">Users Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{impactData.healthcare_consultations?.toLocaleString()}</div>
                <div className="text-sm opacity-90">Consultations</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{impactData.courses_completed?.toLocaleString()}</div>
                <div className="text-sm opacity-90">Courses Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{impactData.lives_impacted?.toLocaleString()}</div>
                <div className="text-sm opacity-90">Lives Impacted</div>
              </div>
            </div>
          </div>
        )}

        {/* Modules */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  href={module.link}
                  className={`border-2 ${module.color} rounded-lg p-6 hover:shadow-md transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{module.stat}</div>
                      <div className="text-xs opacity-75">{module.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
                  <p className="text-sm opacity-75">{module.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <Activity className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Telemedicine consultation completed</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <BookOpen className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Completed: Community Health Worker Training</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New certificate earned!</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

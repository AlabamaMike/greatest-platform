import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Calendar, Users, Video, BookOpen, Activity, Plus } from 'lucide-react';
import { healthcareAPI } from '@/lib/api';

export default function Healthcare() {
  const [providers, setProviders] = useState([]);
  const [trainingModules, setTrainingModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      healthcareAPI.getProviders(),
      healthcareAPI.getTrainingModules(),
    ])
      .then(([providersRes, trainingRes]) => {
        setProviders(providersRes.data.data || []);
        setTrainingModules(trainingRes.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Book Appointments',
      description: 'Schedule consultations with healthcare providers',
      action: 'Book Now',
    },
    {
      icon: Video,
      title: 'Telemedicine',
      description: 'Video consultations from anywhere',
      action: 'Start Consultation',
    },
    {
      icon: Activity,
      title: 'Health Records',
      description: 'Access your FHIR-compliant medical records',
      action: 'View Records',
    },
    {
      icon: BookOpen,
      title: 'Healthcare Training',
      description: 'Professional development for healthcare workers',
      action: 'Browse Modules',
    },
  ];

  return (
    <>
      <Head>
        <title>Healthcare - Nexus Platform</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏥 Universal Healthcare</h1>
          <p className="text-gray-600 mt-2">
            Access to healthcare for 3.5B+ people worldwide through telemedicine, EHR, and training.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-red-600">342K+</div>
            <div className="text-sm text-gray-600">Consultations</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-red-600">450K</div>
            <div className="text-sm text-gray-600">People Served</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-red-600">12K+</div>
            <div className="text-sm text-gray-600">Providers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-red-600">89%</div>
            <div className="text-sm text-gray-600">Satisfaction</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <Icon className="w-10 h-10 text-red-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                <button className="text-sm text-red-600 font-medium hover:text-red-700">
                  {feature.action} →
                </button>
              </div>
            );
          })}
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Appointments</h2>
            <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              <Plus className="w-4 h-4" />
              Book Appointment
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming appointments</p>
            <p className="text-sm mt-1">Book your first consultation to get started</p>
          </div>
        </div>

        {/* Healthcare Workers Training */}
        {trainingModules.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Healthcare Worker Training</h2>
            <div className="space-y-3">
              {trainingModules.map((module: any) => (
                <div key={module.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.duration} hours • {module.certification ? 'Certificate available' : 'No certificate'}</p>
                  </div>
                  <button className="text-red-600 font-medium hover:text-red-700">
                    Start →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Data Collection */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mobile Health Data Collection</h2>
          <p className="text-gray-700 mb-4">
            Help track disease surveillance, malnutrition, and community health metrics through mobile reporting.
          </p>
          <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">
            Submit Health Data
          </button>
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { BookOpen, Award, Video, TrendingUp, Search, Filter } from 'lucide-react';
import { educationAPI } from '@/lib/api';

export default function Education() {
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      educationAPI.getCourses(),
      educationAPI.getCertificates(),
    ])
      .then(([coursesRes, certsRes]) => {
        setCourses(coursesRes.data.data || []);
        setCertificates(certsRes.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Education - Nexus Platform</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Education & Skills</h1>
          <p className="text-gray-600 mt-2">
            Free, adaptive learning platform training millions of healthcare workers and learners worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">89K+</div>
            <div className="text-sm text-gray-600">Courses Completed</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">125K</div>
            <div className="text-sm text-gray-600">Learners Trained</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">100+</div>
            <div className="text-sm text-gray-600">Languages</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">92%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Course Catalog */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                    {course.level}
                  </div>
                  <div className="text-xs text-gray-500">{course.language.toUpperCase()}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.enrolled?.toLocaleString()} enrolled</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Certificates */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              My Certificates
            </h2>
            <div className="space-y-3">
              {certificates.map((cert: any) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.course}</h3>
                    <p className="text-sm text-gray-600">Issued: {new Date(cert.issued).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 font-medium hover:text-blue-700">View</button>
                    <button className="text-blue-600 font-medium hover:text-blue-700">Verify</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Recommended for You
          </h2>
          <p className="text-gray-700 mb-4">
            Based on your profile and learning history, we recommend these courses to advance your career.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium mb-1">Advanced Patient Care</h3>
              <p className="text-sm text-gray-600">Relevance: 94%</p>
            </div>
            <div className="flex-1 bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium mb-1">Medical Ethics</h3>
              <p className="text-sm text-gray-600">Relevance: 87%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

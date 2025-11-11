import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Activity, BookOpen, Briefcase, BarChart3,
  AlertTriangle, Globe, Users, TrendingUp, ArrowRight
} from 'lucide-react';

export default function Home() {
  const modules = [
    {
      icon: Activity,
      title: 'Universal Healthcare',
      description: 'Telemedicine, EHR, and health data collection for 3.5B+ people without healthcare access.',
      link: '/healthcare',
      color: 'bg-red-50 text-red-600',
      stats: '342K+ Consultations',
    },
    {
      icon: BookOpen,
      title: 'Education & Skills',
      description: 'Free adaptive learning, certifications, and healthcare worker training for millions.',
      link: '/education',
      color: 'bg-blue-50 text-blue-600',
      stats: '89K+ Courses Completed',
    },
    {
      icon: Briefcase,
      title: 'Economic Empowerment',
      description: 'Job marketplace, microlending, and mobile wallets for financial inclusion.',
      link: '/economic',
      color: 'bg-green-50 text-green-600',
      stats: '12.8K+ Jobs Created',
    },
    {
      icon: BarChart3,
      title: 'Data & SDG Tracking',
      description: 'Real-time monitoring of all 17 UN SDGs with evidence-based analytics.',
      link: '/data',
      color: 'bg-purple-50 text-purple-600',
      stats: '231 SDG Indicators',
    },
    {
      icon: AlertTriangle,
      title: 'Crisis Response',
      description: 'Real-time crisis mapping, resource coordination, and early warning systems.',
      link: '/crisis',
      color: 'bg-orange-50 text-orange-600',
      stats: '145 Coverage Areas',
    },
  ];

  const stats = [
    { label: 'Users Served', value: '1.2M+', icon: Users },
    { label: 'Lives Impacted', value: '3.4M+', icon: Globe },
    { label: 'Countries', value: '50+', icon: TrendingUp },
  ];

  return (
    <>
      <Head>
        <title>Nexus - The Global Impact Platform</title>
        <meta
          name="description"
          content="The greatest software platform designed to change the world through healthcare, education, economic empowerment, and more."
        />
      </Head>

      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The Global Impact Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Open-source platform addressing the world's most pressing challenges through technology.
            Healthcare, education, economic empowerment, and crisis response - all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Explore Platform
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </section>

        {/* Mission */}
        <section className="bg-primary-50 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Mission</h2>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
            Democratize access to essential services and empower communities worldwide to solve local and
            global challenges. Based on comprehensive research of UN SDGs and Effective Altruism frameworks.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600">0/17</div>
              <div className="text-sm text-gray-600 mt-2">UN SDGs on track for 2030</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">$4T</div>
              <div className="text-sm text-gray-600 mt-2">Annual SDG financing gap</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">3.5B</div>
              <div className="text-sm text-gray-600 mt-2">People without healthcare</div>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Platform Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  href={module.link}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className={`inline-flex p-3 rounded-lg ${module.color} mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-600">{module.stats}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-100 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Nexus?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🌍 Open Source & Transparent</h3>
              <p className="text-gray-600">
                All code publicly available under MIT license. Transparent governance and community-driven development.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🔒 Privacy-First</h3>
              <p className="text-gray-600">
                End-to-end encryption, data sovereignty options, and AI models that run locally - your data stays yours.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">📱 Mobile-First & Offline</h3>
              <p className="text-gray-600">
                Works on basic smartphones with limited connectivity. Progressive Web App with offline capabilities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🌐 100+ Languages</h3>
              <p className="text-gray-600">
                Multi-language support with real-time AI translation. Accessible and inclusive design for all.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">📊 Evidence-Based</h3>
              <p className="text-gray-600">
                Built on rigorous research of UN SDGs and Effective Altruism. Every feature addresses real needs.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🚀 Scalable</h3>
              <p className="text-gray-600">
                Microservices architecture designed to serve billions. Proven tech stack used by world's largest platforms.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-600 text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join millions of users using technology to solve humanity's greatest challenges.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="https://github.com/nexus-foundation/nexus-platform"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

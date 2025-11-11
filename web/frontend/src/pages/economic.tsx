import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Briefcase, DollarSign, Wallet, TrendingUp, MapPin, Clock } from 'lucide-react';
import { economicAPI } from '@/lib/api';

export default function Economic() {
  const [jobs, setJobs] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      economicAPI.getJobs(),
      economicAPI.getWalletBalance(),
    ])
      .then(([jobsRes, walletRes]) => {
        setJobs(jobsRes.data.data || []);
        setWalletBalance(walletRes.data.data);
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
        <title>Economic Empowerment - Nexus Platform</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💼 Economic Empowerment</h1>
          <p className="text-gray-600 mt-2">
            Job marketplace, microlending, and mobile wallets for financial inclusion.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">12.8K+</div>
            <div className="text-sm text-gray-600">Jobs Created</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">12K</div>
            <div className="text-sm text-gray-600">Loans Issued</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">97%</div>
            <div className="text-sm text-gray-600">Repayment Rate</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">$2.4M</div>
            <div className="text-sm text-gray-600">Distributed</div>
          </div>
        </div>

        {/* Wallet */}
        {walletBalance && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                <h2 className="text-lg font-semibold">My Wallet</h2>
              </div>
              <button className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100">
                Add Funds
              </button>
            </div>
            <div className="text-4xl font-bold mb-2">
              ${walletBalance.balance?.toFixed(2)} {walletBalance.currency}
            </div>
            <div className="text-sm opacity-90">
              Last transaction: {walletBalance.lastTransaction}
            </div>
          </div>
        )}

        {/* Job Marketplace */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Marketplace</h2>
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${job.remote ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {job.remote ? 'Remote' : 'On-site'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{job.salary}</div>
                  </div>
                </div>
                <button className="mt-3 text-green-600 font-medium hover:text-green-700">
                  Apply Now →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Microlending */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Microlending</h2>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">Apply for a Loan</h3>
            <p className="text-gray-700 mb-4">
              Access microloans from $100-$10,000 with competitive rates. 97% repayment rate, 8.5% interest.
            </p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700">
              Apply for Loan
            </button>
          </div>
        </div>

        {/* Women's Programs */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Women's Economic Empowerment</h2>
          <p className="text-gray-700 mb-4">
            Special programs designed for women entrepreneurs with training, mentorship, and preferential lending terms.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium mb-1">Women in Business Training</h3>
              <p className="text-sm text-gray-600">5,000 participants • 85% completion rate</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium mb-1">Microfinance for Women</h3>
              <p className="text-sm text-gray-600">12,000 loans issued • 97% repayment rate</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

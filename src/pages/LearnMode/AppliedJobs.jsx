import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumb from '../../components/Breadcrumb';

const AppliedJobs = () => {
  const { userProfile } = useAuth();

  const appliedJobs = userProfile?.appliedJobs || [];

  if (appliedJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb />
          <h1 className="text-4xl font-bold mb-8">Applied Jobs</h1>
          
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">No Applications Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete courses and start applying for jobs to see them here
            </p>
            <a href="/jobs" className="btn-primary inline-block">
              Browse Jobs
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb />
        <h1 className="text-4xl font-bold mb-2">Applied Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Track all your job applications in one place
        </p>

        <div className="space-y-4">
          {appliedJobs.map((job, index) => (
            <div key={index} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{job.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Applied on {new Date(job.appliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-semibold">
                    Under Review
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
            💡 Application Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Keep your skills up to date by completing more courses</li>
            <li>• Check back regularly for updates on your applications</li>
            <li>• Consider completing additional courses to strengthen your profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppliedJobs;

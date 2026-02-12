import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';
import Breadcrumb from '../../components/Breadcrumb';

// Static job listings - hardcoded
const AVAILABLE_JOBS = [
  {
    id: 'frontend-intern',
    title: 'Frontend Developer Intern',
    company: 'TechCorp Solutions',
    location: 'Remote',
    type: 'Internship',
    description: 'Join our team to build modern web applications using React and Tailwind CSS.',
    requirements: ['HTML', 'CSS', 'JavaScript basics'],
    salary: '$15-20/hour'
  },
  {
    id: 'python-dev',
    title: 'Python Developer',
    company: 'DataFlow Inc',
    location: 'Hybrid',
    type: 'Full-time',
    description: 'Work on data processing pipelines and automation scripts using Python.',
    requirements: ['Python', 'Problem solving', 'SQL knowledge'],
    salary: '$60,000-80,000/year'
  },
  {
    id: 'web-developer',
    title: 'Web Developer',
    company: 'Creative Designs Studio',
    location: 'On-site',
    type: 'Full-time',
    description: 'Create beautiful, responsive websites for clients using HTML, CSS, and JavaScript.',
    requirements: ['HTML', 'CSS', 'Responsive design'],
    salary: '$50,000-70,000/year'
  }
];

const JobList = () => {
  const { userProfile } = useAuth();
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState('');

  const hasCompletedCourse = (courseName) => {
    return userProfile?.completedCourses?.some(
      course => course.courseName.toLowerCase() === courseName.toLowerCase() && course.accuracy >= 85
    );
  };

  const hasApplied = (jobId) => {
    return userProfile?.appliedJobs?.some(job => job.jobId === jobId);
  };

  const handleApply = async (job) => {
    setApplying(job.id);
    setMessage('');

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        appliedJobs: arrayUnion({
          jobId: job.id,
          title: job.title,
          company: job.company,
          appliedAt: new Date().toISOString()
        })
      });

      setMessage(`Successfully applied to ${job.title}!`);
      
      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error applying for job:', error);
      setMessage('Error applying for job. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-4" />
        <Breadcrumb />
        <h1 className="text-4xl font-bold mb-2">Job Opportunities</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Complete courses with 85%+ accuracy to unlock job applications
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Success') 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {AVAILABLE_JOBS.map((job) => {
            const alreadyApplied = hasApplied(job.id);
            const canApply = job.requirements.some(req => 
              hasCompletedCourse(req.toLowerCase())
            );

            return (
              <div key={job.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold mb-2">
                      {job.type}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.location}</p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {job.description}
                </p>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Requirements:</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          hasCompletedCourse(req.toLowerCase())
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {req}
                        {hasCompletedCourse(req.toLowerCase()) && ' ✓'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-primary-600">
                    {job.salary}
                  </div>

                  {alreadyApplied ? (
                    <button disabled className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed">
                      Already Applied ✓
                    </button>
                  ) : canApply ? (
                    <button
                      onClick={() => handleApply(job)}
                      disabled={applying === job.id}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  ) : (
                    <button disabled className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed">
                      Complete Required Courses
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobList;

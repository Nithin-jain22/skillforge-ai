import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';

const Profile = () => {
  const { userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [switching, setSwitching] = useState(false);

  const handleSwitchMode = async () => {
    setSwitching(true);
    setMessage('');

    const newMode = userProfile.selectedMode === 'learn' ? 'build' : 'learn';

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        selectedMode: newMode
      });

      setMessage(`Successfully switched to ${newMode === 'learn' ? 'Learn' : 'Build'} Mode!`);
      
      // Refresh after 1.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error switching mode:', error);
      setMessage('Error switching mode. Please try again.');
      setSwitching(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb />
        <h1 className="text-4xl font-bold mb-8">Profile</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Success') 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Info */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <p className="text-lg font-semibold">{userProfile?.name}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <p className="text-lg font-semibold">{userProfile?.email}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
              <p className="text-lg font-semibold">
                {new Date(userProfile?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Current Mode */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Current Mode</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary-600 mb-2">
                {userProfile?.selectedMode === 'learn' ? '📚 Learn Mode' : '💻 Build Mode'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {userProfile?.selectedMode === 'learn' 
                  ? 'Take adaptive tests and master new skills'
                  : 'Build projects with AI code assistance'}
              </p>
            </div>
            <button
              onClick={handleSwitchMode}
              disabled={switching}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {switching 
                ? 'Switching...' 
                : `Switch to ${userProfile?.selectedMode === 'learn' ? 'Build' : 'Learn'} Mode`}
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              ⚠️ Note: Switching modes will not transfer your learning progress. Each mode maintains separate data.
            </p>
          </div>
        </div>

        {/* Completed Courses */}
        {userProfile?.selectedMode === 'learn' && (
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">Completed Courses</h2>
            {userProfile?.completedCourses && userProfile.completedCourses.length > 0 ? (
              <div className="space-y-3">
                {userProfile.completedCourses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold capitalize">{course.courseName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Completed on {new Date(course.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {course.accuracy}%
                      </div>
                      {course.accuracy >= 85 && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Certificate
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No courses completed yet. Start learning!
              </div>
            )}
          </div>
        )}

        {/* Applied Jobs */}
        {userProfile?.selectedMode === 'learn' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Applied Jobs</h2>
            {userProfile?.appliedJobs && userProfile.appliedJobs.length > 0 ? (
              <div className="space-y-3">
                {userProfile.appliedJobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Applied {new Date(job.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
                      Under Review
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No job applications yet. Complete courses and apply!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

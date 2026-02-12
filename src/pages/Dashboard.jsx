import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {userProfile?.name}! 👋
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {userProfile?.selectedMode === 'learn' 
            ? 'Ready to learn something new? Choose a course to get started!'
            : 'Ready to build? Start a new project or get help with existing code!'}
        </p>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Current Mode</h3>
            <p className="text-3xl font-bold text-primary-600">
              {userProfile?.selectedMode === 'learn' ? 'Learn' : 'Build'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">
              {userProfile?.selectedMode === 'learn' ? 'Completed Courses' : 'Projects'}
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {userProfile?.completedCourses?.length || 0}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">
              {userProfile?.selectedMode === 'learn' ? 'Applied Jobs' : 'Sessions'}
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {userProfile?.appliedJobs?.length || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {userProfile?.selectedMode === 'learn' ? (
              <>
                <Link to="/courses" className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <h3 className="text-xl font-bold mb-2">📚 Browse Courses</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start learning Python, HTML, or CSS with adaptive AI tests
                  </p>
                </Link>
                
                <Link to="/jobs" className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <h3 className="text-xl font-bold mb-2">💼 View Jobs</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Browse available job opportunities and apply
                  </p>
                </Link>
              </>
            ) : (
              <>
                <Link to="/build" className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <h3 className="text-xl font-bold mb-2">💻 Start Building</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a new project with AI assistance
                  </p>
                </Link>
                
                <Link to="/build?mode=stuck" className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <h3 className="text-xl font-bold mb-2">🔧 Debug Code</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get help fixing bugs in your existing projects
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

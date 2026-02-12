import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';
import Breadcrumb from '../../components/Breadcrumb';

// Predefined courses - static list in code
const AVAILABLE_COURSES = [
  {
    id: 'python',
    name: 'Python',
    description: 'Master Python programming from basics to advanced concepts',
    icon: '🐍',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Learn the foundation of web development with HTML5',
    icon: '🌐',
    color: 'from-orange-600 to-red-600'
  },
  {
    id: 'css',
    name: 'CSS',
    description: 'Style your web pages with modern CSS techniques',
    icon: '🎨',
    color: 'from-purple-600 to-pink-600'
  }
];

const Courses = () => {
  const { userProfile } = useAuth();

  const isCourseCompleted = (courseId) => {
    return userProfile?.completedCourses?.some(course => course.courseName === courseId);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-4" />
        <Breadcrumb />
        <h1 className="text-4xl font-bold mb-2">Available Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose a course to start your adaptive learning journey
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {AVAILABLE_COURSES.map((course) => {
            const completed = isCourseCompleted(course.id);
            const completedCourse = userProfile?.completedCourses?.find(
              c => c.courseName === course.id
            );

            return (
              <div key={course.id} className="card relative overflow-hidden">
                {/* Gradient Background */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-r ${course.color} opacity-10`} />
                
                <div className="relative">
                  <div className="text-6xl mb-4">{course.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{course.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {course.description}
                  </p>

                  {completed ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Completed
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Accuracy: {completedCourse?.accuracy}%
                      </p>
                      <Link
                        to={`/courses/${course.id}/test`}
                        className="btn-secondary w-full text-center block"
                      >
                        Retake Course
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/courses/${course.id}/test`}
                      className="btn-primary w-full text-center block"
                    >
                      Start Learning
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Courses Summary */}
        {userProfile?.completedCourses && userProfile.completedCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            <div className="card">
              <div className="space-y-4">
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
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Certificate Earned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

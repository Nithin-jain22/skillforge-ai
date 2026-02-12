import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    selectedMode: '' // REQUIRED: must choose during signup
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate mode selection
    if (!formData.selectedMode) {
      setError('Please select a learning mode (Learn or Build)');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // CRITICAL: Store ONLY these fields initially
      // All progress arrays start EMPTY
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        selectedMode: formData.selectedMode,
        createdAt: new Date().toISOString(),
        completedCourses: [], // EMPTY - no pre-seeded data
        appliedJobs: [] // EMPTY - no pre-seeded data
      });

      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError('Failed to create account. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {isDark ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="card max-w-md w-full">
        <Link to="/" className="text-3xl font-bold text-center block mb-8 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          SkillForge AI
        </Link>

        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              minLength="6"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Choose Your Learning Mode <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.selectedMode === 'learn' 
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}>
                <input
                  type="radio"
                  name="selectedMode"
                  value="learn"
                  checked={formData.selectedMode === 'learn'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                  required
                />
                <div className="ml-3">
                  <span className="font-semibold block">Learn Mode</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Take adaptive AI tests and master new skills
                  </span>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.selectedMode === 'build' 
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}>
                <input
                  type="radio"
                  name="selectedMode"
                  value="build"
                  checked={formData.selectedMode === 'build'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                  required
                />
                <div className="ml-3">
                  <span className="font-semibold block">Build Mode</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Create projects with AI code assistance
                  </span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

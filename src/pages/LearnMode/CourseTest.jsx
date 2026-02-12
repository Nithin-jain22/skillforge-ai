import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';

// Mock AI adaptive test generator
const generateQuestion = (courseName, difficulty) => {
  const questions = {
    python: {
      easy: [
        { q: 'What is the correct way to print in Python?', options: ['print()', 'console.log()', 'echo', 'printf'], correct: 0 },
        { q: 'Which data type stores whole numbers?', options: ['float', 'int', 'string', 'bool'], correct: 1 }
      ],
      medium: [
        { q: 'How do you create a list in Python?', options: ['[]', '{}', '()', '<>'], correct: 0 },
        { q: 'What keyword defines a function?', options: ['func', 'def', 'function', 'define'], correct: 1 }
      ],
      hard: [
        { q: 'What is list comprehension?', options: ['A loop', 'A concise way to create lists', 'A function', 'An error'], correct: 1 },
        { q: 'What does *args do?', options: ['Multiplication', 'Variable arguments', 'Pointer', 'Comment'], correct: 1 }
      ]
    },
    html: {
      easy: [
        { q: 'What does HTML stand for?', options: ['Hypertext Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correct: 0 },
        { q: 'Which tag creates a paragraph?', options: ['<p>', '<para>', '<text>', '<pg>'], correct: 0 }
      ],
      medium: [
        { q: 'How do you create a link?', options: ['<a>', '<link>', '<href>', '<url>'], correct: 0 },
        { q: 'Which attribute specifies image source?', options: ['href', 'src', 'link', 'url'], correct: 1 }
      ],
      hard: [
        { q: 'What is semantic HTML?', options: ['Styled HTML', 'HTML with meaning', 'JavaScript in HTML', 'CSS framework'], correct: 1 },
        { q: 'Which tag defines navigation?', options: ['<navigation>', '<nav>', '<menu>', '<links>'], correct: 1 }
      ]
    },
    css: {
      easy: [
        { q: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correct: 0 },
        { q: 'How do you select an ID?', options: ['.id', '#id', 'id', '*id'], correct: 1 }
      ],
      medium: [
        { q: 'What is flexbox used for?', options: ['Colors', 'Layout', 'Fonts', 'Borders'], correct: 1 },
        { q: 'How do you center a div?', options: ['center: true', 'align: center', 'margin: auto', 'position: center'], correct: 2 }
      ],
      hard: [
        { q: 'What is specificity?', options: ['CSS speed', 'Rule priority', 'Color intensity', 'Font weight'], correct: 1 },
        { q: 'What does z-index control?', options: ['Width', 'Height', 'Stack order', 'Opacity'], correct: 2 }
      ]
    }
  };

  const courseQuestions = questions[courseName]?.[difficulty] || questions.python.easy;
  return courseQuestions[Math.floor(Math.random() * courseQuestions.length)];
};

const CourseTest = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  
  const [stage, setStage] = useState('pre-test'); // pre-test, learning, final-test, results
  const [difficulty, setDifficulty] = useState('easy');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Learning resources - static arrays
  const learningResources = {
    python: {
      videos: [
        'Introduction to Python - Basics',
        'Python Data Structures',
        'Functions and Modules in Python'
      ],
      notes: [
        'Variables and Data Types',
        'Control Flow (if, loops)',
        'Functions and Scope'
      ]
    },
    html: {
      videos: [
        'HTML Fundamentals',
        'HTML Forms and Input',
        'Semantic HTML5'
      ],
      notes: [
        'Basic HTML Tags',
        'HTML Attributes',
        'HTML5 Elements'
      ]
    },
    css: {
      videos: [
        'CSS Basics',
        'CSS Flexbox Tutorial',
        'CSS Grid Layout'
      ],
      notes: [
        'Selectors and Properties',
        'Box Model',
        'Responsive Design'
      ]
    }
  };

  useEffect(() => {
    if (stage === 'pre-test' || stage === 'final-test') {
      loadNewQuestion();
    }
  }, [stage, difficulty]);

  const loadNewQuestion = () => {
    const question = generateQuestion(courseName, difficulty);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct;
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setWrongCount(0);
      
      // Increase difficulty on correct answer
      if (difficulty === 'easy') setDifficulty('medium');
      else if (difficulty === 'medium') setDifficulty('hard');
      
      setTimeout(() => {
        if (stage === 'pre-test' && totalQuestions >= 4) {
          setStage('learning');
        } else if (stage === 'final-test' && totalQuestions >= 9) {
          calculateResults();
        } else {
          loadNewQuestion();
        }
      }, 1500);
    } else {
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      
      // Exit test if wrong twice at same level (pre-test only)
      if (stage === 'pre-test' && newWrongCount >= 2) {
        setTimeout(() => setStage('learning'), 1500);
      } else {
        setTimeout(() => loadNewQuestion(), 1500);
      }
    }
  };

  const calculateResults = async () => {
    const accuracy = Math.round((score / totalQuestions) * 100);
    
    try {
      // Store completion in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        completedCourses: arrayUnion({
          courseName: courseName,
          accuracy: accuracy,
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving course completion:', error);
    }

    setStage('results');
    setAnswers({ accuracy, score, totalQuestions });
  };

  if (stage === 'learning') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 capitalize">{courseName} Learning Resources</h1>
          
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">📹 Video Tutorials</h2>
            <ul className="space-y-3">
              {learningResources[courseName]?.videos.map((video, index) => (
                <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">▶️</span>
                  <span>{video}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">📝 Study Notes</h2>
            <ul className="space-y-3">
              {learningResources[courseName]?.notes.map((note, index) => (
                <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">📄</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setStage('final-test');
              setScore(0);
              setTotalQuestions(0);
              setDifficulty('easy');
            }}
            className="btn-primary"
          >
            Start Final Test
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const { accuracy } = answers;
    const passed = accuracy >= 85;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="card max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
          <h1 className="text-4xl font-bold mb-4">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          
          <div className="my-8">
            <div className="text-6xl font-bold text-primary-600 mb-2">
              {accuracy}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              You got {score} out of {totalQuestions} questions correct
            </p>
          </div>

          {passed && (
            <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                Certificate Earned! 🏆
              </h3>
              <p className="text-green-600 dark:text-green-300">
                You can now apply for jobs related to {courseName}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/courses')} className="btn-secondary">
              Back to Courses
            </button>
            {passed && (
              <button onClick={() => navigate('/jobs')} className="btn-primary">
                View Jobs
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-test or Final Test UI
  return (
    <div className="p-8 flex items-center justify-center min-h-full">
      <div className="card max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">
            {stage === 'pre-test' ? 'Pre-Knowledge Test' : 'Final Test'}
          </h2>
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
            {difficulty.toUpperCase()}
          </span>
        </div>

        {currentQuestion && (
          <>
            <div className="mb-6">
              <p className="text-lg mb-4">{currentQuestion.q}</p>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showFeedback && setSelectedAnswer(index)}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      showFeedback
                        ? index === currentQuestion.correct
                          ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                          : index === selectedAnswer
                          ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                        : selectedAnswer === index
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showFeedback && (
              <div className={`p-4 rounded-lg mb-4 ${
                selectedAnswer === currentQuestion.correct
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {selectedAnswer === currentQuestion.correct ? '✅ Correct!' : '❌ Incorrect'}
              </div>
            )}

            {!showFeedback && (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Question {totalQuestions + 1}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseTest;

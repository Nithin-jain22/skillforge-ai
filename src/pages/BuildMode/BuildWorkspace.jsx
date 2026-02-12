import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import BackButton from '../../components/BackButton';
import Breadcrumb from '../../components/Breadcrumb';

// Demo project templates
const DEMO_PROJECTS = {
  counter: {
    name: 'Simple Counter App',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counter App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Counter App</h1>
        <div id="count" class="count">0</div>
        <div class="buttons">
            <button onclick="decrement()">-</button>
            <button onclick="increment()">+</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.count {
    font-size: 80px;
    font-weight: bold;
    margin: 30px 0;
    color: #667eea;
}

.buttons button {
    font-size: 30px;
    padding: 15px 30px;
    margin: 10px;
    cursor: pointer;
    border: none;
    border-radius: 10px;
    background: #667eea;
    color: white;
    transition: all 0.3s;
}

.buttons button:hover {
    background: #764ba2;
    transform: scale(1.1);
}`,
      'script.js': `let count = 0;
const display = document.getElementById("count");

function increment() {
  count++;
  display.innerText = count;
}

function decrement() {
  count--;
  display.innerText = count;
}`
    }
  },
  buggy_counter: {
    name: 'Counter App (with bugs)',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counter App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Counter App</h1>
        <div id="count" class="count">0</div>
        <div class="buttons">
            <button onclick="decrement()">-</button>
            <button onclick="increment()">+</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.count {
    font-size: 80px;
    font-weight: bold;
    margin: 30px 0;
    color: #667eea;
}

.buttons button {
    font-size: 30px;
    padding: 15px 30px;
    margin: 10px;
    cursor: pointer;
    border: none;
    border-radius: 10px;
    background: #667eea;
    color: white;
    transition: all 0.3s;
}

.buttons button:hover {
    background: #764ba2;
    transform: scale(1.1);
}`,
      'script.js': `let count = 0
const display = document.getElementById("count")

function increment() {
  count++
  display.innerText = coun
}

function decrement() {
  count--
  display.innerText = count
}`
    }
  }
};

const BuildWorkspace = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'build'; // 'build' or 'stuck'
  
  const [currentMode, setCurrentMode] = useState(mode);
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState('script.js');
  const [code, setCode] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentMode === 'stuck') {
      // Load buggy demo project
      const buggyProject = DEMO_PROJECTS.buggy_counter;
      setFiles(buggyProject.files);
      setCurrentFile('script.js');
      setCode(buggyProject.files['script.js']);
    }
  }, [currentMode]);

  // Mock AI function to analyze code and generate explanations
  const analyzeCode = (userIdea) => {
    setLoading(true);
    
    setTimeout(() => {
      if (currentMode === 'build') {
        // Build from scratch mode
        const project = DEMO_PROJECTS.counter;
        setFiles(project.files);
        setCurrentFile('script.js');
        setCode(project.files['script.js']);
        
        setAiExplanation(`
# Project Analysis: ${userIdea}

## What I Created
A simple counter application with increment and decrement functionality.

## File Structure
- **index.html**: Main HTML structure with counter display and buttons
- **style.css**: Styling for a modern, centered layout with gradient background
- **script.js**: JavaScript logic for counter functionality

## Key Concepts Explained

### Variables
\`\`\`javascript
let count = 0;
\`\`\`
- We use \`let\` to declare a variable that can change
- \`count\` stores the current counter value

### DOM Manipulation
\`\`\`javascript
const display = document.getElementById("count");
\`\`\`
- \`document.getElementById()\` gets the HTML element
- We store it in a constant to access later

### Functions
\`\`\`javascript
function increment() {
  count++;
  display.innerText = count;
}
\`\`\`
- Functions group related code
- \`count++\` increases the value by 1
- \`innerText\` updates what the user sees

## Why This Approach?
- **Separation of Concerns**: HTML (structure), CSS (style), JS (behavior) are separate
- **Simple & Clear**: Easy to understand and modify
- **Interactive**: Responds to user clicks in real-time
        `);
      } else {
        // Stuck mode - detect bugs
        setAiExplanation(`
# Bug Analysis

## Issues Found

### 1. Missing Semicolons ⚠️
Lines 1-2 are missing semicolons. While JavaScript allows this, it's best practice to include them.

### 2. **CRITICAL ERROR** - Typo in Variable Name 🔴
**Line 6**: \`display.innerText = coun\`

**Problem**: You wrote \`coun\` instead of \`count\`

**Why it's an error**:
- JavaScript is case-sensitive and spelling matters
- \`coun\` is not defined anywhere in your code
- This will throw a \`ReferenceError: coun is not defined\`

**How to fix it**:
Change \`coun\` to \`count\`

## Corrected Code
\`\`\`javascript
let count = 0;
const display = document.getElementById("count");

function increment() {
  count++;
  display.innerText = count;  // Fixed: count instead of coun
}

function decrement() {
  count--;
  display.innerText = count;
}
\`\`\`

## What You Learned
- Variable names must match exactly
- Typos are a common source of bugs
- Always check your variable names carefully
        `);
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    analyzeCode(userInput);
    setUserInput('');
  };

  const loadDemoProject = (projectKey) => {
    const project = DEMO_PROJECTS[projectKey];
    setFiles(project.files);
    setCurrentFile('script.js');
    setCode(project.files['script.js']);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button + Title */}
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold">
              Build Workspace
            </h1>
          </div>
          
          {/* Right: Mode Switcher + Profile */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentMode('build');
                  setFiles({});
                  setCode('');
                  setAiExplanation('');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  currentMode === 'build'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Build
              </button>
              <button
                onClick={() => {
                  setCurrentMode('stuck');
                  loadDemoProject('buggy_counter');
                  setAiExplanation('');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  currentMode === 'stuck'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Debug
              </button>
            </div>
            
            {/* Profile Icon */}
            <Link
              to="/profile"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Explorer */}
        <div className="w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <Breadcrumb />
          <h3 className="font-bold mb-3 text-sm uppercase text-gray-600 dark:text-gray-400">Files</h3>
          {Object.keys(files).length > 0 ? (
            <div className="space-y-1">
              {Object.keys(files).map(filename => (
                <button
                  key={filename}
                  onClick={() => {
                    setCurrentFile(filename);
                    setCode(files[filename]);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    currentFile === filename
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {filename}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentMode === 'build' ? 'Enter an idea below to generate files' : 'Load a project to debug'}
            </p>
          )}
        </div>

        {/* Center: Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 font-mono text-sm">
            {currentFile || 'No file selected'}
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={
                currentFile?.endsWith('.html') ? 'html' :
                currentFile?.endsWith('.css') ? 'css' :
                'javascript'
              }
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </div>

        {/* Right: AI Explanation Panel */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4">
            <h3 className="font-bold">AI Explanation</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
            ) : aiExplanation ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiExplanation.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h2>;
                  } else if (line.startsWith('## ')) {
                    return <h3 key={i} className="text-lg font-bold mt-3 mb-2">{line.substring(3)}</h3>;
                  } else if (line.startsWith('### ')) {
                    return <h4 key={i} className="text-md font-bold mt-2 mb-1">{line.substring(4)}</h4>;
                  } else if (line.startsWith('```')) {
                    return null; // Handle code blocks separately
                  } else if (line.trim().startsWith('-')) {
                    return <li key={i} className="ml-4">{line.substring(1).trim()}</li>;
                  } else if (line.includes('`') && !line.startsWith('```')) {
                    const parts = line.split('`');
                    return (
                      <p key={i} className="mb-2">
                        {parts.map((part, j) => 
                          j % 2 === 0 ? part : <code key={j} className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{part}</code>
                        )}
                      </p>
                    );
                  } else if (line.trim()) {
                    return <p key={i} className="mb-2">{line}</p>;
                  }
                  return <br key={i} />;
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                <div className="text-4xl mb-4">🤖</div>
                <p>AI explanations will appear here</p>
                <p className="text-sm mt-2">
                  {currentMode === 'build' 
                    ? 'Enter your project idea below'
                    : 'AI will analyze your code for bugs'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Chat Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={currentMode === 'build' ? 'Describe your project idea (e.g., "Build a simple counter app")' : 'Describe the issue or click "Analyze Code"'}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || (!userInput.trim() && currentMode === 'build')}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : currentMode === 'build' ? 'Generate' : 'Analyze Code'}
          </button>
        </div>
        
        {currentMode === 'stuck' && Object.keys(files).length === 0 && (
          <div className="max-w-4xl mx-auto mt-2">
            <button
              onClick={() => loadDemoProject('buggy_counter')}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
            >
              Load Demo Buggy Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildWorkspace;

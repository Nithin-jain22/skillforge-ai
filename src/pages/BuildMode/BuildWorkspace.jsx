import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import BackButton from '../../components/BackButton';
import Breadcrumb from '../../components/Breadcrumb';

// ============================================
// PROJECT TEMPLATES
// ============================================

// CLEAN TEMPLATE - Used for Build Mode ONLY
// This template contains NO bugs and is production-ready
const DEMO_PROJECTS = {
  counter: {
    name: 'Simple Counter App',
    description: 'Clean, bug-free counter app for Build mode generation',
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
  
  // BUGGY TEMPLATE - Used for Debug Mode Demo ONLY
  // This template contains INTENTIONAL bugs for testing debug logic
  // Should NEVER be used in Build mode
  buggy_counter: {
    name: 'Counter App (with bugs)',
    description: 'Demo project with intentional bugs for Debug mode practice',
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
  const mode = searchParams.get('mode') || 'build';
  
  const [activeMode, setActiveMode] = useState(mode === 'stuck' ? 'debug' : 'build'); // 'build' | 'debug' | 'preview'
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState('script.js');
  const [code, setCode] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeMode === 'debug' && Object.keys(files).length === 0) {
      // Load buggy demo project when switching to debug mode
      const buggyProject = DEMO_PROJECTS.buggy_counter;
      setFiles(buggyProject.files);
      setCurrentFile('script.js');
      setCode(buggyProject.files['script.js']);
    }
  }, [activeMode]);

  // Update files when code changes
  useEffect(() => {
    if (currentFile && code !== undefined) {
      setFiles(prev => ({
        ...prev,
        [currentFile]: code
      }));
    }
  }, [code, currentFile]);

  // Generate live preview HTML document
  const generatePreview = () => {
    if (!files['index.html']) return '<html><body><p>No HTML file loaded</p></body></html>';
    
    let html = files['index.html'] || '';
    const css = files['style.css'] || '';
    const js = files['script.js'] || '';
    
    // Inject CSS into HTML
    if (css) {
      html = html.replace('</head>', `<style>${css}</style></head>`);
    }
    
    // Inject JS into HTML (replace external script tag)
    if (js) {
      html = html.replace(/<script src="script\.js"><\/script>/, `<script>${js}</script>`);
    }
    
    return html;
  };

  // Debug mode: Analyze JavaScript code for common bugs
  const analyzeDebugCode = (codeToAnalyze) => {
    const lines = codeToAnalyze.split('\n');
    const issues = [];
    const declaredVariables = new Set();
    const usedVariables = new Set();
    const domElements = new Set();
    
    // Extract declared variables (let, const, var, function)
    lines.forEach((line, index) => {
      // Function declarations
      const funcMatch = line.match(/function\s+(\w+)/);
      if (funcMatch) declaredVariables.add(funcMatch[1]);
      
      // Variable declarations
      const varMatch = line.match(/(?:let|const|var)\s+(\w+)/);
      if (varMatch) declaredVariables.add(varMatch[1]);
      
      // DOM element IDs from getElementById
      const domMatch = line.match(/getElementById\(["'](\w+)["']\)/);
      if (domMatch) domElements.add(domMatch[1]);
    });
    
    // Analyze each line for issues
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
      
      // Check for missing semicolons (simple heuristic)
      if (trimmed.length > 0 && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') &&
          !trimmed.startsWith('function') &&
          !trimmed.startsWith('if') &&
          !trimmed.startsWith('for') &&
          !trimmed.startsWith('while') &&
          (trimmed.includes('=') || trimmed.includes('++') || trimmed.includes('--'))) {
        issues.push({
          type: 'warning',
          line: lineNum,
          message: 'Missing semicolon (best practice)',
          severity: 'low'
        });
      }
      
      // Check for undefined variables (common typos)
      const varUsagePattern = /\b(\w+)(?:\s*=|\+\+|--|\.)(?!\s*function)/g;
      let match;
      while ((match = varUsagePattern.exec(line)) !== null) {
        const varName = match[1];
        if (!declaredVariables.has(varName) && 
            !['document', 'console', 'window', 'Math', 'Date', 'String', 'Number', 'Array'].includes(varName)) {
          // Check if it might be a typo of an existing variable
          const possibleTypo = Array.from(declaredVariables).find(declared => {
            // Check if it's similar (off by 1-2 characters)
            const similarity = getSimilarity(varName, declared);
            return similarity > 0.7 && varName !== declared;
          });
          
          if (possibleTypo) {
            issues.push({
              type: 'error',
              line: lineNum,
              variable: varName,
              suggestion: possibleTypo,
              message: `Variable '${varName}' is not defined. Did you mean '${possibleTypo}'?`,
              severity: 'high'
            });
          }
        }
      }
    });
    
    // Helper function to calculate similarity
    function getSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      if (longer.length === 0) return 1.0;
      const editDistance = levenshteinDistance(str1, str2);
      return (longer.length - editDistance) / longer.length;
    }
    
    function levenshteinDistance(str1, str2) {
      const matrix = [];
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[str2.length][str1.length];
    }
    
    // Generate structured explanation
    if (issues.length === 0) {
      return {
        title: 'No Issues Found! ✅',
        problem: 'Your code looks good!',
        cause: 'No common errors were detected in the analysis.',
        fix: 'Your code appears to be clean. You can continue testing it.',
        correctedCode: codeToAnalyze
      };
    }
    
    // Find the most critical issue
    const criticalIssue = issues.find(i => i.severity === 'high') || issues[0];
    const warningIssues = issues.filter(i => i.severity === 'low');
    
    // Fix the code
    let correctedCode = codeToAnalyze;
    if (criticalIssue.type === 'error' && criticalIssue.suggestion) {
      correctedCode = correctedCode.replace(
        new RegExp(`\\b${criticalIssue.variable}\\b`, 'g'),
        criticalIssue.suggestion
      );
      // Add semicolons to lines that need them
      const correctedLines = correctedCode.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed.length > 0 && 
            !trimmed.endsWith(';') && 
            !trimmed.endsWith('{') && 
            !trimmed.endsWith('}') &&
            (trimmed.includes('=') || trimmed.match(/\b(count|display)\b.*$/))) {
          return line + ';';
        }
        return line;
      });
      correctedCode = correctedLines.join('\n');
    }
    
    return {
      title: criticalIssue.type === 'error' ? '🔴 Bug Detected' : '⚠️  Code Issues Found',
      problem: criticalIssue.message,
      cause: criticalIssue.type === 'error' 
        ? `JavaScript is case-sensitive and variables must be declared before use. The typo '${criticalIssue.variable}' will cause a ReferenceError at runtime.`
        : 'Code quality issues detected that should be addressed.',
      fix: criticalIssue.type === 'error'
        ? `Change '${criticalIssue.variable}' to '${criticalIssue.suggestion}' on line ${criticalIssue.line}.${warningIssues.length > 0 ? ` Also add semicolons to ${warningIssues.length} line(s) for best practice.` : ''}`
        : 'Review and fix the issues listed below.',
      correctedCode: correctedCode,
      allIssues: issues
    };
  };

  // ============================================
  // BUILD MODE: Generate clean, runnable code
  // ============================================
  const generateBuildProject = (userIdea) => {
    // Always use the CLEAN counter template
    // This ensures generated code is bug-free and ready to run
    const project = DEMO_PROJECTS.counter;
    setFiles(project.files);
    setCurrentFile('script.js');
    setCode(project.files['script.js']);
    
    return `
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
- **No Bugs**: Clean, production-ready code
    `;
  };

  // ============================================
  // DEBUG MODE: Analyze user-edited code
  // ============================================
  const generateDebugAnalysis = () => {
    // Analyze whatever code the user has in the editor
    // This could be buggy code they wrote or loaded
    const analysis = analyzeDebugCode(code);
    
    return `
# ${analysis.title}

## Problem Found
${analysis.problem}

## Why This Happens
${analysis.cause}

## How to Fix It
${analysis.fix}

## Corrected Code
\`\`\`javascript
${analysis.correctedCode}
\`\`\`

## What You Learned
- Variable names must match exactly - JavaScript is case-sensitive
- Typos are a common source of bugs in programming
- Always double-check variable names when debugging
- Using semicolons is a JavaScript best practice
    `;
  };

  // Main AI analysis dispatcher
  const analyzeCode = (userIdea) => {
    setLoading(true);
    
    setTimeout(() => {
      if (activeMode === 'build') {
        // BUILD MODE: Generate clean project from user idea
        const explanation = generateBuildProject(userIdea);
        setAiExplanation(explanation);
      } else if (activeMode === 'debug') {
        // DEBUG MODE: Analyze current editor code for bugs
        const explanation = generateDebugAnalysis();
        setAiExplanation(explanation);
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = () => {
    // In Build mode, require user input
    if (activeMode === 'build' && !userInput.trim()) return;
    
    // In Debug mode, analyze current code even without input
    if (activeMode === 'debug') {
      if (!code.trim()) {
        setAiExplanation('# No Code to Analyze\n\nPlease load a project or write some code in the editor first.');
        return;
      }
      analyzeCode(userInput || 'Analyzing your code...');
    } else if (activeMode === 'build') {
      analyzeCode(userInput);
    }
    
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
          
          {/* Right: Tab Switcher + Profile */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveMode('build');
                  setAiExplanation('');
                  setUserInput('');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeMode === 'build'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Build
              </button>
              <button
                onClick={() => {
                  setActiveMode('debug');
                  setAiExplanation('');
                  setUserInput('');
                  if (Object.keys(files).length === 0) {
                    loadDemoProject('buggy_counter');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeMode === 'debug'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Debug
              </button>
              <button
                onClick={() => setActiveMode('preview')}
                disabled={Object.keys(files).length === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeMode === 'preview'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Preview
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
              {activeMode === 'build' ? 'Enter an idea below to generate files' : activeMode === 'debug' ? 'Load a project to debug' : 'Generate a project first'}
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

        {/* Right: AI Explanation or Preview Panel */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4">
            <h3 className="font-bold">
              {activeMode === 'preview' ? '👁️ Live Preview' : '🤖 AI Explanation'}
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activeMode === 'preview' ? (
              <div className="h-full bg-white dark:bg-gray-900">
                {Object.keys(files).length > 0 ? (
                  <iframe
                    srcDoc={generatePreview()}
                    title="Live Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
                    <div>
                      <div className="text-4xl mb-4">👁️</div>
                      <p className="font-semibold">No Preview Available</p>
                      <p className="text-sm mt-2">Generate a project to see the live preview</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
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
                      {activeMode === 'build' 
                        ? 'Enter your project idea below'
                        : 'AI will analyze your code for bugs'}
                    </p>
                  </div>
                )}
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
            placeholder={activeMode === 'build' ? 'Describe your project idea (e.g., "Build a simple counter app")' : activeMode === 'debug' ? 'Describe the issue or click "Analyze Code"' : 'Project preview mode'}
            disabled={activeMode === 'preview'}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || (!userInput.trim() && activeMode === 'build') || activeMode === 'preview'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : activeMode === 'build' ? 'Generate' : activeMode === 'debug' ? 'Analyze Code' : 'Preview Mode'}
          </button>
        </div>
        
        {activeMode === 'debug' && Object.keys(files).length === 0 && (
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

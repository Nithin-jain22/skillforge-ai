import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import BackButton from '../../components/BackButton';
import Breadcrumb from '../../components/Breadcrumb';

/* ============================================
   CLEAN & BUGGY DEMO PROJECTS
============================================ */

const DEMO_PROJECTS = {
  counter: {
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
<title>Counter</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
<h1>Counter</h1>
<div id="count">0</div>
<button onclick="increment()">+</button>
<button onclick="decrement()">-</button>
</div>
<script src="script.js"></script>
</body>
</html>`,
      'style.css': `body{font-family:Arial;text-align:center;padding-top:50px}`,
      'script.js': `let count = 0;
const display = document.getElementById("count");

function increment(){
  count++;
  display.innerText = count;
}

function decrement(){
  count--;
  display.innerText = count;
}`
    }
  },

  buggy_counter: {
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
<title>Counter</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
<h1>Counter</h1>
<div id="count">0</div>
<button onclick="increment()">+</button>
<button onclick="decrement()">-</button>
</div>
<script src="script.js"></script>
</body>
</html>`,
      'style.css': `body{font-family:Arial;text-align:center;padding-top:50px}`,
      'script.js': `let count = 0
const display = document.getElementById("count")

function increment(){
  count++
  display.innerText = coun
}

function decrement(){
  count--
  display.innerText = count
}`
    }
  }
};

const BuildWorkspace = () => {
  const [searchParams] = useSearchParams();
  const modeFromURL = searchParams.get("mode") || "build";

  const [activeMode] = useState(modeFromURL); // Controlled ONLY by URL
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState("");
  const [code, setCode] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [userInput, setUserInput] = useState("");

  /* ============================================
     AUTO LOAD MODE
  ============================================ */

  useEffect(() => {
    if (activeMode === "debug") {
      const project = DEMO_PROJECTS.buggy_counter;
      setFiles(project.files);
      setCurrentFile("script.js");
      setCode(project.files["script.js"]);
    }
  }, [activeMode]);

  /* ============================================
     FILE SYNC
  ============================================ */

  useEffect(() => {
    if (currentFile) {
      setFiles(prev => ({ ...prev, [currentFile]: code }));
    }
  }, [code, currentFile]);

  /* ============================================
     PREVIEW
  ============================================ */

  const generatePreview = () => {
    if (!files["index.html"]) return "<html><body>No preview</body></html>";

    let html = files["index.html"];
    const css = files["style.css"] || "";
    const js = files["script.js"] || "";

    html = html.replace("</head>", `<style>${css}</style></head>`);
    html = html.replace(
      /<script src="script\.js"><\/script>/,
      `<script>${js}</script>`
    );

    return html;
  };

  /* ============================================
     DEBUG ANALYSIS
  ============================================ */

  const analyzeDebugCode = () => {
    if (code.includes("coun") && !code.includes("let coun")) {
      setAiExplanation(`
# 🔴 Bug Detected

## Problem
Variable "coun" is not defined.

## Cause
There is a typo in variable name.

## Fix
Replace "coun" with "count".

## Corrected Code
\`\`\`javascript
display.innerText = count;
\`\`\`
      `);
    } else {
      setAiExplanation(`# ✅ No major issues detected.`);
    }
  };

  /* ============================================
     BUILD GENERATION
  ============================================ */

  const generateBuild = () => {
    const project = DEMO_PROJECTS.counter;
    setFiles(project.files);
    setCurrentFile("script.js");
    setCode(project.files["script.js"]);

    setAiExplanation(`
# Project Generated

Clean counter project created successfully.

Files:
- index.html
- style.css
- script.js

You can now preview or edit it.
    `);
  };

  /* ============================================
     SUBMIT HANDLER
  ============================================ */

  const handleSubmit = () => {
    if (activeMode === "build") {
      generateBuild();
    } else if (activeMode === "debug") {
      analyzeDebugCode();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-4 items-center">
          <BackButton />
          <h1 className="text-xl font-bold">
            {activeMode === "build"
              ? "Build Workspace"
              : "Debug Workspace"}
          </h1>
        </div>

        <Link to="/profile">Profile</Link>
      </div>

      {/* MAIN */}
      <div className="flex flex-1">
        {/* FILES */}
        <div className="w-40 border-r p-3">
          {Object.keys(files).map(file => (
            <div
              key={file}
              onClick={() => {
                setCurrentFile(file);
                setCode(files[file]);
              }}
              className="cursor-pointer p-1"
            >
              {file}
            </div>
          ))}
        </div>

        {/* EDITOR */}
        <div className="flex-1">
          <Editor
            height="100%"
            language="javascript"
            value={code}
            onChange={val => setCode(val || "")}
            theme="vs-dark"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-96 border-l flex flex-col">
          <div className="p-3 font-bold bg-gray-200">
            {activeMode === "build"
              ? "AI Explanation"
              : "Debug Analysis"}
          </div>

          <div className="flex-1 p-4 overflow-auto whitespace-pre-wrap">
            {aiExplanation || "Output will appear here"}
          </div>

          {/* PREVIEW */}
          {Object.keys(files).length > 0 && (
            <iframe
              srcDoc={generatePreview()}
              className="h-64 border-t"
              sandbox="allow-scripts"
              title="preview"
            />
          )}
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border p-2"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder={
            activeMode === "build"
              ? "Describe project..."
              : "Click Analyze Code"
          }
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2"
        >
          {activeMode === "build" ? "Generate" : "Analyze Code"}
        </button>
      </div>
    </div>
  );
};

export default BuildWorkspace;
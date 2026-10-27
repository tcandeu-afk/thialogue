#!/bin/zsh
set -e

ROOT="/Users/tcandeu/.gemini/antigravity/scratch/storyflow-reader"
OUT="$ROOT/preview.html"

cat << 'HEADER' > "$OUT"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thialogue — Comprehensible Input & StoryLearning Reader</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Noto+Serif+JP:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              serif: ['"Newsreader"', '"Noto Serif JP"', 'Georgia', 'serif'],
              sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
            },
          },
        },
      };
    </script>
    <style>
      html, body {
        background-color: #F2F4F3;
        color: #181D1B;
        overflow-x: clip;
      }
      ruby {
        ruby-align: center;
        ruby-position: over;
        display: inline-ruby;
        line-height: 2.35;
      }
      rt {
        font-family: 'Inter', 'Noto Serif JP', sans-serif;
        font-size: 0.62em;
        font-weight: 500;
        color: #5C6661;
        letter-spacing: 0.02em;
        user-select: none;
        line-height: 1;
        transform: translateY(-1px);
      }
    </style>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18.3.1",
          "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
          "lucide-react": "https://esm.sh/lucide-react@0.468.0?deps=react@18.3.1"
        }
      }
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body class="bg-[#F2F4F3] text-[#181D1B] antialiased selection:bg-stone-200/70 selection:text-stone-900">
    <div id="root"></div>
    <script type="text/babel" data-type="module">
      import React, { useState, useEffect, useRef, useMemo } from 'react';
      import ReactDOM from 'react-dom/client';
      import {
        AlertCircle, ArrowLeftRight, ArrowRight, Award, BookMarked, BookOpen, BookmarkCheck,
        Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy,
        ExternalLink, Eye, EyeOff, Flame, Globe, GraduationCap, Headphones, HelpCircle,
        Info, KeyRound, Languages, Layers, Lightbulb, ListOrdered, Loader2, Maximize2,
        Menu, MessageSquare, Minimize2, Pause, Play, Plus, Puzzle, Radio, RefreshCw,
        RotateCcw, Save, Scale, ScrollText, Search, Settings, ShieldAlert, ShieldCheck,
        Shuffle, Sliders, SlidersHorizontal, Sparkles, Square, Subtitles, Trash2,
        Volume2, X, XCircle
      } from 'lucide-react';
HEADER

/usr/bin/python3 - "$ROOT" >> "$OUT" << 'PYEOF'
import sys, os, re

root = sys.argv[1]
files = [
    "src/types/schema.js",
    "src/data/initialProfiles.js",
    "src/services/storageService.js",
    "src/services/audioService.js",
    "src/services/translateService.js",
    "src/services/geminiService.js",
    "src/components/TopReaderBar.jsx",
    "src/components/AudioPlayerBar.jsx",
    "src/components/ChapterRecapSection.jsx",
    "src/components/InteractiveReader.jsx",
    "src/components/VocabSidebar.jsx",
    "src/components/TranslatorPanel.jsx",
    "src/components/SettingsModal.jsx",
    "src/App.jsx",
]

for rel in files:
    path = os.path.join(root, rel)
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
    # Remove import statements (including multi-line imports)
    code = re.sub(r'^\s*import\s+[\s\S]*?from\s+[\'"][^\'"]+[\'"];?\s*$', '', code, flags=re.MULTILINE)
    code = re.sub(r'^\s*import\s+[\'"][^\'"]+[\'"];?\s*$', '', code, flags=re.MULTILINE)
    # Replace export default function / export function / export const
    code = re.sub(r'\bexport\s+default\s+function\b', 'function', code)
    code = re.sub(r'\bexport\s+function\b', 'function', code)
    code = re.sub(r'\bexport\s+async\s+function\b', 'async function', code)
    code = re.sub(r'\bexport\s+const\b', 'const', code)
    print(f"\n// ==================== {rel} ====================\n")
    print(code)
PYEOF

cat << 'FOOTER' >> "$OUT"
      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    </script>
  </body>
</html>
FOOTER

mkdir -p "$ROOT/dist/audio"
cp "$OUT" "$ROOT/index.html"
cp "$OUT" "$ROOT/dist/index.html"
cp -R "$ROOT/audio/"* "$ROOT/dist/audio/" 2>/dev/null || true
echo "Built $OUT and synced $ROOT/index.html and $ROOT/dist/"

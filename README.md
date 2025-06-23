# 🧠 Figma Natural Language Plugin Instructions

This document provides implementation guidance for building a Figma plugin powered by Groq that lets users manipulate Figma files using natural language. It includes configuration, API integration, and development best practices.

---

🔒 **IMPORTANT FOR CURSOR:**
- Do not hallucinate any additional logic, models, or functionality beyond this spec
- Push all final code to: https://github.com/rmarti55/FigmaAIplugin
- Scaffold the following:
  - `README.md` (this file)
  - `plugin/code.ts` (compiled to `code.js`)
  - `manifest.json` with hosted UI
  - `app/api/groq/route.ts` for backend Groq call
  - `public/fonts/` with Apple fonts
  - `.env` support with `GROQ_API_KEY`

---

## ✅ Project Overview

**Goal:** Build a Figma plugin that interprets natural language commands to modify the canvas, layers, and objects using Groq LLM.

**LLM:** Groq — `meta-llama/llama-4-scout-17b-16e-instruct`

**Architecture:** Direct integration with Groq API, no middleware required.

---

## 📁 Folder Structure & Tech Stack

```
/plugin              → Figma plugin code (TypeScript)
/build               → Compiled plugin output
/public/fonts/       → Locally installed Apple fonts
README.md            → This file
.env                 → Contains GROQ_API_KEY
```

---

## ⚙️ Plugin Setup

1. Configure Groq API Key:
   - Replace `GROQ_API_KEY` in `plugin/code.ts`
   - Plugin makes direct API calls to Groq

2. Build the Plugin:
   ```bash
   npm install
   npm run build
   ```

3. Import in Figma:
   - Open Figma Desktop
   - Plugins > Development > Import plugin from manifest
   - Select `manifest.json`

---

## 📦 manifest.json

```json
{
  "name": "Figma AI Plugin",
  "id": "1267028074781521324",
  "api": "1.0.0",
  "main": "build/code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["https://api.groq.com"],
    "reasoning": "Direct integration with Groq API"
  }
}
```

---

## 🔐 Backend Groq API Handler

**File:** `app/api/groq/route.ts`

```ts
export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: false
    }),
  });

  if (!res.ok) {
    console.error("Groq error", await res.text());
    return new Response(JSON.stringify({ result: "Error: Unable to process request." }), { status: 500 });
  }

  const data = await res.json();
  return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "" }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

---

## 🎨 Fonts

- Download Apple system fonts from: [developer.apple.com/fonts](https://developer.apple.com/fonts/)
- Place in `/public/fonts/`
- Load explicitly via `figma.loadFontAsync()` **before** editing any `TextNode`

```ts
await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
```

---

## 🧪 Build / Compile

- TypeScript is used — compile to JavaScript before running
- Use `tsc --watch` or VS Code `Build Task`
- `manifest.json` must point to final `.js` output, not `.ts`

---

## ✅ Dev Checklist

- [ ] Add `@figma/plugin-typings`
- [ ] Add `.env` with `GROQ_API_KEY`
- [ ] Load Apple fonts via `figma.loadFontAsync`
- [ ] Handle malformed prompts gracefully
- [ ] Compile `code.ts` → `code.js`
- [ ] Test plugin in Figma desktop
- [ ] Deploy iframe via Vercel
- [ ] Push all code to GitHub repo

---

## 🧠 Cursor Prompt Tips

- Interpret user prompt into direct Figma Plugin API calls
- Modify current selection or entire canvas
- Respond only with code — no extra explanation
- If prompt is vague, ask for clarification in iframe UI

---

## 🔧 Important Implementation Learnings

After debugging and development, here are critical learnings about Figma plugin architecture:

1. **Keep It Simple**
   - Maintain three separate files: manifest.json, code.js, ui.html
   - Don't try to bundle HTML into plugin code
   - Let Figma handle HTML injection via `__html__` global

2. **Build Configuration**
   - Use minimal Vite config focused only on plugin code
   - Don't overcomplicate with modern web bundling patterns
   - Keep ui.html in root directory for Figma to access directly

3. **Common Pitfalls to Avoid**
   - Don't fight against Figma's `__html__` global variable
   - Avoid over-engineering the plugin architecture
   - Don't try to use complex bundling for the UI

4. **Development Workflow**
   - Always test in Figma desktop after changes
   - Use `manifest.json` with local `ui.html` during development
   - Push changes to GitHub to maintain version control

5. **Best Practices**
   - Follow Figma's intended plugin architecture
   - Keep UI implementation simple and direct
   - Use TypeScript for plugin code but keep bundling minimal

# Figma AI Plugin

## Core Architecture

Figma plugins require a specific three-file architecture. It's critical to understand and follow this structure:

```
├── manifest.json    # Plugin configuration
├── ui.html         # UI code (must be in root directory)
└── build/
    └── code.js     # Compiled plugin code
```

### Key Principles

1. **File Separation**
   - Never bundle HTML with plugin code
   - Let Figma handle HTML injection via `__html__` global
   - Keep UI file in root directory
   - Build plugin code as IIFE format

2. **Communication**
   - UI and plugin code communicate via `postMessage`
   - Plugin code can't access DOM
   - UI code can't access Figma API directly

## Common Pitfalls

We learned these lessons the hard way. Avoid these common mistakes:

1. **Over-engineering**
   - Don't treat it like a regular web app
   - Avoid complex module systems
   - Don't fight against Figma's architecture

2. **HTML Handling**
   - Don't try to bundle HTML into plugin code
   - Don't try to work around `__html__` global
   - Keep UI file separate and let Figma handle it

3. **File Structure**
   - Don't put UI file in build directory
   - Don't try to use dynamic imports
   - Respect Figma's expected file locations

## Build Configuration

Keep the build configuration minimal. Here's our working Vite config:

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'plugin/code.ts'),
      formats: ['iife'],
      name: 'FigmaPlugin',
      fileName: () => 'code.js'
    },
    outDir: 'build',
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true
      }
    },
    target: 'es2015',
    minify: true,
  },
});
```

### Build Process
1. Only build the plugin code
2. Let Figma handle the UI file
3. No HTML injection or bundling tricks

## Development Workflow

1. **Setup**
   ```bash
   npm install    # Install dependencies
   npm run build  # Build plugin code
   ```

2. **Development**
   ```bash
   npm run watch  # Watch for changes
   ```

3. **Plugin Structure**
   - `plugin/code.ts` - Main plugin logic
   - `ui.html` - Plugin UI
   - `manifest.json` - Plugin configuration

## UI Implementation

The UI must be a standalone HTML file that:
1. Uses Figma's theme colors (`var(--figma-color-*)`)
2. Implements proper message passing
3. Handles errors appropriately

Example UI structure:
```html
<body>
    <div id="error"></div>
    <div id="content">
        <!-- UI elements -->
    </div>
    <script>
        // Message handling
        window.onmessage = (event) => {
            if (!/^https:\/\/([\w-]+\.)?figma.com$/.test(event.origin)) {
                return;
            }
            // Handle plugin messages
        };

        // Send messages to plugin
        parent.postMessage({ 
            pluginMessage: { 
                type: 'action',
                payload: data 
            }
        }, '*');
    </script>
</body>
```

## Plugin Code Implementation

Plugin code should:
1. Use Figma's `__html__` global
2. Handle messages properly
3. Implement proper error handling

Example structure:
```typescript
figma.showUI(__html__, { 
    width: 400, 
    height: 600,
    themeColors: true
});

figma.ui.onmessage = async (msg) => {
    try {
        // Handle messages from UI
    } catch (error) {
        console.error('Plugin error:', error);
        figma.notify('An error occurred', { error: true });
    }
};
```

## Best Practices

1. **Follow Figma's Patterns**
   - Use Figma's built-in systems
   - Don't try to replicate web app patterns
   - Keep it simple

2. **Error Handling**
   - Implement proper error boundaries
   - Use Figma's notification system
   - Log errors appropriately

3. **UI Design**
   - Use Figma's theme colors
   - Follow Figma's UI patterns
   - Keep UI responsive

## Resources

- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
- [Plugin Examples](https://www.figma.com/plugin-docs/plugin-examples/)
- [UI Styling Guide](https://www.figma.com/plugin-docs/css-variables/) 
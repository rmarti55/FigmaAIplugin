# 🧠 Figma Natural Language Plugin Instructions (Enhanced for Cursor)

This document provides strict implementation guidance for building a Figma plugin powered by Groq that lets users manipulate Figma files using natural language. It includes exact configuration, backend API integration, UI strategy, and development best practices optimized for Cursor.

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

**Reference Design:** [iOS 17 Shared Library](https://www.figma.com/community/file/1248375255495415511/ios-17-and-ipados-17)

---

## 📁 Folder Structure & Tech Stack

```
/plugin              → Figma plugin code (TypeScript)
/app/api/groq/       → Next.js edge function to talk to Groq
/public/fonts/       → Locally installed Apple fonts
README.md            → This file
.env                 → Contains GROQ_API_KEY
```

---

## ⚙️ Plugin Setup

- Use **Figma Plugin API** in `plugin/code.ts`
- React-based iframe hosted on **Vercel** (`https://figmaaiplugin.vercel.app`)
- Communicate via `figma.ui.postMessage()` + `figma.ui.onmessage`

```ts
// Strongly typed message format:
type MessageType = "applyStyle" | "align" | "rename";
interface PluginMessage {
  type: MessageType;
  payload: any;
}
```

---

## 📦 manifest.json

```json
{
  "main": "build/code.js",
  "ui": "https://figmaaiplugin.vercel.app",
  "editorType": ["figma"],
  "permissions": ["networkAccess"],
  "networkAccess": {
    "allowedDomains": ["api.groq.com"],
    "reasoning": "To send prompts to Groq LLM",
    "devAllowedDomains": ["http://localhost:3000"]
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
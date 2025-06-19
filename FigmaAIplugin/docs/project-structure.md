# 📁 Project Structure

This document provides an overview of the Figma AI Plugin project structure and explains the purpose of each directory and file.

## Root Directory

```
figma-ai-plugin/
├── README.md                 # Main project documentation
├── TODO.md                   # Project progress tracking
├── package.json              # Node.js dependencies and scripts
├── package-lock.json         # Dependency lock file
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── .env.local               # Environment variables (not committed)
├── .gitignore               # Git ignore patterns
└── .next/                   # Next.js build output (generated)
```

## Application Structure

### `/app` - Next.js App Router
```
app/
├── page.tsx                 # Main plugin UI component
├── layout.tsx               # Root layout component
├── globals.css              # Global styles and Tailwind imports
├── completion/
│   └── route.ts            # API route for OpenAI integration
└── api/                    # Additional API routes (if needed)
```

**Key Files:**
- `page.tsx` - The main React component that renders in the Figma plugin iframe
- `completion/route.ts` - Handles communication with OpenAI API and streaming responses
- `globals.css` - Contains Tailwind CSS imports and global styles

### `/plugin` - Figma Plugin Configuration
```
plugin/
├── manifest.json           # Plugin metadata and permissions
├── code.js                 # Plugin sandbox code (generated)
└── ui.html                 # Plugin UI HTML (generated)
```

**Key Files:**
- `manifest.json` - Defines plugin name, permissions, UI URL, and capabilities
- `code.js` - Auto-generated from build process, runs in Figma's sandbox

### `/lib` - Utility Libraries
```
lib/
├── figmaAPI.ts             # Helper functions for Figma API
├── openai.ts               # OpenAI client configuration
├── utils.ts                # General utility functions
└── types.ts                # TypeScript type definitions
```

**Key Files:**
- `figmaAPI.ts` - Provides the main `figmaAPI.run()` helper for plugin-UI communication
- `openai.ts` - OpenAI client setup and configuration

### `/components` - React Components
```
components/
├── ui/                     # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   └── loading.tsx
├── plugin/                 # Plugin-specific components
│   ├── PromptInput.tsx
│   ├── ResponseDisplay.tsx
│   └── NodeSelector.tsx
└── layouts/               # Layout components
    └── PluginLayout.tsx
```

### `/docs` - Documentation
```
docs/
├── setup-guide.md          # Initial setup instructions
├── development-guide.md    # Development workflow and customization
├── deployment-guide.md     # Production deployment guide
├── api-reference.md        # Figma API and helper functions reference
└── project-structure.md    # This file
```

### `/styles` - Styling
```
styles/
├── globals.css             # Global CSS styles
├── components.css          # Component-specific styles
└── plugin.css              # Plugin-specific styles
```

## Configuration Files

### `package.json`
Contains project metadata, dependencies, and npm scripts:

```json
{
  "name": "figma-ai-plugin",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "openai": "^4.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

### `manifest.json`
Figma plugin configuration:

```json
{
  "name": "AI Plugin",
  "id": "your-plugin-id",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "http://localhost:3000",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": ["figma"]
}
```

## Development Workflow

### Development Mode
1. **Start Next.js dev server**: `npm run dev`
2. **Load plugin in Figma**: Import `plugin/manifest.json`
3. **Develop and test**: Make changes and test in Figma

### Build Process
1. **Next.js build**: `npm run build` - Creates optimized production build
2. **Plugin code generation**: Automatically generates `plugin/code.js`
3. **Asset optimization**: Optimizes CSS, JS, and other assets

## File Dependencies

### Plugin UI Flow
```
Figma Plugin ↔ plugin/manifest.json
       ↓
   plugin/code.js ↔ app/page.tsx
       ↓
   lib/figmaAPI.ts ↔ app/completion/route.ts
       ↓
   OpenAI API
```

### Component Hierarchy
```
app/layout.tsx
└── app/page.tsx
    ├── components/plugin/PromptInput.tsx
    ├── components/plugin/ResponseDisplay.tsx
    └── components/plugin/NodeSelector.tsx
```

## Environment Variables

### `.env.local` (Development)
```env
OPENAI_API_KEY=sk-xxxxxx
NODE_ENV=development
```

### Production Environment
Set in Vercel or your deployment platform:
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV=production` - Automatically set

## Build Outputs

### Development
- `.next/` - Next.js development build
- No plugin files generated

### Production
- `.next/` - Optimized production build
- `plugin/code.js` - Generated plugin sandbox code
- `plugin/ui.html` - Generated plugin UI HTML

## Best Practices

### File Organization
- Keep plugin-specific logic in `/lib/figmaAPI.ts`
- Store reusable components in `/components/ui/`
- Put plugin-specific components in `/components/plugin/`
- Maintain clear separation between UI and API logic

### Naming Conventions
- Use PascalCase for React components: `PromptInput.tsx`
- Use camelCase for utilities: `figmaAPI.ts`
- Use kebab-case for documentation: `setup-guide.md`
- Use descriptive names that indicate purpose

### Import Patterns
```typescript
// Absolute imports using Next.js path mapping
import { figmaAPI } from '@/lib/figmaAPI';
import { Button } from '@/components/ui/button';

// Relative imports for local files
import './styles.css';
```

## Adding New Features

### New API Route
1. Create file in `app/api/[feature]/route.ts`
2. Export HTTP method handlers (GET, POST, etc.)
3. Add error handling and validation

### New Component
1. Create component in appropriate `/components/` subdirectory
2. Add TypeScript types
3. Include in main UI via `app/page.tsx`

### New Figma API Function
1. Add function to `lib/figmaAPI.ts`
2. Use `figmaAPI.run()` pattern
3. Ensure JSON-serializable parameters and returns

This structure provides a scalable foundation for building complex Figma plugins while maintaining clear separation of concerns. 
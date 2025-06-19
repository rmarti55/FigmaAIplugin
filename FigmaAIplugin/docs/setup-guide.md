# 🔧 iOS Shape Generator - Setup Guide

This guide walks you through setting up the iOS Shape Generator plugin for Figma - a conversational AI tool that creates iOS UI components using natural language.

## Prerequisites

- Node.js 18+ and npm
- Figma Desktop application (required for plugin development)
- OpenAI API key (optional - mock AI included for cost-free development)

## Step-by-Step Setup

### 1. Clone the Project

Use the Figma AI plugin template as your starting point:

```bash
npx create-next-app@latest --example https://github.com/figma/ai-plugin-template/ ios-shape-generator
cd ios-shape-generator
```

### 2. Install Dependencies

Install all required packages:

```bash
npm install
```

This installs:
- Next.js (React framework)
- Tailwind CSS (styling)
- figmaAPI helpers
- OpenAI integration
- TypeScript support

### 3. Configure Environment Variables

Create a `.env.local` file at the root of the project:

```bash
touch .env.local
```

Add your configuration:

```env
# OpenAI API Key (get from https://platform.openai.com/account/api-keys)
OPENAI_API_KEY=sk-your-api-key-here

# Use mock AI for cost-free development (set to false for production)
USE_MOCK_AI=true
```

⚠️ **Important**: 
- Never commit your API key to version control
- The `.env.local` file is automatically ignored by git
- `USE_MOCK_AI=true` enables cost-free development with pre-written responses

### 4. Start Development Server

Run the development server:

```bash
npm run dev
```

You should see:
```
[plugin] [watch] build finished, watching for changes...
[next] - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

The plugin UI will be available at `http://localhost:3000`.

### 5. Load Plugin in Figma Desktop

1. **Open Figma Desktop** (not the web version)
2. **Right-click on any canvas**
3. Navigate to **Plugins > Development > Import Plugin from Manifest...**
4. **Browse to your project directory** and select `plugin/manifest.json`
5. **Click "Import"** - the plugin will appear in your plugins list

![Plugin Import Process](https://static.figma.com/uploads/dcfb742580ad1c70338f1f9670f70dfd1fd42596)

### 6. Test the iOS Shape Generator

1. **In Figma, run your newly imported plugin**
2. **The plugin UI should load** (showing your localhost:3000 content)
3. **Try these test prompts:**
   - "blue button login"
   - "input field email"
   - "white card with shadow"
   - "green toggle switch"
4. **Components should appear on your canvas** with proper iOS styling

## iOS-Specific Features

### Built-in iOS Design System

The plugin includes:
- **iOS 18 System Colors**: systemBlue, systemGreen, systemRed, etc.
- **Authentic Dimensions**: iOS button (200×44), toggle (49×31), etc.
- **Proper Styling**: Corner radius, shadows, strokes matching iOS patterns
- **SF Pro Text**: iOS system font (falls back to Inter if unavailable)

### Natural Language Processing

The plugin understands:
- **Component types**: "button", "card", "input", "toggle"
- **Colors**: "blue", "green", "red", "orange", "purple"
- **Modifiers**: "with shadow", "rounded", "large"
- **Context**: "login button", "email field", "delete button"

## Troubleshooting

### Common Issues

**Plugin not loading in Figma:**
```
✓ Ensure development server is running (npm run dev)
✓ Check that localhost:3000 is accessible
✓ Verify manifest.json exists in plugin/ directory
✓ Try refreshing the plugin or reimporting the manifest
```

**No components appearing on canvas:**
```
✓ Check browser console for JavaScript errors
✓ Ensure Figma Desktop (not web) is being used
✓ Verify the plugin has proper permissions
✓ Try clicking in the canvas to set focus
```

**OpenAI API errors:**
```
✓ Verify API key is correctly set in .env.local
✓ Check OpenAI account has sufficient credits
✓ Ensure no extra spaces in the API key
✓ Try setting USE_MOCK_AI=true to bypass API calls
```

**Development server issues:**
```
✓ Try: npm install --force
✓ Clear npm cache: npm cache clean --force
✓ Check if port 3000 is already in use
✓ Try: rm -rf node_modules && npm install
```

### Advanced Troubleshooting

**Plugin code not updating:**
```bash
# Force rebuild the plugin
npm run build:plugin

# Or restart dev server
npm run dev
```

**Environment variables not loading:**
```bash
# Check .env.local exists and has correct format
cat .env.local

# Restart dev server after changes
npm run dev
```

**Figma API permissions:**
```javascript
// Check plugin permissions in manifest.json
{
  "name": "iOS Shape Generator",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["localhost:3000"]
  }
}
```

## Development Tips

### Cost-Free Development
- Keep `USE_MOCK_AI=true` during development
- Mock responses are pre-written for iOS components
- Switch to real OpenAI only for production testing

### Rapid Iteration
- UI changes auto-reload in Figma
- Plugin code rebuilds automatically
- Use browser dev tools for debugging

### Testing Different Components
Try these prompts to test the system:
```
"blue button with login text"
"input field for email address"
"white card with subtle shadow"
"green toggle switch"
"red delete button"
"orange warning button"
"purple accent button"
```

## Next Steps

Once setup is complete, check out:
- [📱 Development Guide](development-guide.md) - Customize and extend the plugin
- [🎨 Component Examples](../README.md#how-to-use) - See all available iOS components
- [📚 API Reference](api-reference.md) - Learn the figmaAPI helper functions

## Production Deployment

For production deployment:
1. Set `USE_MOCK_AI=false` in Vercel environment
2. Add real OpenAI API key
3. Update manifest.json with production URL
4. See [Deployment Guide](deployment-guide.md) for full instructions

---

**Ready to start building iOS interfaces with conversation? Your plugin is now ready! 🎨** 
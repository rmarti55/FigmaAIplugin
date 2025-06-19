# 📱 iOS Shape Generator - Figma Plugin

A conversational AI plugin for Figma that generates iOS UI components using natural language. Start simple with basic shapes, then refine through conversation - perfect for rapid iOS prototyping and design system work.

![iOS Shape Generator Demo](https://static.figma.com/uploads/cd663ea9256a71040227bc4af94c614febc8fc56)

## ✨ Features

- 🗣️ **Conversational Interface**: "blue button", "input field", "card with shadow"
- 📱 **iOS Design System**: Authentic iOS 18 colors, spacing, and styling
- 🎯 **Smart Positioning**: Components appear near your selection or viewport center
- ⚡ **Instant Preview**: Real-time generation with visual feedback
- 💰 **Cost-Effective**: Mock AI responses for development (no OpenAI costs)
- 🔄 **Iterative Refinement**: "make it bigger", "change to green", "add shadow"

## 🚀 Quick Start

### 1. Clone & Install

```bash
npx create-next-app@latest --example https://github.com/figma/ai-plugin-template/ ios-shape-generator
cd ios-shape-generator
npm install
```

### 2. Environment Setup

Create `.env.local` file:
```bash
OPENAI_API_KEY=your-api-key-here
USE_MOCK_AI=true  # Cost-free development
```

### 3. Start Development

```bash
npm run dev
```

### 4. Load in Figma

1. Open Figma Desktop
2. Right-click canvas → **Plugins > Development > Import plugin from manifest...**
3. Select `plugin/manifest.json` from your project
4. Run the plugin and start creating!

## 💬 How to Use

### Basic Components
- **"blue button login"** → Creates styled iOS button with text
- **"input field email"** → Creates text input with proper styling  
- **"white card with shadow"** → Creates elevated card component
- **"green toggle switch"** → Creates iOS-style toggle
- **"red delete button"** → Creates destructive action button

### Conversational Refinement
After creating a component, refine it:
- "make it bigger"
- "change color to green" 
- "add more shadow"
- "move it to the right"

## 🎨 iOS Design System

Built-in support for iOS 18 design patterns:

### Colors
- System Blue, Green, Red, Orange, Purple, Pink, Teal, Yellow
- Label colors and background variations
- Semantic color usage (destructive actions = red)

### Components
- **Buttons**: 8px corner radius, proper padding, SF Pro Text
- **Input Fields**: 8px corners, subtle borders, proper focus states
- **Cards**: 12px corners, drop shadows, proper elevation
- **Toggles**: 31×49 authentic dimensions, smooth transitions

### Typography
- SF Pro Text family (iOS system font)
- Proper font weights and sizes
- Accessible text hierarchy

## 🏗️ Architecture

```
├── app/
│   ├── page.tsx              # Main UI component
│   ├── api/completion/       # AI integration endpoint
│   └── globals.css           # Tailwind styles
├── plugin/
│   ├── code.ts              # Figma plugin sandbox code
│   ├── manifest.json        # Plugin configuration
│   └── dist/                # Built plugin files
├── lib/
│   ├── figmaAPI.ts          # Figma API helper utilities  
│   ├── getTextForSelection.ts  # Selection utilities
│   └── types.ts             # TypeScript definitions
└── docs/                    # Comprehensive documentation
```

## 🔧 Customization

### Adding New Component Types

Edit `app/page.tsx` to add new iOS components:

```typescript
// Add to the generateShape function
if (lowerPrompt.includes('navbar')) {
  shapeType = 'navbar';
  size = { width: 375, height: 88 };
  color = iosColors.systemBackground;
}
```

### Custom iOS Colors

Extend the `iosColors` object with your brand colors:

```typescript
const iosColors = {
  // System colors...
  brandPrimary: { r: 0.2, g: 0.4, b: 0.8 },
  brandSecondary: { r: 0.9, g: 0.1, b: 0.3 }
};
```

### AI Integration

Toggle between mock and real AI responses:

```bash
# Development (free)
USE_MOCK_AI=true

# Production (uses OpenAI)  
USE_MOCK_AI=false
OPENAI_API_KEY=sk-your-real-key
```

## 📚 Documentation

- [📖 Setup Guide](docs/setup-guide.md) - Detailed installation instructions
- [🎨 Development Guide](docs/development-guide.md) - Customization and extension
- [📚 API Reference](docs/api-reference.md) - figmaAPI helper documentation  
- [🚀 Deployment Guide](docs/deployment-guide.md) - Production deployment
- [📋 Project Structure](docs/project-structure.md) - Codebase organization

## 🎯 Design Philosophy

**Start Simple, Refine Through Conversation**
1. **Basic Shapes First**: Buttons, inputs, cards - the building blocks
2. **iOS Design Language**: Authentic Apple HIG compliance
3. **Conversational UX**: Natural language → visual components
4. **Iterative Refinement**: Continuous improvement through chat
5. **Cost-Effective Development**: Mock AI for rapid prototyping

## 🌟 Use Cases

- **iOS App Prototyping**: Rapid wireframe and mockup creation
- **Design System Work**: Consistent component generation
- **Client Presentations**: Quick concept visualization  
- **Developer Handoffs**: Properly structured Figma components
- **Design Education**: Learning iOS design patterns

## 🚀 Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables:
   ```bash
   OPENAI_API_KEY=sk-your-production-key
   USE_MOCK_AI=false
   ```
4. Update `package.json` config:
   ```json
   "config": {
     "siteURL": "https://your-app.vercel.app/"
   }
   ```
5. Build and test: `npm run build`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

## 🙏 Acknowledgments

- Built on [Figma's AI Plugin Template](https://github.com/figma/ai-plugin-template)
- iOS design patterns from [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- Inspired by the iOS 18 Design System community file

---

**Ready to build beautiful iOS interfaces with conversation? Clone, install, and start creating! 🎨**

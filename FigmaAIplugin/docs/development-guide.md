# 🎨 iOS Shape Generator - Development Guide

This guide covers how to customize, extend, and develop iOS UI components for your conversational Figma plugin.

## Project Architecture

### Key Files and Their iOS-Specific Purposes

#### **UI Components**
- **`app/page.tsx`** - Main iOS component generator interface
- **`app/globals.css`** - Tailwind CSS with iOS-inspired styling
- **`components/`** - Reusable React components (if you add them)

#### **iOS Component Logic**
- **`app/api/completion/route.ts`** - AI integration for iOS design assistance
- **`lib/figmaAPI.ts`** - Helper utilities for creating iOS components in Figma
- **`lib/types.ts`** - TypeScript definitions for iOS component types

#### **Plugin Configuration**
- **`plugin/manifest.json`** - Figma plugin metadata and permissions
- **`plugin/code.ts`** - Plugin sandbox code that creates iOS components
- **`plugin/dist/code.js`** - Compiled plugin (auto-generated)

## iOS Design System Implementation

### Core iOS Colors

The plugin includes authentic iOS 18 system colors:

```typescript
const iosColors = {
  // Primary System Colors
  systemBlue: { r: 0, g: 0.478, b: 1 },
  systemGreen: { r: 0.204, g: 0.780, b: 0.349 },
  systemRed: { r: 1, g: 0.231, b: 0.188 },
  systemOrange: { r: 1, g: 0.584, b: 0 },
  systemPurple: { r: 0.686, g: 0.322, b: 0.871 },
  
  // UI Element Colors
  systemBackground: { r: 1, g: 1, b: 1 },
  secondarySystemBackground: { r: 0.949, g: 0.949, b: 0.969 },
  label: { r: 0, g: 0, b: 0 },
  secondaryLabel: { r: 0.235, g: 0.235, b: 0.263 }
};
```

### iOS Component Specifications

#### **iOS Buttons**
```typescript
// Standard iOS button dimensions and styling
{
  width: 200,
  height: 44,
  cornerRadius: 8,
  fillColor: iosColors.systemBlue,
  textColor: { r: 1, g: 1, b: 1 },
  font: { family: "SF Pro Text", style: "Medium" },
  fontSize: 17
}
```

#### **iOS Input Fields**
```typescript
// iOS text field styling
{
  width: 280,
  height: 36,
  cornerRadius: 8,
  fillColor: iosColors.secondarySystemBackground,
  strokeColor: iosColors.systemGray,
  strokeWeight: 1
}
```

#### **iOS Cards**
```typescript
// iOS card component with elevation
{
  width: 300,
  height: 200,
  cornerRadius: 12,
  fillColor: iosColors.systemBackground,
  shadow: {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 2 },
    radius: 8
  }
}
```

## Customizing the Conversational Interface

### Basic UI Structure

Edit `app/page.tsx` to customize the iOS generator interface:

```tsx
export default function iOSShapeGenerator() {
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold mb-2">iOS Shape Generator</h1>
        <p className="text-sm text-gray-300">
          Generate iOS components with natural language
        </p>
      </div>
      
      {/* Your iOS-specific UI components here */}
    </div>
  );
}
```

### Adding New iOS Component Types

Extend the `generateShape` function to support new iOS components:

```typescript
const generateShape = async (prompt: string) => {
  await figmaAPI.run(async (figma, { prompt, iosColors }) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Add new component types
    if (lowerPrompt.includes('navbar')) {
      // iOS Navigation Bar
      shapeType = 'navbar';
      size = { width: 375, height: 88 };
      color = iosColors.systemBackground;
      
    } else if (lowerPrompt.includes('tabbar')) {
      // iOS Tab Bar
      shapeType = 'tabbar';
      size = { width: 375, height: 83 };
      color = iosColors.systemBackground;
      
    } else if (lowerPrompt.includes('alert')) {
      // iOS Alert Dialog
      shapeType = 'alert';
      size = { width: 270, height: 120 };
      color = iosColors.systemBackground;
    }
    
    // Create the component with iOS styling
    const component = createIOSComponent(shapeType, size, color);
    
  }, { prompt, iosColors });
};
```

### Natural Language Processing Enhancement

Improve the prompt parsing for more nuanced iOS components:

```typescript
// Enhanced iOS component detection
const parseIOSComponent = (prompt: string) => {
  const lower = prompt.toLowerCase();
  
  // Component type detection
  let componentType = 'button'; // default
  if (lower.includes('navigation') || lower.includes('navbar')) componentType = 'navbar';
  if (lower.includes('tab bar') || lower.includes('tabbar')) componentType = 'tabbar';
  if (lower.includes('table') || lower.includes('list')) componentType = 'table';
  if (lower.includes('modal') || lower.includes('sheet')) componentType = 'modal';
  
  // Style modifiers
  const hasRoundedCorners = lower.includes('rounded');
  const hasShadow = lower.includes('shadow');
  const isLarge = lower.includes('large') || lower.includes('big');
  
  // Color extraction
  let color = iosColors.systemBlue;
  if (lower.includes('green')) color = iosColors.systemGreen;
  if (lower.includes('red')) color = iosColors.systemRed;
  // ... etc
  
  return { componentType, color, hasRoundedCorners, hasShadow, isLarge };
};
```

## Advanced iOS Component Creation

### Creating Complex iOS Components

#### iOS Navigation Bar with Title

```typescript
const createIOSNavigationBar = await figmaAPI.run(
  async (figma, { title, backgroundColor }) => {
    // Create navigation bar frame
    const navbar = figma.createFrame();
    navbar.name = "iOS Navigation Bar";
    navbar.resize(375, 88);
    navbar.fills = [{ type: 'SOLID', color: backgroundColor }];
    
    // Add title text
    const titleText = figma.createText();
    await figma.loadFontAsync({ family: "SF Pro Display", style: "Bold" });
    titleText.fontName = { family: "SF Pro Display", style: "Bold" };
    titleText.fontSize = 17;
    titleText.characters = title;
    titleText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    
    // Center title in navbar
    titleText.x = (navbar.width - titleText.width) / 2;
    titleText.y = navbar.height - 44 + (44 - titleText.height) / 2;
    
    navbar.appendChild(titleText);
    figma.currentPage.appendChild(navbar);
    
    return navbar.id;
  },
  { title: "Screen Title", backgroundColor: iosColors.systemBackground }
);
```

#### iOS Table View Cell

```typescript
const createIOSTableCell = await figmaAPI.run(
  async (figma, { title, subtitle, hasDisclosure }) => {
    const cell = figma.createFrame();
    cell.name = "iOS Table Cell";
    cell.resize(375, 44);
    cell.fills = [{ type: 'SOLID', color: iosColors.systemBackground }];
    
    // Add divider line
    const divider = figma.createRectangle();
    divider.resize(cell.width - 32, 0.5);
    divider.x = 16;
    divider.y = cell.height - 0.5;
    divider.fills = [{ type: 'SOLID', color: iosColors.systemGray }];
    
    // Add main title
    const titleText = figma.createText();
    await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
    titleText.fontName = { family: "SF Pro Text", style: "Regular" };
    titleText.fontSize = 17;
    titleText.characters = title;
    titleText.x = 16;
    titleText.y = subtitle ? 8 : (cell.height - titleText.height) / 2;
    
    cell.appendChild(divider);
    cell.appendChild(titleText);
    
    // Add subtitle if provided
    if (subtitle) {
      const subtitleText = figma.createText();
      subtitleText.fontName = { family: "SF Pro Text", style: "Regular" };
      subtitleText.fontSize = 13;
      subtitleText.characters = subtitle;
      subtitleText.fills = [{ type: 'SOLID', color: iosColors.secondaryLabel }];
      subtitleText.x = 16;
      subtitleText.y = 26;
      cell.appendChild(subtitleText);
    }
    
    // Add disclosure indicator
    if (hasDisclosure) {
      const disclosure = figma.createRectangle();
      disclosure.resize(8, 13);
      disclosure.x = cell.width - 24;
      disclosure.y = (cell.height - 13) / 2;
      disclosure.fills = [{ type: 'SOLID', color: iosColors.systemGray }];
      cell.appendChild(disclosure);
    }
    
    figma.currentPage.appendChild(cell);
    return cell.id;
  },
  { title: "Cell Title", subtitle: "Optional subtitle", hasDisclosure: true }
);
```

## Conversational Refinement System

### Implementing Component Modifications

Add support for conversational refinement commands:

```typescript
const refineComponent = async (nodeId: string, refinement: string) => {
  await figmaAPI.run(async (figma, { nodeId, refinement }) => {
    const node = figma.getNodeById(nodeId);
    if (!node) return;
    
    const lower = refinement.toLowerCase();
    
    // Size modifications
    if (lower.includes('bigger') || lower.includes('larger')) {
      node.resize(node.width * 1.2, node.height * 1.2);
    } else if (lower.includes('smaller')) {
      node.resize(node.width * 0.8, node.height * 0.8);
    }
    
    // Color modifications
    if (lower.includes('green')) {
      node.fills = [{ type: 'SOLID', color: iosColors.systemGreen }];
    } else if (lower.includes('red')) {
      node.fills = [{ type: 'SOLID', color: iosColors.systemRed }];
    }
    
    // Style modifications
    if (lower.includes('more rounded')) {
      node.cornerRadius = Math.min(node.cornerRadius * 1.5, node.height / 2);
    } else if (lower.includes('add shadow')) {
      node.effects = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.15 },
        offset: { x: 0, y: 2 },
        radius: 8,
        visible: true,
        blendMode: 'NORMAL'
      }];
    }
    
    figma.viewport.scrollAndZoomIntoView([node]);
    
  }, { nodeId, refinement });
};
```

## Styling and Theming

### Custom iOS Brand Colors

Extend the iOS color system with your brand colors:

```typescript
const customIOSColors = {
  ...iosColors,
  
  // Your brand colors in iOS style
  brandPrimary: { r: 0.2, g: 0.4, b: 0.8 },
  brandSecondary: { r: 0.9, g: 0.1, b: 0.3 },
  brandAccent: { r: 1, g: 0.7, b: 0 },
  
  // Dark mode variants
  darkSystemBackground: { r: 0, g: 0, b: 0 },
  darkSecondaryBackground: { r: 0.11, g: 0.11, b: 0.118 }
};
```

### Tailwind Configuration

Customize the UI styling in `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // iOS-inspired color palette
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-purple': '#AF52DE',
        'ios-gray': '#8E8E93',
      },
      borderRadius: {
        'ios': '8px',
        'ios-card': '12px',
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
```

## AI Integration Customization

### Customizing AI Responses

Edit `app/api/completion/route.ts` for iOS-specific AI assistance:

```typescript
const systemMessage = {
  role: "system",
  content: `You are an iOS design assistant specializing in Apple's Human Interface Guidelines. 
  
  When users request iOS components, provide brief, encouraging responses about:
  - Authentic iOS design patterns
  - Proper use of system colors and typography
  - Accessibility considerations
  - iOS-specific sizing and spacing
  
  Keep responses concise (1-2 sentences) and focused on design quality.`,
} as const;

// Mock responses for iOS components
const mockIOSResponses = [
  "Perfect! Creating an iOS button with system blue and proper corner radius following Apple's design guidelines.",
  "Great choice! This input field uses the standard iOS styling with proper focus states and accessibility support.",
  "Excellent! Your card component follows iOS elevation patterns with subtle shadows and rounded corners.",
  "Nice! This toggle switch matches iOS dimensions and provides smooth interaction feedback.",
  "Wonderful! Creating an authentic iOS navigation bar with proper title positioning and background."
];
```

## Testing and Debugging

### Component Testing Strategy

Test your iOS components with these prompts:

```typescript
const testPrompts = [
  // Basic components
  "blue button login",
  "input field email", 
  "white card with shadow",
  "green toggle switch",
  
  // Complex components
  "navigation bar with title Settings",
  "table cell with subtitle and disclosure",
  "alert dialog with two buttons",
  "tab bar with 5 tabs",
  
  // Refinement commands
  "make it bigger",
  "change color to red",
  "add more shadow",
  "make corners more rounded"
];
```

### Debugging Tips

1. **Use browser dev tools** in the plugin iframe
2. **Check Figma plugin console** for errors
3. **Test with mock AI** before using real OpenAI
4. **Verify iOS dimensions** match Apple specifications
5. **Test on different canvas sizes** and zoom levels

## Performance Optimization

### Efficient Component Creation

```typescript
// Batch operations for better performance
const createMultipleComponents = async (components) => {
  await figmaAPI.run(async (figma, { components }) => {
    const createdNodes = [];
    
    for (const comp of components) {
      const node = createIOSComponent(comp.type, comp.props);
      createdNodes.push(node);
    }
    
    // Group related components
    if (createdNodes.length > 1) {
      const group = figma.group(createdNodes, figma.currentPage);
      group.name = "iOS Component Group";
    }
    
    return createdNodes.map(n => n.id);
  }, { components });
};
```

## Next Steps

- **Extend component library** with more iOS patterns
- **Add design system integration** with Figma variables
- **Implement complex layouts** (forms, screens)
- **Add animations and interactions** for prototyping
- **Create component variations** (sizes, states)

See the [API Reference](api-reference.md) for detailed `figmaAPI` documentation and [Deployment Guide](deployment-guide.md) for production setup.

---

**Ready to build advanced iOS components? Start customizing and extending your generator! 🎨** 
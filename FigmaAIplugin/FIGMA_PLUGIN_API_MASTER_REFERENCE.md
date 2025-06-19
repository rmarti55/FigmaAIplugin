# Figma Plugin API - Master Reference Documentation

*Comprehensive reference guide compiled from official Figma Plugin API documentation*  
*Source: https://www.figma.com/plugin-docs/*

## Table of Contents

1. [Overview & Introduction](#overview--introduction)
2. [Plugin Architecture](#plugin-architecture)
3. [Manifest Configuration](#manifest-configuration)
4. [Global Objects & API Access](#global-objects--api-access)
5. [Node Types & Properties](#node-types--properties)
6. [UI Development](#ui-development)
7. [Development Setup](#development-setup)
8. [Security & Best Practices](#security--best-practices)
9. [Plugin Management](#plugin-management)
10. [Common Patterns & Examples](#common-patterns--examples)

---

## Overview & Introduction

### What are Figma Plugins?

Plugins are programs created by the Community that extend Figma's functionality. They:
- Run in files and perform one or more actions
- Are built using **JavaScript** and **HTML**
- Use the Plugin API to interact with Figma's editors
- Can leverage external web APIs available in modern browsers
- Enable integration with existing systems and rapid deployment of new services

### Key Capabilities

**Plugin API Access:**
- **Read and write** access to Figma's editors
- View, create, and modify file contents
- Access layers (nodes) and their properties
- Modify color, position, hierarchy, text, etc.

**Limitations:**
- Cannot access styles/components from team libraries (unless imported)
- Cannot access external fonts/web fonts via URL
- Cannot access file metadata (team, location, permissions, comments, version history)
- One plugin per user at a time, no background execution

### Document Structure

Every Figma file consists of:
- **DocumentNode**: Root of every file
- **PageNodes**: Children of DocumentNode (pages in design files)
- **Node Tree**: Each subtree represents a layer/object on canvas
- **Node Types**: Specific classes for different layer types (frames, components, vectors, rectangles)

---

## Plugin Architecture

### How Plugins Work

1. **Request/Response Pattern**: Client sends request → API processes → Returns response
2. **Asynchronous Operations**: Critical operations like loading pages, fonts, images are async
3. **Browser-Based**: Runs in `<iframe>`, access to browser APIs
4. **Dynamic Loading**: Pages loaded as needed, not all at once

### Plugin Types

**By Execution:**
- **Immediate**: Run immediately when invoked
- **Interactive**: Require user input via custom UI
- **Parameter-based**: Accept input via quick actions menu

**By Editor Type:**
- **Figma Design Mode**: Standard design interface
- **Dev Mode**: Different behavior and limitations
- **FigJam**: Whiteboard/collaboration interface

---

## Manifest Configuration

### Required Fields

```json
{
  "name": "Plugin Name",
  "id": "unique-plugin-id",
  "api": "1.0.0",
  "main": "code.js",
  "editorType": ["figma", "figjam", "dev"]
}
```

### Complete Manifest Schema

```json
{
  "name": "string",
  "id": "string", 
  "api": "string",
  "main": "string",
  "ui": "string | { [key: string]: string }",
  "documentAccess": "dynamic-page",
  "networkAccess": {
    "allowedDomains": ["array of domains"],
    "reasoning": "string",
    "devAllowedDomains": ["array of dev domains"]
  },
  "parameters": [
    {
      "name": "string",
      "key": "string", 
      "description": "string",
      "allowFreeform": "boolean",
      "optional": "boolean"
    }
  ],
  "parameterOnly": "boolean",
  "menu": [
    {
      "name": "string",
      "command": "string",
      "parameters": "ParameterList[]",
      "parameterOnly": "boolean"
    }
  ],
  "relaunchButtons": [
    {
      "command": "string",
      "name": "string", 
      "multipleSelection": "boolean"
    }
  ],
  "permissions": ["currentuser", "activeusers", "fileusers", "payments", "teamlibrary"],
  "capabilities": ["textreview", "codegen", "inspect", "vscode"],
  "codegenLanguages": [
    {
      "label": "string",
      "value": "string"
    }
  ]
}
```

### Network Access Configuration

**Block All Network Access:**
```json
"networkAccess": {
  "allowedDomains": ["none"]
}
```

**Allow Specific Domains:**
```json
"networkAccess": {
  "allowedDomains": [
    "figma.com",
    "*.google.com", 
    "https://my-app.cdn.com",
    "wss://socket.io",
    "example.com/api/",
    "http://localhost:3000"
  ],
  "reasoning": "Plugin needs to access external APIs for data"
}
```

---

## Global Objects & API Access

### Main Global Object: `figma`

```javascript
// Access the main API through figma global object
figma.createRectangle()
figma.closePlugin()
figma.showUI(__html__)
```

### Available Sub-Objects

- `figma.ui` - Custom interface creation
- `figma.codegen` - Code generation in Dev Mode  
- `figma.timer` - Timer control in FigJam files
- `figma.viewport` - Viewport control
- `figma.clientStorage` - Local data storage
- `figma.parameters` - Parameter handling
- `figma.variables` - Variable interaction
- `figma.teamLibrary` - Team library assets
- `figma.textreview` - Text review features

### Global Variables

- `__html__` - Access to UI file contents (if single file)
- `__uiFiles__` - Access to multiple UI files (if map provided)
- `fetch()` - Network request capabilities

---

## Node Types & Properties

### Core Node Creation Methods

```javascript
// Shape creation
figma.createRectangle()     // Creates rectangle
figma.createLine()          // Creates line
figma.createEllipse()       // Creates ellipse
figma.createPolygon()       // Creates polygon
figma.createStar()          // Creates star
figma.createVector()        // Creates vector

// Content creation
figma.createText()          // Creates text
figma.createFrame()         // Creates frame
figma.createComponent()     // Creates component
figma.createPage()          // Creates page

// Advanced creation
figma.createBooleanOperation()  // Boolean operations
figma.createTable()            // Creates table
figma.createNodeFromJSXAsync() // JSX-based creation
```

### Node Properties & Manipulation

```javascript
// Basic rectangle example
const rect = figma.createRectangle()

// Position and size
rect.x = 50
rect.y = 50
rect.resize(200, 100)

// Styling
rect.fills = [{ 
  type: 'SOLID', 
  color: { r: 1, g: 0, b: 0 } 
}]

// Hierarchy
figma.currentPage.appendChild(rect)
figma.currentPage.selection = [rect]
figma.viewport.scrollAndZoomIntoView([rect])
```

### Node Selection & Traversal

```javascript
// Current selection
const selection = figma.currentPage.selection

// Find nodes
const allRectangles = figma.currentPage.findAll(node => 
  node.type === 'RECTANGLE'
)

// Find specific node
const specificNode = figma.currentPage.findOne(node => 
  node.name === 'My Rectangle'
)

// Find instances of a component
const instances = page.findAll(node => {
  return node.type === 'INSTANCE' && 
         node.mainComponent && 
         node.mainComponent.id === componentId;
});
```

---

## UI Development

### Basic UI Setup

```javascript
// Show UI with HTML
figma.showUI(__html__)

// Show UI with options
figma.showUI(__html__, {
  width: 400,
  height: 300,
  title: "My Plugin",
  visible: true,
  themeColors: true,
  position: { x: 100, y: 100 }
})
```

### UI Communication

**Plugin to UI:**
```javascript
// Send message to UI
figma.ui.postMessage({
  type: 'selection-changed',
  data: figma.currentPage.selection
})
```

**UI to Plugin:**
```javascript
// In UI HTML/JS
parent.postMessage({ 
  pluginMessage: { 
    type: 'create-rectangle',
    width: 100,
    height: 100
  } 
}, '*')
```

**Plugin Message Handling:**
```javascript
figma.ui.onmessage = msg => {
  if (msg.type === 'create-rectangle') {
    const rect = figma.createRectangle()
    rect.resize(msg.width, msg.height)
    figma.currentPage.appendChild(rect)
  }
}
```

### UI Lifecycle

```javascript
// Show/hide UI
figma.ui.show()
figma.ui.hide()

// Resize UI
figma.ui.resize(width, height)

// Close plugin
figma.closePlugin()
figma.closePlugin('Success message')
```

---

## Development Setup

### Prerequisites

1. **Figma Desktop App** (required for plugin development)
2. **Visual Studio Code** (recommended)
3. **Node.js and npm**
4. **TypeScript** (recommended for type safety)

### Project Structure

```
my-plugin/
├── manifest.json      # Plugin configuration
├── code.ts           # Main plugin logic (TypeScript)
├── code.js           # Compiled JavaScript
├── ui.html           # Plugin UI
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── node_modules/     # Dependencies
```

### TypeScript Setup

**Install Dependencies:**
```bash
npm install typescript @figma/plugin-typings
```

**package.json devDependencies:**
```json
{
  "devDependencies": {
    "typescript": "^4.0.0",
    "@figma/plugin-typings": "^1.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "@figma/eslint-plugin-figma-plugins": "^0.3.0",
    "eslint": "^8.0.0"
  }
}
```

**TypeScript Compilation:**
```bash
# Watch mode (auto-compile on changes)
Ctrl+Shift+B → select "watch-tsconfig.json"
```

### Plugin Linting

**ESLint Configuration:**
```json
{
  "eslintConfig": {
    "extends": [
      "eslint:recommended",
      "@typescript-eslint/recommended", 
      "plugin:@figma/figma-plugins/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "project": "./tsconfig.json"
    },
    "root": true
  }
}
```

---

## Security & Best Practices

### Authentication Methods

1. **API Keys**: Unique identifiers for authentication
2. **OAuth**: Open standard for authorization
3. **JWT**: JSON Web Tokens for secure claim transmission

### Security Practices

**Network Access:**
- Explicitly define allowed domains
- Use `["none"]` to block all network access
- Provide reasoning for broad access patterns

**Input Validation:**
- Validate all user inputs
- Sanitize data to prevent injection attacks
- Use TypeScript for type safety

**Error Handling:**
```javascript
try {
  const result = await figma.loadFontAsync(fontName)
  // Use result
} catch (error) {
  figma.notify('Error loading font: ' + error.message)
}
```

### Plugin Design Principles

1. **Least Privilege**: Grant minimum necessary access
2. **Versioning**: Maintain API version compatibility
3. **Async Patterns**: Use async/await for better performance
4. **User Experience**: Provide clear feedback and error messages

---

## Plugin Management

### Development Workflow

1. **Create Plugin**: Plugins → Development → New Plugin
2. **Hot Reload**: Enable for faster development iteration
3. **Testing**: Test in Figma desktop app
4. **Publishing**: Submit for community review

### Version Management

- **No Re-approval**: Updates don't require re-review
- **Immediate Updates**: Changes apply to all users
- **Version History**: Track changes and updates
- **Rollback**: Republish earlier version if needed

### Analytics & Monitoring

- **No Built-in Analytics**: Use external services
- **Error Reporting**: Implement custom crash reporting
- **Weekly Notifications**: Figma sends engagement updates

---

## Common Patterns & Examples

### Component Instance Extraction

```javascript
// Find all instances of a component
async function extractInstances(componentId) {
  const allInstances = []
  
  for (const page of figma.root.children) {
    if (page.type === 'PAGE') {
      const pageInstances = page.findAll(node => {
        return node.type === 'INSTANCE' && 
               node.mainComponent && 
               node.mainComponent.id === componentId
      })
      
      pageInstances.forEach(instance => {
        allInstances.push({
          id: instance.id,
          name: instance.name,
          pageName: page.name,
          componentProperties: instance.componentProperties || {},
          position: { x: instance.x, y: instance.y }
        })
      })
    }
  }
  
  return allInstances
}
```

### Selection Monitoring

```javascript
// Monitor selection changes
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection
  
  if (selection.length === 1 && selection[0].type === 'COMPONENT') {
    figma.ui.postMessage({
      type: 'component-selected',
      component: {
        name: selection[0].name,
        id: selection[0].id
      }
    })
  }
})
```

### Font Loading (Async Pattern)

```javascript
async function createTextWithFont(text, fontName) {
  try {
    await figma.loadFontAsync(fontName)
    const textNode = figma.createText()
    textNode.characters = text
    textNode.fontName = fontName
    return textNode
  } catch (error) {
    figma.notify(`Error loading font: ${error.message}`)
    return null
  }
}
```

### Plugin Parameters

```javascript
// Access plugin parameters
const params = figma.parameters
if (params) {
  const iconName = params['icon-name']
  const size = params['size']
  const color = params['color']
  
  // Use parameters to customize plugin behavior
}
```

### Relaunch Buttons

```javascript
// Set relaunch data on nodes
selectedNodes.forEach(node => {
  node.setRelaunchData({
    edit: 'Edit this shape',
    duplicate: 'Duplicate with variations'
  })
})
```

---

## Key Syntax Compatibility Notes

### JavaScript Version Compatibility

Figma plugins run in a specific JavaScript environment. Avoid modern syntax that may not be supported:

**❌ Avoid:**
```javascript
// Optional chaining (not supported)
node.mainComponent?.id

// Nullish coalescing (not supported)  
const value = node.value ?? defaultValue
```

**✅ Use Instead:**
```javascript
// Traditional conditional checks
node.mainComponent && node.mainComponent.id

// Logical OR for defaults
const value = node.value || defaultValue
```

---

## Additional Resources

### Official Links
- **Plugin API Documentation**: https://www.figma.com/plugin-docs/
- **Community Forum**: https://forum.figma.com/
- **Discord Server**: Community-driven plugin development discussions
- **GitHub Samples**: Official code examples and templates

### Community Resources
- **Figma Plugin React Components**: Tom Lowry's component library
- **Plugin Development Videos**: Build Your First Plugin series
- **Community Plugins**: Inspiration and code examples

---

*This master reference document is compiled from the official Figma Plugin API documentation and represents the current state of the API as of 2024. Always refer to the official documentation for the most up-to-date information.* 
# 📚 API Reference

This document provides detailed reference information for the Figma API helpers and common patterns used in the plugin.

## `figmaAPI` Helper

### Overview

The `figmaAPI` helper provides a convenient way to execute code in the Figma plugin sandbox and return results to your UI.

```typescript
import { figmaAPI } from "@/lib/figmaAPI";

const result = await figmaAPI.run(
  (figma, params) => {
    // Your Figma API code here
    return someResult;
  },
  { /* parameters */ }
);
```

### Method Signature

```typescript
figmaAPI.run<T, P>(
  callback: (figma: PluginAPI, params: P) => T,
  params?: P
): Promise<T>
```

**Parameters:**
- `callback`: Function to execute in the Figma plugin context
- `params`: Optional parameters to pass to the callback (must be JSON-serializable)

**Returns:** Promise that resolves to the callback's return value

### Important Constraints

1. **JSON Serialization**: All parameters and return values must be JSON-serializable
2. **No Figma Objects**: Cannot pass Figma node objects directly between contexts
3. **Async Operations**: Use `.then()` for async operations within the callback

## Common Figma API Patterns

### Selection Management

#### Get Current Selection

```typescript
const getSelection = async () => {
  return await figmaAPI.run((figma) => {
    return figma.currentPage.selection.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    }));
  });
};
```

#### Set Selection

```typescript
const selectNodes = async (nodeIds: string[]) => {
  return await figmaAPI.run((figma, { ids }) => {
    const nodes = ids
      .map(id => figma.getNodeById(id))
      .filter(node => node !== null);
    figma.currentPage.selection = nodes;
    return nodes.length;
  }, { ids: nodeIds });
};
```

### Node Creation

#### Create Text Node

```typescript
const createTextNode = async (text: string, options?: {
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  color?: { r: number; g: number; b: number };
}) => {
  return await figmaAPI.run(async (figma, { text, options }) => {
    const textNode = figma.createText();
    
    // Load font before setting properties
    const fontFamily = options?.fontFamily || "Inter";
    const fontStyle = options?.fontStyle || "Regular";
    
    await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
    
    textNode.characters = text;
    
    if (options?.fontSize) {
      textNode.fontSize = options.fontSize;
    }
    
    if (options?.color) {
      textNode.fills = [{
        type: 'SOLID',
        color: options.color
      }];
    }
    
    figma.currentPage.appendChild(textNode);
    return textNode.id;
  }, { text, options });
};
```

#### Create Frame

```typescript
const createFrame = async (options: {
  name?: string;
  width?: number;
  height?: number;
  backgroundColor?: { r: number; g: number; b: number };
}) => {
  return await figmaAPI.run((figma, { options }) => {
    const frame = figma.createFrame();
    
    if (options.name) frame.name = options.name;
    if (options.width) frame.resize(options.width, frame.height);
    if (options.height) frame.resize(frame.width, options.height);
    
    if (options.backgroundColor) {
      frame.fills = [{
        type: 'SOLID',
        color: options.backgroundColor
      }];
    }
    
    figma.currentPage.appendChild(frame);
    return frame.id;
  }, { options });
};
```

#### Create Rectangle

```typescript
const createRectangle = async (options: {
  width?: number;
  height?: number;
  fillColor?: { r: number; g: number; b: number };
  strokeColor?: { r: number; g: number; b: number };
  strokeWeight?: number;
  cornerRadius?: number;
}) => {
  return await figmaAPI.run((figma, { options }) => {
    const rect = figma.createRectangle();
    
    if (options.width && options.height) {
      rect.resize(options.width, options.height);
    }
    
    if (options.fillColor) {
      rect.fills = [{
        type: 'SOLID',
        color: options.fillColor
      }];
    }
    
    if (options.strokeColor) {
      rect.strokes = [{
        type: 'SOLID',
        color: options.strokeColor
      }];
    }
    
    if (options.strokeWeight) {
      rect.strokeWeight = options.strokeWeight;
    }
    
    if (options.cornerRadius) {
      rect.cornerRadius = options.cornerRadius;
    }
    
    figma.currentPage.appendChild(rect);
    return rect.id;
  }, { options });
};
```

### Node Modification

#### Update Node Properties

```typescript
const updateNodeProperties = async (nodeId: string, updates: {
  name?: string;
  x?: number;
  y?: number;
  visible?: boolean;
  locked?: boolean;
}) => {
  return await figmaAPI.run((figma, { nodeId, updates }) => {
    const node = figma.getNodeById(nodeId);
    if (!node) return false;
    
    if (updates.name !== undefined) node.name = updates.name;
    if (updates.x !== undefined) node.x = updates.x;
    if (updates.y !== undefined) node.y = updates.y;
    if (updates.visible !== undefined) node.visible = updates.visible;
    if (updates.locked !== undefined) node.locked = updates.locked;
    
    return true;
  }, { nodeId, updates });
};
```

#### Clone Node

```typescript
const cloneNode = async (nodeId: string) => {
  return await figmaAPI.run((figma, { nodeId }) => {
    const node = figma.getNodeById(nodeId);
    if (!node) return null;
    
    const clone = node.clone();
    clone.x = node.x + 100; // Offset clone position
    
    if (node.parent) {
      node.parent.appendChild(clone);
    } else {
      figma.currentPage.appendChild(clone);
    }
    
    return clone.id;
  }, { nodeId });
};
```

### Node Queries

#### Find Nodes by Type

```typescript
const findNodesByType = async (nodeType: NodeType) => {
  return await figmaAPI.run((figma, { nodeType }) => {
    return figma.currentPage.findAll(node => node.type === nodeType)
      .map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      }));
  }, { nodeType });
};
```

#### Find Nodes by Name

```typescript
const findNodesByName = async (namePattern: string) => {
  return await figmaAPI.run((figma, { namePattern }) => {
    const regex = new RegExp(namePattern, 'i');
    return figma.currentPage.findAll(node => regex.test(node.name))
      .map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      }));
  }, { namePattern });
};
```

### Layout and Positioning

#### Auto Layout Functions

```typescript
const addAutoLayout = async (nodeId: string, options: {
  mode?: 'HORIZONTAL' | 'VERTICAL';
  spacing?: number;
  padding?: number;
}) => {
  return await figmaAPI.run((figma, { nodeId, options }) => {
    const node = figma.getNodeById(nodeId);
    if (!node || node.type !== 'FRAME') return false;
    
    const frame = node as FrameNode;
    frame.layoutMode = options.mode || 'VERTICAL';
    
    if (options.spacing !== undefined) {
      frame.itemSpacing = options.spacing;
    }
    
    if (options.padding !== undefined) {
      frame.paddingTop = options.padding;
      frame.paddingRight = options.padding;
      frame.paddingBottom = options.padding;
      frame.paddingLeft = options.padding;
    }
    
    return true;
  }, { nodeId, options });
};
```

#### Position Nodes in Grid

```typescript
const arrangeInGrid = async (nodeIds: string[], options: {
  columns: number;
  spacing: number;
  startX?: number;
  startY?: number;
}) => {
  return await figmaAPI.run((figma, { nodeIds, options }) => {
    const nodes = nodeIds
      .map(id => figma.getNodeById(id))
      .filter(node => node !== null);
    
    const startX = options.startX || 0;
    const startY = options.startY || 0;
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / options.columns);
      const col = index % options.columns;
      
      node.x = startX + col * (node.width + options.spacing);
      node.y = startY + row * (node.height + options.spacing);
    });
    
    return nodes.length;
  }, { nodeIds, options });
};
```

## Color and Style Utilities

### Color Conversion

```typescript
// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
};

// Apply color to nodes
const applyColorToNodes = async (nodeIds: string[], hexColor: string) => {
  const rgbColor = hexToRgb(hexColor);
  
  return await figmaAPI.run((figma, { nodeIds, color }) => {
    const nodes = nodeIds
      .map(id => figma.getNodeById(id))
      .filter(node => node && 'fills' in node);
    
    nodes.forEach(node => {
      (node as any).fills = [{
        type: 'SOLID',
        color: color
      }];
    });
    
    return nodes.length;
  }, { nodeIds, color: rgbColor });
};
```

## Plugin State Management

### Local Storage in Plugin Context

```typescript
const savePluginData = async (key: string, data: any) => {
  return await figmaAPI.run((figma, { key, data }) => {
    figma.root.setPluginData(key, JSON.stringify(data));
    return true;
  }, { key, data });
};

const loadPluginData = async (key: string) => {
  return await figmaAPI.run((figma, { key }) => {
    const data = figma.root.getPluginData(key);
    return data ? JSON.parse(data) : null;
  }, { key });
};
```

## Error Handling Patterns

### Safe Node Operations

```typescript
const safeNodeOperation = async <T>(
  nodeId: string,
  operation: (node: SceneNode) => T,
  fallback: T
): Promise<T> => {
  try {
    return await figmaAPI.run((figma, { nodeId }) => {
      const node = figma.getNodeById(nodeId);
      if (!node) return fallback;
      return operation(node);
    }, { nodeId });
  } catch (error) {
    console.error('Node operation failed:', error);
    return fallback;
  }
};
```

### Batch Operations with Error Recovery

```typescript
const batchNodeOperation = async <T>(
  nodeIds: string[],
  operation: (node: SceneNode) => T
): Promise<{ results: T[]; errors: string[] }> => {
  return await figmaAPI.run((figma, { nodeIds }) => {
    const results: T[] = [];
    const errors: string[] = [];
    
    nodeIds.forEach(nodeId => {
      try {
        const node = figma.getNodeById(nodeId);
        if (!node) {
          errors.push(`Node ${nodeId} not found`);
          return;
        }
        
        const result = operation(node);
        results.push(result);
      } catch (error) {
        errors.push(`Error processing node ${nodeId}: ${error.message}`);
      }
    });
    
    return { results, errors };
  }, { nodeIds });
};
```

## Performance Optimization

### Minimize API Calls

```typescript
// Bad: Multiple API calls
const badExample = async (nodeIds: string[]) => {
  const results = [];
  for (const nodeId of nodeIds) {
    const result = await figmaAPI.run((figma, { nodeId }) => {
      const node = figma.getNodeById(nodeId);
      return node ? node.name : null;
    }, { nodeId });
    results.push(result);
  }
  return results;
};

// Good: Single API call
const goodExample = async (nodeIds: string[]) => {
  return await figmaAPI.run((figma, { nodeIds }) => {
    return nodeIds.map(nodeId => {
      const node = figma.getNodeById(nodeId);
      return node ? node.name : null;
    });
  }, { nodeIds });
};
```

### Debounced Operations

```typescript
// lib/debounce.ts
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }) as T;
};

// Usage in component
const debouncedUpdate = debounce(async (text: string) => {
  await updateTextNodes(text);
}, 300);
```

This API reference covers the most common patterns you'll need when developing Figma plugins. For the complete Figma Plugin API documentation, visit the [official Figma Plugin API docs](https://www.figma.com/plugin-docs/api/api-reference/). 
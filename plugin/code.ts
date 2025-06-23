/// <reference types="@figma/plugin-typings" />

// Get the injected HTML
declare const html: { default: string };

type MessageType = "process-command" | "ui-loaded" | "error" | "command-complete" | "command-error";

interface PluginMessage {
  type: MessageType;
  payload?: any;
  message?: string;
}

interface CommandResponse {
  commands: Array<{
    type: string;
    params: Record<string, any>;
  }>;
}

const SYSTEM_PROMPT = `You are a Figma plugin assistant that converts natural language commands into structured actions.
Your role is to interpret user requests and convert them into specific Figma API commands.

Output must be a JSON array of commands, where each command has:
- type: The type of operation (e.g., "create", "modify", "delete", "style", "arrange")
- params: An object containing relevant parameters for the operation

Example commands:
{
  "commands": [
    {
      "type": "create",
      "params": {
        "nodeType": "RECTANGLE",
        "properties": {
          "x": 100,
          "y": 100,
          "width": 200,
          "height": 100,
          "fills": [{"type": "SOLID", "color": {"r": 1, "g": 0, "b": 0}}]
        }
      }
    }
  ]
}

Only respond with valid JSON. Do not include any explanations or markdown.`;

// Your personal Groq API key - replace with your actual key
const GROQ_API_KEY = "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";

// Show UI
figma.showUI(__html__, { 
  width: 400, 
  height: 300,
  themeColors: true
});

// Load required fonts before any text operations
const loadRequiredFonts = async () => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
};

// Helper functions for property validation and transformation
function isPropertyWritable(node: SceneNode, key: string): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), key);
    return descriptor?.set !== undefined && 
           !['id', 'type', 'absoluteTransform', 'absoluteBoundingBox', 
             'absoluteRenderBounds', 'attachedConnectors', 'boundVariables',
             'fillGeometry', 'inferredVariables'].includes(key);
  } catch {
    return false;
  }
}

function transformValueIfNeeded(key: string, value: any): any {
  // Handle special cases for different property types
  switch (key) {
    case 'cornerRadius':
      return Number(value);
    case 'rectangleCornerRadii':
      return Array.isArray(value) ? value : [value, value, value, value];
    case 'fills':
      return Array.isArray(value) ? value : [value];
    case 'strokes':
      return Array.isArray(value) ? value : [value];
    case 'effects':
      return Array.isArray(value) ? value : [value];
    default:
      return value;
  }
}

// Process natural language command through Groq
async function processCommand(command: string) {
  try {
    // Call Groq API directly
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: command }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to process command");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    // Parse and validate the response
    try {
      const parsed = JSON.parse(result);
      if (!Array.isArray(parsed.commands)) {
        throw new Error("Invalid response format");
      }
      return parsed;
    } catch (e) {
      console.error("Invalid JSON response from Groq:", result);
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing command:", error.message);
      throw error;
    }
    console.error("Error processing command:", error);
    throw new Error("An unexpected error occurred");
  }
}

// Create a new node based on type and properties
async function createNode(nodeType: string, properties: any) {
  let node;
  
  console.log('Creating node:', { nodeType, properties });
  
  switch (nodeType.toUpperCase()) {
    case 'RECTANGLE':
      node = figma.createRectangle();
      break;
    case 'TEXT':
      node = figma.createText();
      // Load font before setting text properties
      if (properties.fontName) {
        try {
          await figma.loadFontAsync(properties.fontName);
        } catch (error) {
          const err = error as Error;
          console.error('Font loading failed:', { fontName: properties.fontName, error: err });
          throw new Error(`Failed to load font: ${err.message}`);
        }
      }
      break;
    case 'FRAME':
      node = figma.createFrame();
      break;
    case 'COMPONENT':
      node = figma.createComponent();
      break;
    case 'LINE':
      node = figma.createLine();
      break;
    case 'ELLIPSE':
      node = figma.createEllipse();
      break;
    default:
      throw new Error(`Unsupported node type: ${nodeType}`);
  }

  // Apply properties with validation and logging
  for (const [key, value] of Object.entries(properties)) {
    try {
      console.log('Setting property:', { key, value, nodeType: node.type });
      
      if (isPropertyWritable(node, key)) {
        const transformedValue = transformValueIfNeeded(key, value);
        (node as any)[key] = transformedValue;
      } else {
        console.warn(`Skipping invalid or read-only property: ${key} on ${node.type}`);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Property set failed:', { key, value, nodeType: node.type, error: err });
      throw new Error(`Failed to set property ${key}: ${err.message}`);
    }
  }

  return node;
}

// Modify existing nodes based on properties
async function modifyNodes(nodeTypes: string[], properties: any) {
  console.log('Modifying nodes:', { nodeTypes, properties });
  
  const selection = figma.currentPage.selection;
  const nodes = selection.filter(node => 
    nodeTypes.includes(node.type)
  );

  if (nodes.length === 0) {
    figma.notify(`No selected nodes of type: ${nodeTypes.join(', ')}`);
    return;
  }

  // If modifying text, ensure fonts are loaded
  if (properties.fontName && nodes.some(node => node.type === "TEXT")) {
    try {
      await figma.loadFontAsync(properties.fontName);
    } catch (error) {
      const err = error as Error;
      console.error('Font loading failed:', { fontName: properties.fontName, error: err });
      throw new Error(`Failed to load font: ${err.message}`);
    }
  }

  // Apply properties to all matching nodes with validation and logging
  for (const node of nodes) {
    for (const [key, value] of Object.entries(properties)) {
      try {
        console.log('Setting property:', { key, value, nodeType: node.type });
        
        if (isPropertyWritable(node, key)) {
          const transformedValue = transformValueIfNeeded(key, value);
          (node as any)[key] = transformedValue;
        } else {
          console.warn(`Skipping invalid or read-only property: ${key} on ${node.type}`);
        }
      } catch (error) {
        const err = error as Error;
        console.error('Property set failed:', { key, value, nodeType: node.type, error: err });
        throw new Error(`Failed to set property ${key}: ${err.message}`);
      }
    }
  }
}

// Execute the LLM-generated commands on Figma canvas
async function executeCommands(response: CommandResponse) {
  try {
    for (const command of response.commands) {
      switch (command.type.toLowerCase()) {
        case 'create':
          const { nodeType, properties } = command.params;
          const newNode = await createNode(nodeType, properties);
          figma.currentPage.appendChild(newNode);
          break;

        case 'modify':
        case 'style':
          const { nodeTypes, properties: modifyProps } = command.params;
          await modifyNodes(
            Array.isArray(nodeTypes) ? nodeTypes : [nodeTypes],
            modifyProps
          );
          break;

        case 'delete':
          const selection = figma.currentPage.selection;
          if (selection.length === 0) {
            figma.notify('No nodes selected for deletion');
            return;
          }
          selection.forEach(node => node.remove());
          break;

        case 'arrange':
          const { operation, spacing } = command.params;
          const nodes = figma.currentPage.selection;
          
          if (nodes.length < 2) {
            figma.notify('Select at least 2 nodes to arrange');
            return;
          }

          switch (operation.toLowerCase()) {
            case 'horizontal':
              const sortedX = [...nodes].sort((a, b) => a.x - b.x);
              let currentX = sortedX[0].x;
              sortedX.forEach(node => {
                node.x = currentX;
                currentX += node.width + (spacing || 10);
              });
              break;

            case 'vertical':
              const sortedY = [...nodes].sort((a, b) => a.y - b.y);
              let currentY = sortedY[0].y;
              sortedY.forEach(node => {
                node.y = currentY;
                currentY += node.height + (spacing || 10);
              });
              break;
          }
          break;

        default:
          console.warn(`Unknown command type: ${command.type}`);
      }
    }

    figma.notify('Commands executed successfully');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute commands: ${error.message}`);
    }
    throw new Error('Failed to execute commands');
  }
}

// Handle messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'ui-loaded':
        // UI is ready to accept commands
        break;

      case 'process-command':
        const response = await processCommand(msg.payload.command);
        await executeCommands(response);
        figma.ui.postMessage({ type: 'command-complete' });
        break;

      case 'error':
        figma.notify(msg.message || 'An error occurred');
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    figma.ui.postMessage({ 
      type: 'command-error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}; 
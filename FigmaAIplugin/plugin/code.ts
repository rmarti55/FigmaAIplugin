import { createFigmaNodes, validateLayout } from '../lib/layoutParser';

interface LayoutMessage {
  type: string;
  prompt?: string;
}

// Show the plugin UI
figma.showUI(__html__, { width: 300, height: 200 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg: LayoutMessage) => {
  if (msg.type === 'generate-layout') {
    try {
      // Generate layout using Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a layout generation assistant. Convert natural language descriptions into structured JSON that represents Figma layouts.
              
Example format:
{
  "type": "FRAME",
  "name": "Layout",
  "props": {
    "width": 400,
    "height": 300,
    "layoutMode": "VERTICAL",
    "itemSpacing": 16,
    "padding": 24
  },
  "children": [
    {
      "type": "TEXT",
      "name": "Title",
      "props": {
        "characters": "Hello World",
        "fontSize": 24
      }
    },
    {
      "type": "RECTANGLE",
      "name": "Card",
      "props": {
        "width": 200,
        "height": 100,
        "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}]
      }
    }
  ]
}

Focus on:
- Spatial relationships (width, height, position)
- Hierarchy (parent-child relationships)
- Component structure (frames, text, shapes)
- Layout properties (auto-layout, spacing, padding)
Only use the following node types: FRAME, TEXT, RECTANGLE, GROUP`
            },
            {
              role: "user",
              content: msg.prompt || ""
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.5,
          max_tokens: 1000,
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const completion = await response.json();
      const layoutJSON = JSON.parse(completion.choices[0]?.message?.content || "{}");

      // Validate the layout structure
      if (!validateLayout(layoutJSON)) {
        throw new Error('Invalid layout structure received from API');
      }

      // Create the layout in Figma
      const node = await createFigmaNodes(layoutJSON);
      
      // Center the view on the created layout
      figma.viewport.scrollAndZoomIntoView([node]);

      // Notify success
      figma.ui.postMessage({ type: 'success' });

    } catch (error) {
      console.error('Error:', error);
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Failed to generate layout: ' + (error as Error).message 
      });
    }
  }
};

// Function to create Figma nodes from layout JSON
async function createLayout(layout: any) {
  // TODO: Implement layout creation logic
  // This will convert the JSON structure into actual Figma nodes
  throw new Error('Layout creation not yet implemented');
}

declare const SITE_URL: string;

// iOS Typography System with Font Fallbacks
interface FontSpec {
  family: string;
  style: string;
  size: number;
}

// iOS Typography Scale
const iosTypography = {
  // Text Styles
  largeTitle: { family: "SF Pro Display", style: "Regular", size: 34 },
  title1: { family: "SF Pro Display", style: "Regular", size: 28 },
  title2: { family: "SF Pro Display", style: "Regular", size: 22 },
  title3: { family: "SF Pro Display", style: "Regular", size: 20 },
  headline: { family: "SF Pro Text", style: "Semibold", size: 17 },
  body: { family: "SF Pro Text", style: "Regular", size: 17 },
  callout: { family: "SF Pro Text", style: "Regular", size: 16 },
  subheadline: { family: "SF Pro Text", style: "Regular", size: 15 },
  footnote: { family: "SF Pro Text", style: "Regular", size: 13 },
  caption1: { family: "SF Pro Text", style: "Regular", size: 12 },
  caption2: { family: "SF Pro Text", style: "Regular", size: 11 },
  
  // Component-specific
  button: { family: "SF Pro Text", style: "Semibold", size: 17 },
  buttonSmall: { family: "SF Pro Text", style: "Semibold", size: 15 },
  navigationTitle: { family: "SF Pro Display", style: "Bold", size: 17 },
  tabBarLabel: { family: "SF Pro Text", style: "Medium", size: 10 }
};

// Font fallback chains
const fontFallbacks = [
  // SF Pro Text fallbacks
  [
    { family: "SF Pro Text", style: "Semibold" },
    { family: "SF Pro Text", style: "Medium" },
    { family: "SF Pro Text", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Regular" },
    { family: "Helvetica", style: "Regular" }
  ],
  // SF Pro Display fallbacks  
  [
    { family: "SF Pro Display", style: "Bold" },
    { family: "SF Pro Display", style: "Semibold" },
    { family: "SF Pro Display", style: "Regular" },
    { family: "Inter", style: "Bold" },
    { family: "Inter", style: "SemiBold" },
    { family: "Inter", style: "Regular" }
  ]
];

/**
 * Attempts to load iOS fonts with proper fallbacks
 * Returns the first successfully loaded font
 */
async function loadIOSFont(
  preferredFont: FontSpec
): Promise<{ family: string; style: string }> {
  
  // First try the exact requested font
  try {
    await figma.loadFontAsync({ 
      family: preferredFont.family, 
      style: preferredFont.style 
    });
    return { family: preferredFont.family, style: preferredFont.style };
  } catch (error) {
    console.warn(`Could not load ${preferredFont.family} ${preferredFont.style}`);
  }

  // Determine fallback chain based on font family
  const fallbackChain = preferredFont.family.includes("Display") 
    ? fontFallbacks[1] 
    : fontFallbacks[0];

  // Try fallbacks in order
  for (const fallback of fallbackChain) {
    try {
      await figma.loadFontAsync(fallback);
      console.log(`Using fallback font: ${fallback.family} ${fallback.style}`);
      return fallback;
    } catch (error) {
      continue;
    }
  }

  // Last resort: system default
  throw new Error("Could not load any fonts");
}

/**
 * Get iOS typography spec for a component type
 */
function getIOSTypography(type: keyof typeof iosTypography): FontSpec {
  return iosTypography[type];
}

// Create the UI
const html = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 16px;
  }
  
  .section {
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #333;
  }
  
  .button-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .text-button {
    background: #F0F0F5;
    color: #333;
  }
  
  .text-button:hover {
    background: #E5E5EA;
  }
  
  .component-button {
    background: #007AFF;
    color: white;
  }
  
  .component-button:hover {
    background: #0066D6;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #E5E5EA;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 13px;
  }
  
  input:focus {
    outline: none;
    border-color: #007AFF;
  }
</style>

<div class="section">
  <h3>Text Styles</h3>
  <input type="text" id="text-input" placeholder="Enter text...">
  <div class="button-grid">
    <button class="text-button" onclick="createText('largeTitle')">Large Title</button>
    <button class="text-button" onclick="createText('title1')">Title 1</button>
    <button class="text-button" onclick="createText('headline')">Headline</button>
    <button class="text-button" onclick="createText('body')">Body</button>
    <button class="text-button" onclick="createText('callout')">Callout</button>
    <button class="text-button" onclick="createText('caption1')">Caption</button>
  </div>
</div>

<div class="section">
  <h3>Components</h3>
  <input type="text" id="button-input" placeholder="Button text...">
  <div class="button-grid">
    <button class="component-button" onclick="createButton(false)">Regular Button</button>
    <button class="component-button" onclick="createButton(true)">Small Button</button>
  </div>
</div>

<script>
  function createText(style) {
    const text = document.getElementById('text-input').value || 'Sample Text';
    parent.postMessage({ 
      pluginMessage: { 
        type: 'create-text',
        style,
        text
      }
    }, '*');
  }
  
  function createButton(isSmall) {
    const text = document.getElementById('button-input').value || 'Button';
    parent.postMessage({ 
      pluginMessage: { 
        type: 'create-button',
        isSmall,
        text
      }
    }, '*');
  }
</script>
`;

// Show UI
figma.showUI(html, {
  width: 320,
  height: 480,
  themeColors: true
});

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-text') {
    try {
      const fontSpec = getIOSTypography(msg.style || "body");
      
      // Create text node
      const textNode = figma.createText();
      
      // Load font with fallbacks
      const loadedFont = await loadIOSFont(fontSpec);
      textNode.fontName = loadedFont;
      textNode.fontSize = fontSpec.size;
      textNode.characters = msg.text || "Sample Text";
      
      // Position in the center of the viewport
      const { x, y, width, height } = figma.viewport.bounds;
      textNode.x = x + (width / 2) - (textNode.width / 2);
      textNode.y = y + (height / 2) - (textNode.height / 2);
      
      // Add to current page
      figma.currentPage.appendChild(textNode);
      figma.currentPage.selection = [textNode];
      figma.viewport.scrollAndZoomIntoView([textNode]);
      
      figma.notify(`Created text with ${msg.style} style! ✨`);
    } catch (e: any) {
      console.error('Error creating text:', e);
      figma.notify(`Error creating text: ${e.message}`, { error: true });
    }
  }
  
  else if (msg.type === 'create-button') {
    try {
      // Get typography specs for button
      const typographyType = msg.isSmall ? "buttonSmall" : "button";
      const fontSpec = getIOSTypography(typographyType);
      
      // Create button frame
      const button = figma.createFrame();
      button.name = "iOS Button";
      button.fills = [{type: 'SOLID', color: {r: 0, g: 0.48, b: 1}}];
      button.cornerRadius = 8;
      
      // Create text node for button label
      const textNode = figma.createText();
      
      // Load font with fallbacks
      const loadedFont = await loadIOSFont(fontSpec);
      textNode.fontName = loadedFont;
      textNode.fontSize = fontSpec.size;
      textNode.characters = msg.text || "Button";
      textNode.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
      
      // Add text to button and center it
      button.appendChild(textNode);
      
      // Size the button based on text with padding
      const padding = 16;
      button.resize(
        textNode.width + (padding * 2),
        textNode.height + (padding * 1.5)
      );
      
      // Center text in button
      textNode.x = (button.width - textNode.width) / 2;
      textNode.y = (button.height - textNode.height) / 2;
      
      // Position button in the center of the viewport
      const { x, y, width, height } = figma.viewport.bounds;
      button.x = x + (width / 2) - (button.width / 2);
      button.y = y + (height / 2) - (button.height / 2);
      
      // Add to current page
      figma.currentPage.appendChild(button);
      figma.currentPage.selection = [button];
      figma.viewport.scrollAndZoomIntoView([button]);
      
      figma.notify(`Created ${msg.isSmall ? "small " : ""}button! ✨`);
    } catch (e: any) {
      console.error('Error creating button:', e);
      figma.notify(`Error creating button: ${e.message}`, { error: true });
    }
  }
};

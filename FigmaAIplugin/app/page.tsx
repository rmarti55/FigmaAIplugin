"use client";

import { figmaAPI } from "@/lib/figmaAPI";
import { getTextForSelection } from "@/lib/getTextForSelection";
import { getTextOffset } from "@/lib/getTextOffset";
import { CompletionRequestBody } from "@/lib/types";
import { useState } from "react";
import { z } from "zod";

// iOS Design System Colors (from iOS 18)
const iosColors = {
  systemBlue: { r: 0, g: 0.478, b: 1 },
  systemGreen: { r: 0.204, g: 0.780, b: 0.349 },
  systemIndigo: { r: 0.345, g: 0.337, b: 0.839 },
  systemOrange: { r: 1, g: 0.584, b: 0 },
  systemPink: { r: 1, g: 0.176, b: 0.333 },
  systemPurple: { r: 0.686, g: 0.322, b: 0.871 },
  systemRed: { r: 1, g: 0.231, b: 0.188 },
  systemTeal: { r: 0.353, g: 0.784, b: 0.980 },
  systemYellow: { r: 1, g: 0.800, b: 0 },
  systemGray: { r: 0.557, g: 0.557, b: 0.576 },
  label: { r: 0, g: 0, b: 0 },
  secondaryLabel: { r: 0.235, g: 0.235, b: 0.263 },
  systemBackground: { r: 1, g: 1, b: 1 },
  secondarySystemBackground: { r: 0.949, g: 0.949, b: 0.969 }
};

// Basic shape types
const shapeTypes = [
  'button', 'card', 'input', 'toggle', 'slider', 'tab', 'navbar', 'cell', 'modal', 'alert'
];

// This function calls our API and lets you read each character as it comes in.
// To change the prompt of our AI, go to `app/api/completion.ts`.
async function streamAIResponse(body: z.infer<typeof CompletionRequestBody>) {
  const resp = await fetch("/api/completion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const reader = resp.body?.pipeThrough(new TextDecoderStream()).getReader();

  if (!reader) {
    throw new Error("Error reading response");
  }

  return reader;
}

export default function Plugin() {
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate basic iOS shape based on user prompt
  const generateShape = async (prompt: string) => {
    setIsGenerating(true);
    setAiResponse("");
    
    // Simple shape generation without AI for now - we'll make it conversational
    await figmaAPI.run(async (figma, { prompt, iosColors }) => {
      // Parse the prompt for basic shapes
      const lowerPrompt = prompt.toLowerCase();
      
      let shapeType = 'button'; // default
      let color = iosColors.systemBlue; // default
      let size = { width: 200, height: 44 }; // default iOS button size
      
      // Basic parsing
      if (lowerPrompt.includes('card')) {
        shapeType = 'card';
        size = { width: 300, height: 200 };
        color = iosColors.systemBackground;
      } else if (lowerPrompt.includes('input') || lowerPrompt.includes('textfield')) {
        shapeType = 'input';
        size = { width: 280, height: 36 };
        color = iosColors.secondarySystemBackground;
      } else if (lowerPrompt.includes('toggle') || lowerPrompt.includes('switch')) {
        shapeType = 'toggle';
        size = { width: 49, height: 31 };
        color = iosColors.systemGreen;
      }
      
      // Color detection
      if (lowerPrompt.includes('blue')) color = iosColors.systemBlue;
      else if (lowerPrompt.includes('green')) color = iosColors.systemGreen;
      else if (lowerPrompt.includes('red')) color = iosColors.systemRed;
      else if (lowerPrompt.includes('orange')) color = iosColors.systemOrange;
      else if (lowerPrompt.includes('purple')) color = iosColors.systemPurple;
      
      // Create the shape
      const shape = figma.createRectangle();
      shape.name = `iOS ${shapeType}`;
      shape.resize(size.width, size.height);
      
      // Apply iOS styling
      if (shapeType === 'button') {
        shape.cornerRadius = 8;
        shape.fills = [{ type: 'SOLID', color }];
        
        // Add button text
        const text = figma.createText();
        await figma.loadFontAsync({ family: "SF Pro Text", style: "Medium" });
        text.fontName = { family: "SF Pro Text", style: "Medium" };
        text.fontSize = 17;
        text.characters = lowerPrompt.includes('button') ? 
          prompt.replace(/button/i, '').trim() || 'Button' : 'Button';
        text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        
        // Center text on button
        text.x = shape.x + (shape.width - text.width) / 2;
        text.y = shape.y + (shape.height - text.height) / 2;
        
        figma.group([shape, text], figma.currentPage);
      } else if (shapeType === 'card') {
        shape.cornerRadius = 12;
        shape.fills = [{ type: 'SOLID', color }];
        shape.effects = [{
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 2 },
          radius: 8,
          visible: true,
          blendMode: 'NORMAL'
        }];
      } else if (shapeType === 'input') {
        shape.cornerRadius = 8;
        shape.fills = [{ type: 'SOLID', color }];
        shape.strokes = [{ type: 'SOLID', color: iosColors.systemGray }];
        shape.strokeWeight = 1;
      } else if (shapeType === 'toggle') {
        shape.cornerRadius = 15.5;
        shape.fills = [{ type: 'SOLID', color }];
      }
      
      // Position it near current viewport or selection
      const selection = figma.currentPage.selection;
      if (selection.length > 0) {
        const lastSelected = selection[selection.length - 1];
        shape.x = lastSelected.x + lastSelected.width + 20;
        shape.y = lastSelected.y;
      } else {
        const viewport = figma.viewport.center;
        shape.x = viewport.x - size.width / 2;
        shape.y = viewport.y - size.height / 2;
      }
      
      figma.currentPage.selection = [shape];
      figma.viewport.scrollAndZoomIntoView([shape]);
      
      figma.notify(`Created iOS ${shapeType}! ✨`);
      
      return `Created a ${shapeType} with iOS styling. What would you like to adjust?`;
    }, { prompt, iosColors });
    
    setAiResponse(`Created iOS component! What would you like to refine? Try: "make it bigger", "change color to green", "add shadow", etc.`);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    
    await generateShape(userPrompt);
    setUserPrompt("");
  };

  // Quick action buttons for common iOS components
  const quickActions = [
    { label: "Blue Button", prompt: "blue button login" },
    { label: "Input Field", prompt: "input textfield email" },
    { label: "Card", prompt: "white card with shadow" },
    { label: "Green Toggle", prompt: "green toggle switch" },
    { label: "Tab Bar", prompt: "tab bar navigation" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold mb-2">iOS Shape Generator</h1>
        <p className="text-sm text-gray-300">
          Generate iOS components with natural language
        </p>
      </div>
      
      <div className="flex-1 p-4">
        {/* Quick Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => generateShape(action.prompt)}
                disabled={isGenerating}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Interface */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe what you want: 'red button', 'input field', 'card with shadow'..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !userPrompt.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 rounded-lg font-medium"
            >
              {isGenerating ? "Creating..." : "Generate"}
            </button>
          </div>
        </form>

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-300 mb-2">AI Assistant:</div>
            <div className="text-white">{aiResponse}</div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-medium mb-2">💡 Try these prompts:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• "blue button with login text"</li>
            <li>• "input field for email"</li>
            <li>• "white card with shadow"</li>
            <li>• "green toggle switch"</li>
            <li>• "red delete button"</li>
            <li>• "navigation tab bar"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

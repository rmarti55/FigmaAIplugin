/// <reference types="@figma/plugin-typings" />

type MessageType = "applyStyle" | "align" | "rename";

interface PluginMessage {
  type: MessageType;
  payload: any;
}

// Load required fonts before any text operations
const loadRequiredFonts = async () => {
  await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
  await figma.loadFontAsync({ family: "SF Pro Text", style: "Medium" });
  await figma.loadFontAsync({ family: "SF Pro Text", style: "Bold" });
};

// Handle style application
const applyStyle = async (payload: any) => {
  const { style } = payload;
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Please select at least one layer");
    return;
  }

  // Apply style to selected layers
  for (const node of selection) {
    if ("fills" in node) {
      // Handle fill styles
      if (style.fill) {
        node.fills = [style.fill];
      }
    }
    if ("strokes" in node) {
      // Handle stroke styles
      if (style.stroke) {
        node.strokes = [style.stroke];
      }
    }
  }
};

// Handle alignment
const alignLayers = (payload: any) => {
  const { alignment } = payload;
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Please select at least one layer");
    return;
  }

  switch (alignment) {
    case "left":
      figma.viewport.scrollAndZoomIntoView(selection);
      figma.group(selection, figma.currentPage).layoutAlign = "MIN";
      break;
    case "center":
      figma.viewport.scrollAndZoomIntoView(selection);
      figma.group(selection, figma.currentPage).layoutAlign = "CENTER";
      break;
    case "right":
      figma.viewport.scrollAndZoomIntoView(selection);
      figma.group(selection, figma.currentPage).layoutAlign = "MAX";
      break;
  }
};

// Handle renaming
const renameLayers = async (payload: any) => {
  const { name } = payload;
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Please select at least one layer");
    return;
  }

  for (const node of selection) {
    node.name = name;
  }
};

// Main message handler
figma.ui.onmessage = async (msg: PluginMessage) => {
  await loadRequiredFonts();

  switch (msg.type) {
    case "applyStyle":
      await applyStyle(msg.payload);
      break;
    case "align":
      alignLayers(msg.payload);
      break;
    case "rename":
      await renameLayers(msg.payload);
      break;
    default:
      console.error("Unknown message type:", msg.type);
  }
};

// Show UI
figma.showUI(__html__, { width: 400, height: 600 }); 
# Project Structure

This document outlines the architecture of our Figma Layout Generator Plugin.

## Overview

The plugin is designed to:
1. Accept natural language prompts
2. Generate structured JSON layouts using Groq API
3. Parse and validate layouts
4. Create corresponding Figma nodes

## Directory Structure

```
plugin/
├── code.ts                # Main plugin code that runs in Figma
├── manifest.json          # Plugin configuration and metadata
├── ui.html               # Plugin UI template
└── webpack.config.js     # Build configuration

lib/
├── figmaAPI.ts           # Figma API helper functions
├── groqClient.ts         # Groq API integration
├── layoutParser.ts       # JSON layout parsing utilities
└── types.ts             # TypeScript type definitions

docs/
├── api-reference.md      # API documentation
├── development-guide.md  # Development workflow
└── project-structure.md  # This file
```

## Core Components

### Plugin Code (code.ts)
- Runs in Figma's sandbox environment
- Handles communication between UI and Figma
- Manages layout generation and node creation

### UI Layer (ui.html)
- Simple HTML interface for prompt input
- Progress indicators and error displays
- No external web dependencies

### Layout Generation
- Uses Groq API with Mixtral-8x7B model
- Generates structured JSON layouts
- Validates layout structure before creation

### Figma Integration
- Creates nodes based on JSON layout
- Handles proper node positioning and hierarchy
- Manages undo/redo stack

## Data Flow

1. User enters natural language prompt
2. Prompt sent to Groq API
3. Structured JSON layout returned
4. Layout parsed and validated
5. Figma nodes created based on layout

## Build Process

- Webpack bundles TypeScript into plugin code
- No external web server needed
- All functionality runs within Figma

## Development Workflow

1. Make changes to source files
2. Run webpack build
3. Test in Figma desktop app
4. Repeat 
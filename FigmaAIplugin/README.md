# Figma Layout Generator Plugin

A Figma plugin that generates layouts from natural language descriptions using Groq's Mixtral-8x7B model.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Development Guide](#development-guide)
6. [Project Structure](#project-structure)
7. [Technical Details](#technical-details)
8. [Contributing](#contributing)
9. [License](#license)

## Overview

The Layout Generator Plugin enables Figma users to create complex layouts using natural language descriptions. It leverages Groq's Mixtral-8x7B model to interpret prompts and generate structured layouts that are automatically created in Figma.

### Key Capabilities
- Generate layouts from text descriptions
- Run entirely within Figma (no external site needed)
- Secure API integration with Groq
- Real-time layout preview and generation
- Automatic node creation and positioning

## Features

- **Natural Language Processing**: Convert text descriptions into structured layouts
- **AI-Powered Generation**: Utilizes Groq's Mixtral-8x7B model for intelligent layout interpretation
- **JSON Layout Parsing**: Converts AI output into valid Figma structures
- **Figma Canvas Integration**: Automatically creates and positions design elements
- **Error Handling**: Robust validation and error recovery
- **Progress Indicators**: Real-time feedback during generation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rmarti55/FigmaAIplugin.git
   cd FigmaAIplugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Groq API key:
   ```
   GROQ_API_KEY=your_api_key_here
   ```

4. Build the plugin:
   ```bash
   npm run build
   ```

5. Import into Figma:
   - Open Figma desktop app
   - Go to Plugins menu
   - Click on Development
   - Select "Import plugin from manifest..."
   - Navigate to and select `plugin/manifest.json`

## Usage

1. Open your Figma file
2. Select the frame or location where you want the layout
3. Run the Layout Generator plugin
4. Enter your layout description
5. Click "Generate Layout"
6. Review and adjust the generated layout

### Example Prompts
- "Create a responsive header with logo, navigation, and contact button"
- "Generate a 3-column layout with equal spacing and padding"
- "Design a mobile app screen with top navigation and bottom tabs"

## Development Guide

### Prerequisites
- Node.js (v14 or higher)
- Figma desktop app
- Groq API key

### Development Workflow

1. Start development server:
   ```bash
   npm run dev
   ```

2. Make changes to source files:
   - `plugin/code.ts` for main plugin logic
   - `plugin/ui.html` for interface updates
   - `lib/*.ts` for utility functions

3. Test in Figma:
   - Plugin automatically reloads on changes
   - Check console for errors
   - Verify layout generation

4. Build for production:
   ```bash
   npm run build
   ```

### Plugin Architecture

The plugin follows Figma's plugin architecture:
- Runs in a sandboxed environment
- Uses request/response pattern for API calls
- Handles asynchronous operations
- Manages plugin lifecycle

## Project Structure

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
└── project-structure.md  # Project structure details
```

## Technical Details

### Manifest Configuration

```json
{
  "name": "Layout Generator",
  "id": "1267011947707869303",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["https://api.groq.com"],
    "reasoning": "Required for AI layout generation using Groq API"
  }
}
```

### Data Flow

1. User Input → Natural language prompt
2. API Processing → Groq Mixtral-8x7B model
3. Layout Generation → Structured JSON
4. Validation → Schema checking
5. Node Creation → Figma canvas elements

### Core Components

1. **Plugin Code (code.ts)**
   - Manages plugin lifecycle
   - Handles UI communication
   - Controls layout generation

2. **UI Layer (ui.html)**
   - User input interface
   - Progress indicators
   - Error displays

3. **Layout Parser (layoutParser.ts)**
   - JSON structure validation
   - Layout optimization
   - Node hierarchy management

4. **Figma Integration (figmaAPI.ts)**
   - Node creation and positioning
   - Style application
   - Canvas management

## Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Development Standards
- Follow TypeScript best practices
- Maintain code documentation
- Add tests for new features
- Keep the plugin focused on layout generation

## License

MIT License - See LICENSE file for details

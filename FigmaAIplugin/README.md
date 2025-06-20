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
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)
10. [License](#license)

## Overview

The Layout Generator Plugin enables Figma users to create complex layouts using natural language descriptions. It leverages Groq's Mixtral-8x7B model to interpret prompts and generate structured layouts that are automatically created in Figma.

### Core Functionality
- Convert natural language descriptions into Figma layouts
- Run entirely within Figma (no external dependencies)
- Automatic node creation and positioning
- Real-time layout preview

## Features

- **Natural Language Processing**
  - Interpret design intent from text descriptions
  - Support for layout, spacing, and component relationships
  - Context-aware generation based on selected elements

- **AI-Powered Layout Engine**
  - Groq Mixtral-8x7B model integration
  - Structured JSON layout generation
  - Intelligent component placement

- **Figma Integration**
  - Automatic node creation and positioning
  - Style and constraint management
  - Selection-aware layout generation
  - Undo/redo support

- **Developer Experience**
  - Real-time error feedback
  - Progress indicators
  - Debug logging
  - Performance optimization

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

3. Set up your Groq API key:
   - Create an account at https://console.groq.com
   - Generate an API key from your dashboard
   - Create a `.env` file in the project root:
     ```
     GROQ_API_KEY=your_api_key_here
     ```
   - Never commit your API key or share it publicly

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

Basic Layouts:
- "Create a responsive header with logo, navigation, and contact button"
- "Generate a 3-column layout with equal spacing and padding"
- "Design a mobile app screen with top navigation and bottom tabs"

Advanced Layouts:
- "Create a responsive grid layout with 4 cards, each having an image, title, and description"
- "Generate a checkout form with input fields, validation, and a submit button"
- "Design a dashboard layout with sidebar navigation and main content area"

### Layout Structure Example

The plugin generates structured JSON that maps to Figma elements:

```json
{
  "type": "FRAME",
  "name": "Header",
  "children": [
    {
      "type": "FRAME",
      "name": "Logo",
      "width": 120,
      "height": 40
    },
    {
      "type": "FRAME",
      "name": "Navigation",
      "children": [
        {
          "type": "TEXT",
          "name": "Nav Item",
          "characters": "Home"
        }
      ]
    }
  ]
}
```

## Development Guide

### Prerequisites
- Node.js (v14 or higher)
- Figma desktop app
- Groq API key
- Basic understanding of TypeScript and Figma Plugin API

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
- Sandboxed environment execution
- Request/response pattern for API calls
- Asynchronous operation handling
- Managed plugin lifecycle
- Secure API key storage

### Performance Considerations
- Batch node creation operations
- Minimize API calls
- Cache frequently used data
- Handle large layouts efficiently

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
   - Plugin lifecycle management
   - UI communication handling
   - Layout generation control
   - Error handling and recovery

2. **UI Layer (ui.html)**
   - User input interface
   - Progress indicators
   - Error displays
   - Debug information (development mode)

3. **Layout Parser (layoutParser.ts)**
   - JSON structure validation
   - Layout optimization
   - Node hierarchy management
   - Constraint calculation

4. **Figma Integration (figmaAPI.ts)**
   - Node creation and positioning
   - Style application
   - Canvas management
   - Selection handling

## Troubleshooting

### Common Issues

1. **Plugin Won't Load**
   - Verify manifest.json is valid
   - Check webpack configuration
   - Ensure all dependencies are installed

2. **API Key Issues**
   - Confirm .env file exists
   - Verify API key is valid
   - Check network access configuration

3. **Layout Generation Fails**
   - Check prompt formatting
   - Verify JSON structure
   - Monitor console for errors
   - Check Groq API status

### Limitations

1. **Layout Complexity**
   - Maximum 50 nodes per generation
   - Nested depth limit of 10 levels
   - Text content length limits apply

2. **API Constraints**
   - Rate limits apply to Groq API
   - Network timeout after 30 seconds
   - Maximum prompt length: 1000 characters

3. **Figma Constraints**
   - Plugin runs in sandboxed environment
   - Limited access to team libraries
   - No background processing

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
- Follow semantic versioning
- Update documentation for changes

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Document complex functions
- Use meaningful variable names
- Keep functions small and focused

## License

MIT License - See LICENSE file for details

---

For bug reports and feature requests, please open an issue on GitHub.

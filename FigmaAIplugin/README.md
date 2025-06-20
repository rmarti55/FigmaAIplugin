# Figma Layout Generator Plugin

A Figma plugin that generates layouts from natural language descriptions using Groq's Mixtral-8x7B model.

## Features

- Natural language prompt handling
- Layout generation using Groq API
- JSON layout parsing
- Figma canvas injection

## Setup

1. Clone this repository
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
5. In Figma desktop app:
   - Go to Plugins > Development > Import plugin from manifest
   - Select the `manifest.json` file from this project

## Development

- Run `npm run dev` to start the development server
- Make changes to the code in the `plugin` directory
- The plugin will automatically reload in Figma

## Project Structure

```
plugin/
├── code.ts                # Main plugin code
├── manifest.json          # Plugin configuration
├── ui.html               # Plugin UI
└── webpack.config.js     # Build configuration

lib/
├── figmaAPI.ts           # Figma API helper functions
├── layoutParser.ts       # JSON layout parsing utilities
└── types.ts             # TypeScript type definitions
```

## Usage

1. Select where you want the layout to be created in Figma
2. Open the plugin
3. Enter a natural language description of your desired layout
4. Click "Generate Layout"

## Examples

Coming soon!

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT

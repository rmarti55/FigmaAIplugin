# iOS Typography System Guide

This guide explains how to use the SF Pro font integration and typography system in the iOS Shape Generator plugin.

## Overview

The plugin uses Apple's SF Pro font family to create authentic iOS typography. The system includes:

1. **SF Pro Display**: For large titles and headings
2. **SF Pro Text**: For body text and UI elements
3. **SF Pro Rounded**: For specialized UI elements

## Font Files

The plugin includes the following SF Pro font files in the `/fonts` directory:

- **SF Pro Display**: Regular, Medium, Semibold, Bold, etc.
- **SF Pro Text**: Regular, Medium, Semibold, Bold, etc.
- **SF Pro Rounded**: Regular, Medium, Semibold, Bold, etc.

## Typography Scale

The typography system follows Apple's Human Interface Guidelines with these text styles:

| Style | Font Family | Weight | Size |
|-------|------------|--------|------|
| Large Title | SF Pro Display | Regular | 34px |
| Title 1 | SF Pro Display | Regular | 28px |
| Title 2 | SF Pro Display | Regular | 22px |
| Title 3 | SF Pro Display | Regular | 20px |
| Headline | SF Pro Text | Semibold | 17px |
| Body | SF Pro Text | Regular | 17px |
| Callout | SF Pro Text | Regular | 16px |
| Subheadline | SF Pro Text | Regular | 15px |
| Footnote | SF Pro Text | Regular | 13px |
| Caption 1 | SF Pro Text | Regular | 12px |
| Caption 2 | SF Pro Text | Regular | 11px |

## Component-Specific Typography

The system also includes predefined typography for common UI components:

| Component | Font Family | Weight | Size |
|-----------|------------|--------|------|
| Button | SF Pro Text | Semibold | 17px |
| Small Button | SF Pro Text | Semibold | 15px |
| Text Field | SF Pro Text | Regular | 17px |
| Label | SF Pro Text | Regular | 17px |
| Caption | SF Pro Text | Regular | 12px |
| Navigation Title | SF Pro Display | Bold | 17px |
| Tab Bar Label | SF Pro Text | Medium | 10px |

## Font Fallback System

The plugin implements a robust fallback system to ensure text always renders properly:

1. **Primary Font**: First tries to load the exact requested font (e.g., SF Pro Text Semibold)
2. **SF Pro Alternatives**: Falls back to alternative weights within the same family
3. **Inter Font**: Falls back to the web-safe Inter font family
4. **System Fonts**: Finally falls back to Helvetica or system default

## Using the Typography System

### In Plugin Code

```typescript
import { loadIOSFont, getIOSTypography } from '../lib/iosTypography';

// Get typography specs for a specific style
const headlineFont = getIOSTypography('headline');

// Load font with fallbacks
const loadedFont = await loadIOSFont(figma, headlineFont);

// Apply to text node
textNode.fontName = loadedFont;
textNode.fontSize = headlineFont.size;
```

### For UI Components

```typescript
import { iosComponentFonts } from '../lib/iosTypography';

// Use component-specific typography
const buttonFont = iosComponentFonts.button;
const navTitleFont = iosComponentFonts.navigationTitle;
```

## Troubleshooting

If you encounter font loading issues:

1. **Check Font Files**: Ensure all font files are properly included in the `/fonts` directory
2. **Verify Fallbacks**: The system should automatically fall back to available fonts
3. **Console Logs**: Check for warnings about font loading failures
4. **Use Inter**: For development, you can rely on the Inter fallback which is widely available

## Customizing Typography

To extend or modify the typography system:

1. Edit `lib/iosTypography.ts` to add new text styles or modify existing ones
2. Add custom component typography to the `iosComponentFonts` object
3. Add new fallback chains if needed

## Resources

- [Apple Human Interface Guidelines - Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [SF Pro Font Family](https://developer.apple.com/fonts/)
- [Inter Font (Fallback)](https://rsms.me/inter/) 
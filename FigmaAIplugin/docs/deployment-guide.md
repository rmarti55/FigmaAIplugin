# 🌐 Deployment Guide

This guide covers deploying your Figma AI plugin to production and optionally publishing it to the Figma Community.

## Deploying to Vercel

### Prerequisites

- GitHub account with your plugin code pushed to a repository
- Vercel account (free tier available)
- OpenAI API key

### Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository containing your Figma plugin

### Step 2: Configure Environment Variables

In your Vercel project settings:

1. Go to **Settings > Environment Variables**
2. Add the following variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (e.g., `sk-xxxxxx`)
   - **Environment**: All (Production, Preview, Development)

### Step 3: Update Configuration

Update your `package.json` to include your Vercel URL:

```json
{
  "config": {
    "siteURL": "https://your-vercel-url.vercel.app/"
  }
}
```

### Step 4: Update Plugin Manifest

Update `plugin/manifest.json` to use your production URL:

```json
{
  "name": "Your AI Plugin",
  "ui": "https://your-vercel-url.vercel.app/",
  // ... other settings
}
```

### Step 5: Build and Deploy

```bash
# Test the production build locally
npm run build

# Deploy (this happens automatically when you push to main branch)
git add .
git commit -m "Deploy to production"
git push origin main
```

Vercel will automatically build and deploy your plugin. You'll get a URL like `https://your-plugin-name.vercel.app/`.

### Step 6: Test Production Plugin

1. Update your plugin manifest to use the production URL
2. Reload the plugin in Figma Desktop
3. Test all functionality to ensure it works in production

## Environment-Specific Configuration

### Development vs Production

You can use different configurations for different environments:

```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-vercel-url.vercel.app/api'
    : 'http://localhost:3000/api',
  
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  debug: process.env.NODE_ENV === 'development'
};
```

### Custom Domain (Optional)

If you have a custom domain:

1. Add the domain in Vercel Settings > Domains
2. Update your `package.json` and `manifest.json` accordingly
3. Ensure SSL certificates are properly configured

## Publishing to Figma Community

### Prerequisites

- Working plugin deployed to production
- Figma Community account
- Plugin tested and ready for public use

### Step 1: Prepare for Submission

1. **Create Plugin Assets**
   - Plugin icon (PNG, 128x128px minimum)
   - Cover image (PNG, 1920x960px)
   - Screenshot images showing plugin functionality

2. **Update Plugin Metadata**
   ```json
   {
     "name": "Your AI Plugin",
     "id": "your-unique-plugin-id",
     "api": "1.0.0",
     "main": "code.js",
     "ui": "https://your-vercel-url.vercel.app/",
     "capabilities": [],
     "enableProposedApi": false,
     "editorType": ["figma"]
   }
   ```

3. **Test Thoroughly**
   - Test all features
   - Ensure error handling works
   - Verify it works on different file types
   - Test with different user permissions

### Step 2: Submit Plugin

1. Go to [Figma Community](https://www.figma.com/community)
2. Click "Share something" > "Plugin"
3. Upload your plugin files and assets
4. Fill out the plugin description, tags, and details
5. Submit for review

### Step 3: Review Process

- Figma will review your plugin (typically takes 1-2 weeks)
- They'll check for functionality, security, and community guidelines
- You may receive feedback requiring changes
- Once approved, your plugin will be published

## Post-Deployment Maintenance

### Monitoring

Set up monitoring for your production plugin:

```typescript
// lib/analytics.ts
export const trackError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to your error tracking service
    console.error(`Plugin Error [${context}]:`, error);
  }
};

export const trackUsage = (action: string, metadata?: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    console.log(`Plugin Action: ${action}`, metadata);
  }
};
```

### Updates and Versioning

When updating your plugin:

1. **Update Version in Manifest**
   ```json
   {
     "version": "1.1.0",
     // ... other settings
   }
   ```

2. **Deploy Changes**
   ```bash
   git add .
   git commit -m "Version 1.1.0: Add new features"
   git push origin main
   ```

3. **Update Community Plugin** (if published)
   - Upload new version to Figma Community
   - Update description with changelog
   - Submit for review if significant changes

### Performance Optimization

For production, consider:

- **Code Splitting**: Use dynamic imports for large dependencies
- **Caching**: Implement proper caching headers
- **Bundle Size**: Minimize bundle size for faster loading
- **Rate Limiting**: Implement rate limiting for API calls

```typescript
// app/completion/route.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export async function POST(req: NextRequest) {
  // Simple rate limiting
  const ip = req.ip || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const userData = rateLimitMap.get(ip);
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
    } else {
      userData.count++;
      if (userData.count > maxRequests) {
        return new Response('Rate limit exceeded', { status: 429 });
      }
    }
  }

  // Continue with normal processing...
}
```

## Security Considerations

### API Key Protection

- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Consider implementing user authentication for paid features

### Input Validation

```typescript
// lib/validation.ts
export const validatePrompt = (prompt: string): string | null => {
  if (!prompt || prompt.trim().length === 0) {
    return "Prompt cannot be empty";
  }
  
  if (prompt.length > 1000) {
    return "Prompt too long (max 1000 characters)";
  }
  
  // Add other validation rules as needed
  return null;
};
```

### Content Safety

Consider implementing content filtering:

```typescript
// lib/safety.ts
export const moderateContent = async (text: string): Promise<boolean> => {
  // Use OpenAI's moderation API or other content filtering service
  try {
    const response = await openai.moderations.create({ input: text });
    return !response.results[0].flagged;
  } catch (error) {
    console.error('Content moderation error:', error);
    return false; // Err on the side of caution
  }
};
```

## Troubleshooting Production Issues

### Common Production Problems

**Plugin not loading:**
- Check Vercel deployment logs
- Verify environment variables are set
- Ensure HTTPS is working properly

**API rate limits:**
- Implement proper rate limiting
- Consider caching responses
- Monitor OpenAI usage

**Performance issues:**
- Check bundle size
- Optimize images and assets
- Use React.memo for expensive components

### Getting Help

- [Figma Plugin Documentation](https://www.figma.com/plugin-docs/)
- [Figma Community Discord](https://discord.gg/figma)
- [Vercel Documentation](https://vercel.com/docs)

Your plugin is now ready for production use and community sharing! 
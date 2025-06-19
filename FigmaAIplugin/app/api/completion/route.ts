import { CompletionRequestBody } from "@/lib/types";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { z } from "zod";

// Create an OpenAI API client
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

// Mock responses for iOS shape generation to avoid API costs during development
const mockShapeResponses = [
  "I'll create a sleek iOS button with system blue color and rounded corners for you!",
  "Creating an elegant input field with iOS styling - perfect for forms and user input.",
  "Generating a beautiful card component with subtle shadow and proper iOS spacing.",
  "Making a smooth toggle switch with the classic iOS green accent color.",
  "Building a clean navigation element following iOS Human Interface Guidelines.",
  "Crafting a professional-looking component with authentic iOS visual design language."
];

// Function to simulate streaming word by word
function createMockStream(text: string) {
  const encoder = new TextEncoder();
  const words = text.split(' ');
  
  const stream = new ReadableStream({
    start(controller) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < words.length) {
          const chunk = (i === 0 ? words[i] : ' ' + words[i]);
          controller.enqueue(encoder.encode(chunk));
          i++;
        } else {
          clearInterval(timer);
          controller.close();
        }
      }, 100); // Simulate streaming delay
    },
  });
  
  return new StreamingTextResponse(stream);
}

const systemMessage = {
  role: "system",
  content: `You are an iOS design assistant helping to create beautiful, functional UI components. 
  Provide brief, encouraging responses (1-2 sentences) about the iOS design elements being created. 
  Focus on design quality, usability, and adherence to Apple's Human Interface Guidelines.`,
} as const;

async function buildUserMessage(
  req: Request,
): Promise<{ role: "user"; content: string }> {
  const body = await req.json();
  
  // Parse and validate the request body
  const parsed = CompletionRequestBody.parse(body);
  
  return {
    role: "user",
    content: `User is requesting iOS UI components. Context: ${JSON.stringify(parsed)}. Please provide an encouraging, brief response about creating quality iOS design elements.`,
  };
}

export async function POST(req: Request) {
  // Check if we should use mock responses (default to true for cost-free development)
  const useMockAI = process.env.USE_MOCK_AI !== 'false';

  if (useMockAI) {
    console.log('🎭 Using mock AI response for iOS shape generation (no API cost)');
    
    // Pick a random mock response
    const mockResponse = mockShapeResponses[Math.floor(Math.random() * mockShapeResponses.length)];
    return createMockStream(mockResponse);
  }

  // Real OpenAI API call for production
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,
      temperature: 0.7,
      max_tokens: 100,
      messages: [systemMessage, await buildUserMessage(req)],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to mock response if OpenAI fails
    console.log('🔄 Falling back to mock response due to API error');
    const fallbackResponse = "Created your iOS component! The design follows Apple's Human Interface Guidelines with proper spacing and visual hierarchy.";
    return createMockStream(fallbackResponse);
  }
}

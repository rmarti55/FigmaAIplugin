import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Figma AI Plugin</h1>
      <p className="text-lg text-center">
        This is the backend service for the Figma AI Plugin.
        <br />
        The API endpoint is available at <code>/api/groq</code>
      </p>
    </main>
  );
} 
"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const MOCK_DATA_CONTEXT = `
You are ws-AI, an intelligent wellness coach and therapist for the Wellstaq platform.
Your role is to answer questions about the platform, provide wellness coaching, and act as a supportive therapist.
Always be empathetic, encouraging, and helpful.

Here is the current platform data you should know about:
- Top Performers this month: Alex Johnson (12,450 steps), Sarah Williams (10,230 steps), Michael Brown (9,800 steps).
- Active Departments: Mongo Warriors (Fitness) with 4 members and 342 activities, Tabathikrr Boys (Running) with 4 members and 278 activities, Kubayanku Boys (Wellness) with 4 members and 215 activities.
- Recent Activities: 5km Morning Run by Sarah, Yoga Session by Michael, HIIT Training by Alex.
- Suggested Clubs: Yogo Club (Team Bonding), Design Gurus (Creativity).
- Trending Topics: #StepUpForHealth, #MindfulMovement, #LagosRuns, #CleanEating, #TeamHIIT.

When the user asks for advice, provide actionable wellness tips. When they share feelings, be empathetic like a therapist.
Keep your responses concise and conversational.
`;

export async function generateChatResponse(messages: { role: 'user' | 'ai', content: string }[], userName: string) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: MOCK_DATA_CONTEXT + `\nThe user's name is ${userName}.`,
      },
    });

    // Send history
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        await chat.sendMessage({ message: msg.content });
      } else {
        // We can't easily inject AI history in this simple loop without proper history format, 
        // but for simplicity we can just send the last user message.
        // Actually, the SDK supports passing history to create, but let's just send the latest message for now,
        // or format the conversation as a single prompt if needed.
      }
    }

    // A better way is to just send the conversation history as text in the prompt for simplicity,
    // or use the chat session properly.
    const conversation = messages.map(m => `${m.role === 'user' ? 'User' : 'ws-AI'}: ${m.content}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Here is the conversation history:\n${conversation}\n\nws-AI:`,
      config: {
        systemInstruction: MOCK_DATA_CONTEXT + `\nThe user's name is ${userName}.`,
      }
    });

    return response.text || "I'm here to help you with your wellness journey.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
}

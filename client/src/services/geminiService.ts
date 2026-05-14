/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CampusEvent, User, Recommendation } from "../types";
const BACKEND_URL = (import.meta as any).env.VITE_AI_BACKEND_URL || 'http://localhost:5000';

export async function generateEventDescription(title: string, briefPrompt: string): Promise<string> {
  try {
    // In a real implementation, we would also have an endpoint for this,
    // but for now we'll route it through a generic chat if needed or mock it.
    // Assuming backend will handle it or we mock it for now since the user wanted the CHAT to work:
    return "Event descriptions are temporarily disabled while moving to the new AI backend.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating description. Please write manually.";
  }
}

export async function generateEventTags(title: string, description: string): Promise<string[]> {
  try {
    return ["campus", "event"];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

export async function getEventRecommendations(user: User, availableEvents: CampusEvent[]): Promise<Recommendation[]> {
  const eventsContext = availableEvents.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    tags: e.tags
  }));

  try {
    const res = await fetch(`${BACKEND_URL}/api/nexus/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, events: eventsContext })
    });
    
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    return data as Recommendation[];
  } catch (error) {
    console.error("Gemini Error:", error);
    // Simple fallback if AI fails
    return availableEvents.slice(0, 3).map(e => ({
      eventId: e.id,
      score: 0.5,
      reason: "Popular on campus right now!"
    }));
  }
}

export async function chatWithCampusAI(userMessage: string, availableEvents: CampusEvent[], history: any[] = []): Promise<string> {
  // Compress context to absolutely minimize token usage
  const minimalContext = availableEvents
    .slice(0, 20) // Only send the top 20 most relevant/recent events to save tokens
    .map(e => `[${e.id}] ${e.title} (${e.category}) - ${new Date(e.date).toLocaleDateString()}`)
    .join(' | ');

  try {
    const res = await fetch(`${BACKEND_URL}/api/nexus/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: userMessage, 
        history: history,
        context: minimalContext 
      })
    });

    if (!res.ok) throw new Error('Backend chat error');
    const data = await res.json();
    return data.text || "I couldn't process that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CampusEvent, User, Recommendation } from "../types";
// import { GoogleGenAI, Type } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateEventDescription(title: string, briefPrompt: string): Promise<string> {
  try {
    // const response = await ai.models.generateContent({
    //   model: "gemini-3-flash-preview",
    //   contents: `Generate a catchy and informative campus event description for an event titled "${title}". Brief intro: ${briefPrompt}. Keep it under 150 words and engaging for students.`,
    // });
    // return response.text || "No description generated.";
    console.log(`Mock generating description for ${title} with prompt ${briefPrompt}`);
    return "This is a mock event description. The Gemini API is currently disabled.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating description. Please write manually.";
  }
}

export async function generateEventTags(title: string, description: string): Promise<string[]> {
  try {
    // const response = await ai.models.generateContent({
    //   model: "gemini-3-flash-preview",
    //   contents: `Based on the event title "${title}" and description: "${description}", generate 3-5 relevant short tags (single words or short phrases). Return as comma separated values.`,
    // });
    // return response.text?.split(',').map(tag => tag.trim()) || [];
    console.log(`Mock generating tags for ${title}`);
    return ["mock", "tags", "disabled"];
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
    // const response = await ai.models.generateContent({
    //   model: "gemini-3-flash-preview",
    //   contents: `You are an AI campus event recommender.
// User Profile:
// - Major: ${user.major}
// - Interests: ${user.interests?.join(', ')}
// - Roles: ${user.role}
// 
// Available Events:
// ${JSON.stringify(eventsContext)}
// 
// Analyze the user interests and major to recommend the best events.
// Return a JSON array of recommendations.`,
    //   config: {
    //     responseMimeType: "application/json",
    //     responseSchema: {
    //       type: Type.ARRAY,
    //       items: {
    //         type: Type.OBJECT,
    //         properties: {
    //           eventId: { type: Type.STRING },
    //           score: { type: Type.NUMBER, description: "Score from 0 to 1" },
    //           reason: { type: Type.STRING, description: "One sentence why this fits the user" }
    //         },
    //         required: ["eventId", "score", "reason"]
    //       }
    //     }
    //   }
    // });
    // 
    // return JSON.parse(response.text) as Recommendation[];
    console.log(`Mock generating recommendations for ${user.id}`);
    return availableEvents.slice(0, 3).map(e => ({
      eventId: e.id,
      score: 0.5,
      reason: "Popular on campus right now (Mock recommendation)!"
    }));
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

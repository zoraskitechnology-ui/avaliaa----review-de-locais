import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function listModels() {
    try {
        const response = await ai.models.list(); // Or check specific SDK method for listing
        // Note: The new SDK might specific syntax. Let's try to infer or use standard REST call if sdk fails?
        // Actually, let's try to just use the SDK if I can guess the method. 
        // If not, I'll use a simple fetch to the endpoint.

        console.log("Models:", response);
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

// Call listModels to avoid unused-function TypeScript error during workspace tsc
listModels().catch(() => {});

// Fallback using fetch if SDK method is not obvious or fails
async function listModelsRaw() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Raw API Models:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listModelsRaw();

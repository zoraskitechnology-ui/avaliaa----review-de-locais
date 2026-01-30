import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import type { Review, PlaceSuggestion } from '../types/index.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const placeResponseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "O nome do local.",
            },
            location: {
                type: Type.STRING,
                description: "A cidade e estado do local, por exemplo: 'Florianópolis, SC'.",
            },
            address: {
                type: Type.STRING,
                description: "O endereço completo do local."
            },
            latitude: {
                type: Type.NUMBER,
                description: "A latitude do local."
            },
            longitude: {
                type: Type.NUMBER,
                description: "A longitude do local."
            }
        },
        required: ["name", "location", "address", "latitude", "longitude"],
    },
};

export const getPlaceSuggestions = async (category: string, lat: number, lon: number): Promise<PlaceSuggestion[]> => {
    console.log(`[Gemini] Requesting suggestions for: ${category} at ${lat}, ${lon}`);
    const prompt = `Liste até 15 locais populares de "${category}" em um raio de 25km da latitude ${lat} e longitude ${lon} no Brasil. 
            IMPORTANTE: Forneça coordenadas geográficas (latitude e longitude) EXTREMAMENTE PRECISAS, pois elas serão usadas para navegação GPS (Google Maps/Waze). 
            O endereço deve ser o mais completo possível, incluindo rua, número, bairro, cidade, estado e CEP, se disponível.`;

    try {
        const startTime = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: placeResponseSchema,
            },
        });
        console.log(`[Gemini] Response received in ${Date.now() - startTime}ms`);

        const jsonText = response.text?.trim();
        if (!jsonText) {
            console.error("Gemini API returned an empty response for place suggestions.");
            return [];
        }
        const suggestions = JSON.parse(jsonText);
        return suggestions;
    } catch (error: any) {
        console.error("Error fetching place suggestions from Gemini:", error);
        if (error.response) {
            console.error("Gemini API Error Response:", JSON.stringify(error.response, null, 2));
        }
        // Fallback for demo purposes if API fails (optional, good for dev)
        // return [];
        throw new Error("Não foi possível obter sugestões de locais.");
    }
};

export const getPlaceSuggestionsByLocationString = async (category: string, locationString: string): Promise<PlaceSuggestion[]> => {
    console.log(`[Gemini] Requesting suggestions for: ${category} near: ${locationString}`);
    const prompt = `Liste até 15 locais populares de "${category}" perto de "${locationString}" no Brasil, idealmente em um raio de 25km. 
            IMPORTANTE: Forneça coordenadas geográficas (latitude e longitude) EXTREMAMENTE PRECISAS, pois elas serão usadas para navegação GPS (Google Maps/Waze). 
            O endereço deve ser o mais completo possível, incluindo rua, número, bairro, cidade, estado e CEP, se disponível.`;

    try {
        const startTime = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: placeResponseSchema,
            },
        });
        console.log(`[Gemini] Response received in ${Date.now() - startTime}ms`);

        const jsonText = response.text?.trim();
        if (!jsonText) {
            console.error("Gemini API returned an empty response for place suggestions by location string.");
            return [];
        }
        const suggestions = JSON.parse(jsonText);
        return suggestions;
    } catch (error) {
        console.error("Error fetching place suggestions by location string from Gemini:", error);
        throw new Error("Não foi possível obter sugestões de locais para a localização informada.");
    }
};

export const searchForPlace = async (query: string, lat: number, lon: number): Promise<PlaceSuggestion[]> => {
    console.log(`[Gemini] Searching for: ${query} at ${lat}, ${lon}`);
    const prompt = `Encontre até 15 locais que correspondam à busca por "${query}" em um raio de 25km da latitude ${lat} e longitude ${lon} no Brasil. 
            IMPORTANTE: Forneça coordenadas geográficas (latitude e longitude) EXTREMAMENTE PRECISAS, pois elas serão usadas para navegação GPS (Google Maps/Waze). 
            O endereço deve ser o mais completo possível, incluindo rua, número, bairro, cidade, estado e CEP, se disponível.`;

    try {
        const startTime = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: placeResponseSchema,
            },
        });
        console.log(`[Gemini] Response received in ${Date.now() - startTime}ms`);

        const jsonText = response.text?.trim();
        if (!jsonText) {
            console.error("Gemini API returned an empty response for place search.");
            return [];
        }
        const searchResults = JSON.parse(jsonText);
        return searchResults;
    } catch (error) {
        console.error("Error searching for place with Gemini:", error);
        throw new Error("Não foi possível buscar pelo local.");
    }
};

export const searchForPlaceByLocationString = async (query: string, locationString: string): Promise<PlaceSuggestion[]> => {
    console.log(`[Gemini] Searching for: ${query} near: ${locationString}`);
    const prompt = `Encontre até 15 locais que correspondam à busca por "${query}" perto de "${locationString}" no Brasil, idealmente em um raio de 25km. 
            IMPORTANTE: Forneça coordenadas geográficas (latitude e longitude) EXTREMAMENTE PRECISAS, pois elas serão usadas para navegação GPS (Google Maps/Waze). 
            O endereço deve ser o mais completo possível, incluindo rua, número, bairro, cidade, estado e CEP, se disponível.`;

    try {
        const startTime = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: placeResponseSchema,
            },
        });
        console.log(`[Gemini] Response received in ${Date.now() - startTime}ms`);

        const jsonText = response.text?.trim();
        if (!jsonText) {
            console.error("Gemini API returned an empty response for place search by location string.");
            return [];
        }
        const searchResults = JSON.parse(jsonText);
        return searchResults;
    } catch (error) {
        console.error("Error searching for place by location string with Gemini:", error);
        throw new Error("Não foi possível buscar pelo local na localização informada.");
    }
};

export const summarizeReviews = async (reviews: Review[]): Promise<string> => {
    if (reviews.length === 0) {
        return "Nenhuma avaliação ainda para gerar um resumo.";
    }

    const reviewsText = reviews.map(r => `- ${r.comment}`).join('\n');
    const prompt = `Com base nas seguintes avaliações de usuários, crie um resumo conciso e útil de um parágrafo sobre a experiência geral neste local. Destaque os pontos positivos e negativos mais comuns. As avaliações são:\n${reviewsText}`;

    try {
        console.log(`[Gemini] Summarizing ${reviews.length} reviews`);
        const startTime = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        console.log(`[Gemini] Summary received in ${Date.now() - startTime}ms`);

        return response.text ?? "Não foi possível gerar o resumo das avaliações.";
    } catch (error) {
        console.error("Error summarizing reviews with Gemini:", error);
        throw new Error("Não foi possível gerar o resumo das avaliações.");
    }
};

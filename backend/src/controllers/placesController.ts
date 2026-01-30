import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import * as geminiService from '../services/geminiService.js';

// Função auxiliar para calcular distância
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const getAllPlaces = async (_req: AuthRequest, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('places')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Get all places error:', error);
        res.status(500).json({ error: 'Erro ao buscar locais' });
    }
};

export const getPlaceById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { data: place, error: placeError } = await supabase
            .from('places')
            .select('*')
            .eq('id', id)
            .single();

        if (placeError || !place) {
            return res.status(404).json({ error: 'Local não encontrado' });
        }

        // Buscar reviews do local
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
        *,
        photos (*)
      `)
            .eq('place_id', id)
            .order('created_at', { ascending: false });

        if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError);
        }

        // Gerar resumo AI se houver reviews
        let aiSummary = 'Nenhuma avaliação ainda para gerar um resumo.';
        if (reviews && reviews.length > 0) {
            try {
                aiSummary = await geminiService.summarizeReviews(reviews);
            } catch (error) {
                console.error('Error generating AI summary:', error);
            }
        }

        res.json({
            ...place,
            reviews: reviews || [],
            aiSummary,
        });
    } catch (error) {
        console.error('Get place by id error:', error);
        res.status(500).json({ error: 'Erro ao buscar local' });
    }
};

export const createPlace = async (req: AuthRequest, res: Response) => {
    try {
        const { name, location, address, latitude, longitude, category } = req.body;

        if (!name || !location) {
            return res.status(400).json({ error: 'Nome e localização são obrigatórios' });
        }

        const { data, error } = await supabase
            .from('places')
            .insert({
                name,
                location,
                address,
                latitude,
                longitude,
                category,
                created_by: req.user?.id,
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Create place error:', error);
        res.status(500).json({ error: 'Erro ao criar local' });
    }
};

export const searchPlaces = async (req: AuthRequest, res: Response) => {
    try {
        const { category, query, lat, lon, locationString } = req.query;

        let suggestions;

        if (category && lat && lon) {
            // Buscar por categoria com coordenadas
            suggestions = await geminiService.getPlaceSuggestions(
                category as string,
                parseFloat(lat as string),
                parseFloat(lon as string)
            );
        } else if (category && locationString) {
            // Buscar por categoria com string de localização
            suggestions = await geminiService.getPlaceSuggestionsByLocationString(
                category as string,
                locationString as string
            );
        } else if (query && lat && lon) {
            // Buscar por query com coordenadas
            suggestions = await geminiService.searchForPlace(
                query as string,
                parseFloat(lat as string),
                parseFloat(lon as string)
            );
        } else if (query && locationString) {
            // Buscar por query com string de localização
            suggestions = await geminiService.searchForPlaceByLocationString(
                query as string,
                locationString as string
            );
        } else {
            return res.status(400).json({
                error: 'Parâmetros inválidos. Forneça category ou query com lat/lon ou locationString'
            });
        }

        // Processar e ordenar por distância se houver coordenadas do usuário
        let processedPlaces = suggestions.map((p, index) => ({
            id: `temp-${p.name}-${index}`,
            name: p.name,
            location: p.location,
            address: p.address,
            latitude: p.latitude,
            longitude: p.longitude,
            reviews: [],
            aiSummary: 'Nenhuma avaliação ainda para gerar um resumo.',
        }));

        if (lat && lon) {
            const userLat = parseFloat(lat as string);
            const userLon = parseFloat(lon as string);

            processedPlaces = processedPlaces
                .map(p => ({
                    ...p,
                    distance: calculateDistance(userLat, userLon, p.latitude, p.longitude)
                }))
                .sort((a, b) => a.distance - b.distance);
        }

        res.json(processedPlaces);
    } catch (error: any) {
        console.error('Search places error:', error);
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({
            error: 'Erro ao buscar locais',
            details: error.message
        });
    }
};

export const getPlaceReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        photos (*),
        profiles (username, full_name, avatar_url)
      `)
            .eq('place_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Get place reviews error:', error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
};

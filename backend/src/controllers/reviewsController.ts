import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const { place_id, accessibility, infrastructure, value, comment, photos } = req.body;

        if (!place_id || !accessibility || !infrastructure || !value || !comment) {
            return res.status(400).json({
                error: 'place_id, accessibility, infrastructure, value e comment são obrigatórios'
            });
        }

        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Criar review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert({
                place_id,
                user_id: req.user.id,
                accessibility,
                infrastructure,
                value,
                comment,
            })
            .select()
            .single();

        if (reviewError) {
            return res.status(400).json({ error: reviewError.message });
        }

        // Adicionar fotos se fornecidas
        if (photos && photos.length > 0) {
            const photoInserts = photos.map((url: string) => ({
                review_id: review.id,
                url,
            }));

            const { error: photosError } = await supabase
                .from('photos')
                .insert(photoInserts);

            if (photosError) {
                console.error('Error inserting photos:', photosError);
            }
        }

        // Buscar review completa com fotos
        const { data: fullReview } = await supabase
            .from('reviews')
            .select(`
        *,
        photos (*)
      `)
            .eq('id', review.id)
            .single();

        res.status(201).json(fullReview);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { accessibility, infrastructure, value, comment } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Verificar se a review pertence ao usuário
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingReview) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        if (existingReview.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Você não tem permissão para editar esta avaliação' });
        }

        // Atualizar review
        const { data, error } = await supabase
            .from('reviews')
            .update({
                accessibility,
                infrastructure,
                value,
                comment,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select(`
        *,
        photos (*)
      `)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ error: 'Erro ao atualizar avaliação' });
    }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Verificar se a review pertence ao usuário
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingReview) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        if (existingReview.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Você não tem permissão para deletar esta avaliação' });
        }

        // Deletar review (fotos serão deletadas automaticamente por CASCADE)
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Avaliação deletada com sucesso' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Erro ao deletar avaliação' });
    }
};

export const addPhotosToReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { photos } = req.body;

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ error: 'Forneça um array de URLs de fotos' });
        }

        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Verificar se a review pertence ao usuário
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingReview) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        if (existingReview.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Você não tem permissão para adicionar fotos a esta avaliação' });
        }

        // Adicionar fotos
        const photoInserts = photos.map((url: string) => ({
            review_id: id,
            url,
        }));

        const { data, error } = await supabase
            .from('photos')
            .insert(photoInserts)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Add photos error:', error);
        res.status(500).json({ error: 'Erro ao adicionar fotos' });
    }
};

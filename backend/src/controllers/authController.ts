import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, username, full_name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        if (!authData.user) {
            return res.status(400).json({ error: 'Falha ao criar usuário' });
        }

        // Atualizar perfil
        if (username || full_name) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username,
                    full_name,
                })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Error updating profile:', profileError);
            }
        }

        res.status(201).json({
            user: authData.user,
            session: authData.session,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({
            user: data.user,
            session: data.session,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

export const logout = async (_req: Request, res: Response) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Erro ao fazer logout' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // Buscar perfil completo
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        res.json({
            user,
            profile,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};

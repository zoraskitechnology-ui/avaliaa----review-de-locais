# Deploy do Backend na Vercel - Guia Rápido

## 🚀 Passos para Deploy

### 1. Instalar Vercel CLI (se necessário)

Você pode usar `npx` sem instalar globalmente:

```bash
npx vercel
```

Ou instalar globalmente (requer senha sudo):

```bash
sudo npm install -g vercel
```

### 2. Fazer Login na Vercel

```bash
npx vercel login
```

Escolha uma opção de login:
- Email
- GitHub
- GitLab
- Bitbucket

### 3. Deploy do Backend

No diretório do backend:

```bash
cd backend
npx vercel --prod
```

Durante o processo, responda:

1. **Set up and deploy?** → Yes
2. **Which scope?** → Escolha sua conta
3. **Link to existing project?** → No
4. **Project name?** → `borali-backend` (ou outro nome)
5. **Directory?** → `.` (diretório atual)
6. **Override settings?** → No

### 4. Configurar Variáveis de Ambiente

Após o deploy, você precisa adicionar as variáveis de ambiente:

```bash
npx vercel env add GEMINI_API_KEY
```

Cole a chave: `AIzaSyDC8YIFQi4aq5rDY-_Sc69SdAwJIsMj6DU`

Repita para as outras variáveis:

```bash
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 5. Redeploy com as Variáveis

```bash
npx vercel --prod
```

### 6. Obter a URL

A Vercel fornecerá uma URL como:
```
https://borali-backend-xxx.vercel.app
```

**Anote esta URL!** Você precisará dela para configurar o app.

---

## ✅ Arquivos Já Preparados

Eu já criei/modifiquei:
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `src/server.ts` - Atualizado para Vercel serverless
- ✅ CORS configurado para aceitar todas as origens

---

## 🔄 Próximos Passos Após Deploy

1. Copiar a URL fornecida pela Vercel
2. Atualizar `services/geminiService.ts` no frontend com a nova URL
3. Fazer build do app Android
4. Gerar AAB assinado

---

## 🆘 Problemas Comuns

**Erro de permissão ao instalar Vercel:**
- Use `npx vercel` em vez de instalar globalmente

**Deploy falha:**
- Verifique se `vercel.json` está no diretório backend
- Confirme que todas as dependências estão em `package.json`

**API não responde:**
- Verifique se as variáveis de ambiente foram adicionadas
- Teste a URL: `https://sua-url.vercel.app/api/health`

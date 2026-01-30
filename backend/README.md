# AvaliaAí Backend API

API REST para o aplicativo AvaliaAí - plataforma de reviews de locais.

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **Supabase** - Banco de dados PostgreSQL + Autenticação
- **TypeScript** - Tipagem estática
- **Gemini AI** - Geração de sugestões e resumos

## 📦 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Preencha as variáveis de ambiente no arquivo `.env`:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
GEMINI_API_KEY=sua-chave-gemini
PORT=3001
NODE_ENV=development
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

A API estará disponível em `http://localhost:3001`

## 📚 Endpoints da API

### Health Check
```
GET /api/health
```
Verifica se a API está funcionando.

---

### Autenticação

#### Criar Conta
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123",
  "username": "usuario",
  "full_name": "Nome Completo"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

Retorna:
```json
{
  "user": { ... },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {access_token}
```

#### Obter Usuário Atual
```
GET /api/auth/me
Authorization: Bearer {access_token}
```

---

### Locais (Places)

#### Listar Todos os Locais
```
GET /api/places
```

#### Buscar Locais (com Gemini AI)
```
GET /api/places/search?category=Praias&lat=-27.5954&lon=-48.5480
GET /api/places/search?query=restaurante&lat=-27.5954&lon=-48.5480
GET /api/places/search?category=Praias&locationString=Florianópolis, SC
```

Parâmetros:
- `category` - Categoria do local (ex: "Praias", "Restaurantes")
- `query` - Busca livre
- `lat` e `lon` - Coordenadas do usuário
- `locationString` - Localização em texto (ex: "São Paulo, SP")

#### Obter Local Específico
```
GET /api/places/:id
```

Retorna o local com todas as reviews e resumo AI.

#### Criar Novo Local
```
POST /api/places
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Praia da Joaquina",
  "location": "Florianópolis, SC",
  "address": "Av. Pequeno Príncipe, Florianópolis",
  "latitude": -27.6289,
  "longitude": -48.4469,
  "category": "Praias"
}
```

#### Obter Reviews de um Local
```
GET /api/places/:id/reviews
```

---

### Reviews

#### Criar Review
```
POST /api/reviews
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "place_id": "uuid-do-local",
  "accessibility": 4,
  "infrastructure": 5,
  "value": 3,
  "comment": "Lugar incrível! Muito bem cuidado.",
  "photos": [
    "https://exemplo.com/foto1.jpg",
    "https://exemplo.com/foto2.jpg"
  ]
}
```

Notas:
- `accessibility`, `infrastructure`, `value`: valores de 1 a 5
- `photos`: array de URLs (opcional)

#### Atualizar Review
```
PUT /api/reviews/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accessibility": 5,
  "infrastructure": 4,
  "value": 4,
  "comment": "Comentário atualizado"
}
```

#### Deletar Review
```
DELETE /api/reviews/:id
Authorization: Bearer {access_token}
```

#### Adicionar Fotos a uma Review
```
POST /api/reviews/:id/photos
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "photos": [
    "https://exemplo.com/foto3.jpg"
  ]
}
```

---

## 🔒 Autenticação

A maioria dos endpoints requer autenticação via JWT. Após fazer login, inclua o token no header:

```
Authorization: Bearer {access_token}
```

Endpoints públicos (não requerem autenticação):
- `GET /api/health`
- `GET /api/places`
- `GET /api/places/search`
- `GET /api/places/:id`
- `GET /api/places/:id/reviews`

Endpoints que requerem autenticação:
- Todos os endpoints de `/api/auth` (exceto signup e login)
- `POST /api/places`
- Todos os endpoints de `/api/reviews`

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `profiles`
- `id` (UUID) - ID do usuário (referência para auth.users)
- `username` (TEXT) - Nome de usuário único
- `full_name` (TEXT) - Nome completo
- `avatar_url` (TEXT) - URL do avatar
- `created_at`, `updated_at` (TIMESTAMP)

#### `places`
- `id` (UUID) - ID do local
- `name` (TEXT) - Nome do local
- `location` (TEXT) - Cidade e estado
- `address` (TEXT) - Endereço completo
- `latitude`, `longitude` (DECIMAL) - Coordenadas
- `category` (TEXT) - Categoria
- `created_by` (UUID) - ID do criador
- `created_at`, `updated_at` (TIMESTAMP)

#### `reviews`
- `id` (UUID) - ID da review
- `place_id` (UUID) - ID do local
- `user_id` (UUID) - ID do usuário
- `accessibility` (INTEGER 1-5) - Nota de acessibilidade
- `infrastructure` (INTEGER 1-5) - Nota de infraestrutura
- `value` (INTEGER 1-5) - Nota de custo-benefício
- `comment` (TEXT) - Comentário
- `created_at`, `updated_at` (TIMESTAMP)

#### `photos`
- `id` (UUID) - ID da foto
- `review_id` (UUID) - ID da review
- `url` (TEXT) - URL da foto
- `created_at` (TIMESTAMP)

---

## 🛡️ Segurança (RLS)

O banco de dados usa Row Level Security (RLS) do Supabase:

- **Profiles**: Todos podem ler, apenas o próprio usuário pode atualizar
- **Places**: Todos podem ler, usuários autenticados podem criar
- **Reviews**: Todos podem ler, usuários autenticados podem criar, apenas o autor pode editar/deletar
- **Photos**: Todos podem ler, apenas o autor da review pode adicionar/remover

---

## 📝 Exemplos de Uso

### Fluxo Completo

1. **Criar conta**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"bruno@example.com","password":"senha123","username":"bruno"}'
```

2. **Fazer login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bruno@example.com","password":"senha123"}'
```

3. **Buscar locais**
```bash
curl "http://localhost:3001/api/places/search?category=Praias&lat=-27.5954&lon=-48.5480"
```

4. **Criar review**
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id":"uuid-do-local",
    "accessibility":5,
    "infrastructure":4,
    "value":4,
    "comment":"Praia linda!"
  }'
```

---

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se de que o frontend está rodando em `http://localhost:5173`. Se estiver em outra porta, atualize o CORS em `src/server.ts`.

### Erro de autenticação
Verifique se:
1. O token JWT está sendo enviado corretamente no header
2. O token não expirou (validade de 1 hora)
3. As credenciais do Supabase estão corretas no `.env`

### Erro do Gemini
Verifique se a chave da API Gemini está correta no `.env`.

---

## 📄 Licença

MIT

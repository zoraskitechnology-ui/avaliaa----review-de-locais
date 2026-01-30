
# AvaliaAí - App de Review de Locais

Este é um aplicativo para avaliar locais com base na experiência do usuário, como acessibilidade, infraestrutura e custo-benefício, com resumos e sugestões gerados pela API do Gemini.

## Configuração do Projeto

### 1. Instalar Dependências
Para começar, você precisa instalar todas as dependências do projeto. Abra seu terminal na pasta do projeto e rode o comando:
```bash
npm install
```

### 2. Configurar a Chave de API do Gemini
Para que o aplicativo possa fazer chamadas à API do Gemini, você precisa fornecer sua chave de API.

1.  Crie um arquivo chamado `.env` na pasta principal do projeto (no mesmo nível do `package.json`).
2.  Dentro do arquivo `.env`, adicione a seguinte linha, substituindo `SUA_CHAVE_API_AQUI` pela sua chave real:

    ```
    VITE_GEMINI_API_KEY=SUA_CHAVE_API_AQUI
    ```

**Importante:** O prefixo `VITE_` é necessário para que a chave fique acessível no seu aplicativo.

## Como Rodar Localmente (Desenvolvimento)

Após instalar as dependências e configurar a chave de API, você pode iniciar o servidor de desenvolvimento local com o comando:

```bash
npm run dev
```

Isso iniciará o aplicativo em um endereço local, geralmente `http://localhost:5173`.

## Como Publicar na Hostinger

Para hospedar seu aplicativo na Hostinger, você precisa gerar os arquivos estáticos de produção.

### Passo 1: Gerar os Arquivos de Produção (Build)

No seu terminal, rode o seguinte comando:

```bash
npm run build
```

Este comando irá criar uma nova pasta chamada `dist` no seu projeto. Dentro desta pasta estarão os arquivos `index.html`, CSS e JavaScript otimizados e prontos para produção.

### Passo 2: Enviar os Arquivos para a Hostinger

1.  Acesse o painel de controle da sua hospedagem na Hostinger.
2.  Abra o **Gerenciador de Arquivos**.
3.  Navegue até a pasta `public_html`. Esta é a pasta raiz do seu site.
4.  **Importante:** Faça o upload do **CONTEÚDO** da pasta `dist` (NÃO a pasta `dist` em si) para dentro da `public_html`. Os arquivos que você deve enviar são `index.html`, a pasta `assets`, e quaisquer outros arquivos que estiverem dentro de `dist`.

Pronto! Após o upload, seu site estará no ar e funcionando.

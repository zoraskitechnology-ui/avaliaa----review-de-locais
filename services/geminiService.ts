
const API_URL = 'http://localhost:3001/api';

export const getPlaceSuggestions = async (category: string, lat: number, lon: number) => {
  const url = `${API_URL}/places/search?category=${encodeURIComponent(category)}&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao buscar sugestões.');
    return await response.json();
  } catch (error) {
    console.error("Backend API Error (Suggestions):", error);
    throw error;
  }
};

export const getPlaceSuggestionsByLocationString = async (category: string, locationString: string) => {
  const url = `${API_URL}/places/search?category=${encodeURIComponent(category)}&locationString=${encodeURIComponent(locationString)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao buscar sugestões nesta região.');
    return await response.json();
  } catch (error) {
    console.error("Backend API Error (Suggestions By Loc):", error);
    throw error;
  }
};

export const searchForPlace = async (query: string, lat: number, lon: number) => {
  const url = `${API_URL}/places/search?query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na busca.');
    return await response.json();
  } catch (error) {
    console.error("Backend API Error (Search):", error);
    throw error;
  }
};

export const searchForPlaceByLocationString = async (query: string, locationString: string) => {
  const url = `${API_URL}/places/search?query=${encodeURIComponent(query)}&locationString=${encodeURIComponent(locationString)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na busca regional.');
    return await response.json();
  } catch (error) {
    console.error("Backend API Error (Search By Loc):", error);
    throw error;
  }
};

// No frontend, o resumo agora vem como parte do objeto do local ou pode ser disparado separadamente
// se houver uma rota para isso. Como o resumo atual é gerado no backend ao buscar por ID,
// podemos deixar esta função como um placeholder ou implementar se houver rota de resumo.
export const summarizeReviews = async (_reviews: any[]): Promise<string> => {
  // O resumo agora é gerado automaticamente pelo backend no endpoint GET /places/:id
  return "Resumo disponível nos detalhes do local.";
};

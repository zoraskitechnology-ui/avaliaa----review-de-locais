
import React, { useState, useCallback, useEffect } from 'react';
import { Place, Review, Subcategory } from './types';
import { CATEGORIES } from './constants';
import { getPlaceSuggestions, summarizeReviews, searchForPlace, getPlaceSuggestionsByLocationString, searchForPlaceByLocationString } from './services/geminiService';
import CategorySelector from './components/CategorySelector';
import PlaceList from './components/PlaceList';
import PlaceDetail from './components/PlaceDetail';
import { LoadingSpinner, BackArrowIcon, XCircleIcon, SearchIcon } from './components/icons';

type GeolocationStatus = 'loading' | 'success' | 'error';

// Imagem de fundo moderna e natural
const backgroundImageUrl = "/nature_bg.png";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const LocationStatusBanner: React.FC<{ status: GeolocationStatus, error: string | null, onRetry: () => void, onManual: () => void, onClose: () => void }> = ({ status, error, onRetry, onManual, onClose }) => {
  if (status === 'loading') {
    return (
      <div className="glass-light p-4 rounded-2xl mb-8 flex items-center justify-center animate-pulse border border-white/5">
        <LoadingSpinner />
        <span className="ml-4 text-gray-300 font-medium">Sintonizando sua localização para encontrar lugares incríveis...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="glass border-red-500/30 p-4 md:p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden animate-fade-in" role="alert">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
          title="Fechar"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500 mr-3 animate-ping"></span>
            <strong className="text-red-300 text-lg font-bold">Quase lá! Só um detalhe na localização</strong>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-2xl">
            {error || "Não conseguimos te encontrar automaticamente por conta do seu dispositivo ou navegador."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <button
            onClick={onManual}
            className="px-6 py-3 rounded-full text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
          >
            Informar Cidade
          </button>
          <button
            onClick={onRetry}
            className="btn-primary px-6 py-3 text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const ManualLocationModal: React.FC<{ onSubmit: (location: string) => void; onCancel: () => void; }> = ({ onSubmit, onCancel }) => {
  const [locationInput, setLocationInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      onSubmit(locationInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-scale-in">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
          <XCircleIcon />
        </button>
        <h3 className="text-3xl font-extrabold mb-4 text-gradient-primary">Onde você está?</h3>
        <p className="text-gray-300 mb-8 text-lg">Informe sua cidade para que possamos sugerir os melhores lugares ao seu redor.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Ex: Florianópolis, SC"
              className="block w-full p-4 text-lg text-white border border-white/10 rounded-2xl bg-white/5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500 transition-all"
              autoFocus
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 px-6 rounded-full text-sm font-bold text-gray-400 hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-3 btn-primary px-8 py-4 text-lg shadow-teal-500/20"
            >
              Explorar Agora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<GeolocationStatus>('loading');
  const [isAskingForLocation, setIsAskingForLocation] = useState<boolean>(false);
  const [pendingSearch, setPendingSearch] = useState<{ type: 'category' | 'search'; payload: Subcategory | string } | null>(null);

  const fetchIPLocation = async () => {
    try {
      // Usando ipapi.co que costuma ter melhor suporte a CORS para localhost
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return { lat: data.latitude, lon: data.longitude };
      }
    } catch (err) {
      console.warn("IP Geoloc failure:", err);
    }
    // Fallback padrão para Florianópolis
    return { lat: -27.5948, lon: -48.5482 };
  };

  const requestLocation = useCallback(async () => {
    setLocationStatus('loading');
    setLocationError(null);

    // Etapa 1: Obter localização via IP imediatamente (não pede permissão)
    const baselineLocation = await fetchIPLocation();
    setLocation(baselineLocation);
    setLocationStatus('success');

    // Etapa 2: Tentar obter localização precisa em segundo plano
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.warn("Navegador não forneceu local preciso, mantendo IP/Fallback:", error.message);
          // NUNCA definimos 'error' aqui para evitar que o banner apareça
          // O app continua funcionando com a localização obtida via IP ou o fallback de Floripa
          setLocationStatus('success');
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 60000,
        }
      );
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const processAndSortPlaces = useCallback((placesData: any[], userLocation: { lat: number; lon: number } | null) => {
    const commonProcessing = (p: any, index: number) => ({
      id: `${p.name}-${index}`,
      name: p.name,
      location: p.location,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      reviews: [],
      aiSummary: 'Nenhuma avaliação ainda para gerar um resumo.',
    });

    if (!userLocation) {
      return placesData.map(commonProcessing);
    }

    const placesWithDistance = placesData
      .map(p => ({
        ...p,
        distance: calculateDistance(userLocation.lat, userLocation.lon, p.latitude, p.longitude)
      }))
      .sort((a, b) => a.distance - b.distance);

    return placesWithDistance.map((p, index) => ({
      ...commonProcessing(p, index),
      distance: p.distance,
    }));
  }, []);

  const handleSelectSubcategory = useCallback(async (subcategory: Subcategory) => {
    if (locationStatus !== 'success' || !location) {
      setPendingSearch({ type: 'category', payload: subcategory });
      setIsAskingForLocation(true);
      return;
    }
    setSelectedSubcategory(subcategory);
    setSearchQuery('');
    setIsLoading(true);
    setError(null);
    try {
      const suggestedPlaces = await getPlaceSuggestions(subcategory.name, location.lat, location.lon);
      const processedPlaces = processAndSortPlaces(suggestedPlaces, location);
      setPlaces(processedPlaces);
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar sugestões de locais. Verifique sua chave de API e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [location, locationStatus, processAndSortPlaces]);

  const handleSearch = useCallback(async (query: string) => {
    if (locationStatus !== 'success' || !location) {
      setPendingSearch({ type: 'search', payload: query });
      setIsAskingForLocation(true);
      return;
    }
    if (!query) return;

    setSearchQuery(query);
    setSelectedSubcategory(null);
    setIsLoading(true);
    setError(null);
    try {
      const searchedPlaces = await searchForPlace(query, location.lat, location.lon);
      const processedPlaces = processAndSortPlaces(searchedPlaces, location);
      setPlaces(processedPlaces);
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar pelo local. Verifique sua chave de API e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [location, locationStatus, processAndSortPlaces]);

  const handleManualLocationSubmit = async (locationString: string) => {
    if (!pendingSearch) return;

    const { type, payload } = pendingSearch;
    setIsAskingForLocation(false);
    setIsLoading(true);
    setError(null);

    try {
      let foundPlaces;
      if (type === 'category') {
        const subcategory = payload as Subcategory;
        setSelectedSubcategory(subcategory);
        setSearchQuery('');
        foundPlaces = await getPlaceSuggestionsByLocationString(subcategory.name, locationString);
      } else {
        const query = payload as string;
        setSearchQuery(query);
        setSelectedSubcategory(null);
        foundPlaces = await searchForPlaceByLocationString(query, locationString);
      }
      const processedPlaces = processAndSortPlaces(foundPlaces, null);
      setPlaces(processedPlaces);
      // Clear location error since user provided a manual one
      setLocationStatus('success');
      setLocationError(null);
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar locais com a localização informada. Verifique sua chave de API e tente novamente.');
    } finally {
      setIsLoading(false);
      setPendingSearch(null);
    }
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleBack = () => {
    if (selectedPlace) {
      setSelectedPlace(null);
    } else if (selectedSubcategory || searchQuery) {
      setSelectedSubcategory(null);
      setSearchQuery('');
      setPlaces([]);
      setError(null);
    }
  };

  const handleAddReview = async (placeId: string, newReview: Omit<Review, 'id' | 'author'>) => {
    const reviewWithId: Review = {
      ...newReview,
      id: Date.now(),
      author: 'Anônimo',
      photos: newReview.photos || []
    };
    let updatedPlaces = [...places];
    const placeIndex = updatedPlaces.findIndex(p => p.id === placeId);

    if (placeIndex !== -1) {
      const updatedPlace = { ...updatedPlaces[placeIndex], reviews: [reviewWithId, ...updatedPlaces[placeIndex].reviews] };
      updatedPlaces[placeIndex] = updatedPlace;
      setPlaces(updatedPlaces);
      setSelectedPlace(updatedPlace);
      try {
        const summary = await summarizeReviews(updatedPlace.reviews);
        const finalUpdatedPlace = { ...updatedPlace, aiSummary: summary };
        updatedPlaces[placeIndex] = finalUpdatedPlace;
        setPlaces([...updatedPlaces]);
        setSelectedPlace(finalUpdatedPlace);
      } catch (err) {
        console.error("Failed to update AI summary:", err);
        const placeWithErrorSummary = { ...updatedPlace, aiSummary: "Erro ao atualizar o resumo." };
        updatedPlaces[placeIndex] = placeWithErrorSummary;
        setPlaces([...updatedPlaces]);
        setSelectedPlace(placeWithErrorSummary);
      }
    }
  };

  const getListTitle = () => {
    const locationText = (locationStatus === 'success' && location) ? " perto de você" : "";
    if (searchQuery) return `Resultados para "${searchQuery}"${locationText}`;
    if (selectedSubcategory) return `Sugestões de ${selectedSubcategory.name}${locationText}`;
    return "Resultados";
  }

  const renderMainContent = () => {
    if (isLoading) {
      return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-4 text-lg">Buscando locais incríveis...</p></div>;
    }
    if (error && !places.length) {
      return <div className="text-center p-8 text-red-400"><h2 className="text-2xl font-bold mb-4">Ocorreu um erro</h2><p>{error}</p></div>;
    }
    if (selectedPlace) return <PlaceDetail place={selectedPlace} onSubmitReview={handleAddReview} />;
    if (selectedSubcategory || searchQuery) return <PlaceList places={places} onSelectPlace={handleSelectPlace} title={getListTitle()} />;
    return <CategorySelector categories={CATEGORIES} onSelectSubcategory={handleSelectSubcategory} onSearch={handleSearch} />;
  }

  const getTitle = () => {
    if (selectedPlace) return selectedPlace.name;
    if (searchQuery) return `Busca: ${searchQuery}`;
    if (selectedSubcategory) return `Explorando ${selectedSubcategory.name}`;
    return "BoraAli";
  }

  return (
    <div className="relative min-h-screen text-white flex flex-col">
      {isAskingForLocation && <ManualLocationModal onSubmit={handleManualLocationSubmit} onCancel={() => setIsAskingForLocation(false)} />}
      <div className="fixed inset-0 z-[-1]">
        <img
          src={backgroundImageUrl}
          alt="Paisagem natural deslumbrante"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-gray-900"></div> {/* Advanced Overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px]"></div> {/* Subtle Blur */}
      </div>

      <header className="sticky top-0 z-10 glass-light shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Back button and Title */}
            <div className="flex items-center min-w-0 flex-1">
              {(selectedSubcategory || selectedPlace || searchQuery) && (
                <button
                  onClick={handleBack}
                  className="mr-3 p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 flex-shrink-0"
                  aria-label="Voltar"
                >
                  <BackArrowIcon />
                </button>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gradient-vibrant truncate">
                {getTitle()}
              </h1>
            </div>

            {/* Right side: Search bar */}
            {!selectedPlace && (
              <div className="flex-shrink-0 w-full sm:w-auto sm:max-w-xs md:max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar..."
                    className="block w-full py-2 pl-10 pr-4 text-sm text-white border border-white/20 rounded-full glass-light focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-400 transition-all duration-300"
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:py-16 flex-grow relative z-10">
        {!selectedPlace && locationStatus === 'error' && (
          <LocationStatusBanner
            status={locationStatus}
            error={locationError}
            onRetry={requestLocation}
            onManual={() => {
              setPendingSearch({ type: 'search', payload: '' });
              setIsAskingForLocation(true);
            }}
            onClose={() => {
              setLocationStatus('success');
              setLocationError(null);
            }}
          />
        )}
        <div className="animate-fade-in-up">
          {renderMainContent()}
        </div>
      </main>
      <footer className="glass-light border-t border-white/5 py-12 px-4 relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-bold text-gradient-vibrant mb-2">BoraAli</h2>
            <p className="text-gray-400 text-sm text-center md:text-left">Sua voz ajuda a construir lugares melhores para todos.</p>
          </div>
          <div className="flex gap-6">
            <span className="text-gray-500 hover:text-teal-400 cursor-pointer transition-colors">Sobre</span>
            <span className="text-gray-500 hover:text-teal-400 cursor-pointer transition-colors">Termos</span>
            <span className="text-gray-500 hover:text-teal-400 cursor-pointer transition-colors">Privacidade</span>
          </div>
          <p className="text-gray-500 text-xs">© 2026 BoraAli. Desenvolvido com React & Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

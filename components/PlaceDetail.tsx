
import React from 'react';
import { Place, Review } from '../types';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import { QuoteIcon, AccessibilityIcon, InfrastructureIcon, ValueIcon, UserIcon, LocationIcon, DirectionsIcon } from './icons';

interface PlaceDetailProps {
  place: Place;
  onSubmitReview: (placeId: string, newReview: Omit<Review, 'id' | 'author'>) => void;
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ place, onSubmitReview }) => {

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  const wazeUrl = `https://waze.com/ul?ll=${place.latitude},${place.longitude}&navigate=yes`;

  const renderReview = (review: Review) => (
    <div key={review.id} className="card-modern border-white/5">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
          <UserIcon />
        </div>
        <div>
          <p className="font-bold text-white text-lg">{review.author}</p>
          <p className="text-gray-400 text-xs">Avaliador Verificado</p>
        </div>
      </div>
      <div className="relative mb-6">
        <div className="absolute -top-2 -left-2 opacity-20">
          <QuoteIcon />
        </div>
        <p className="text-gray-200 text-lg leading-relaxed italic z-10 relative pl-4">
          {review.comment}
        </p>
      </div>

      {review.photos && review.photos.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {review.photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Foto da avaliação ${index + 1}`}
                className="w-28 h-28 object-cover rounded-xl cursor-pointer transition-all duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-teal-400 shadow-md"
                onClick={() => window.open(photo, '_blank')}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 glass-light rounded-xl mt-4 border border-white/5">
        <div className="flex flex-col gap-1" title="Acessibilidade">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Acessibilidade</span>
          <div className="flex items-center">
            <AccessibilityIcon className="mr-2 text-teal-400 w-4 h-4" />
            <StarRating rating={review.accessibility} readOnly={true} />
          </div>
        </div>
        <div className="flex flex-col gap-1" title="Infraestrutura">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Infraestrutura</span>
          <div className="flex items-center">
            <InfrastructureIcon className="mr-2 text-teal-400 w-4 h-4" />
            <StarRating rating={review.infrastructure} readOnly={true} />
          </div>
        </div>
        <div className="flex flex-col gap-1" title="Custo-Benefício">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Custo-Benefício</span>
          <div className="flex items-center">
            <ValueIcon className="mr-2 text-teal-400 w-4 h-4" />
            <StarRating rating={review.value} readOnly={true} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">

      {/* Hero / Summary Section */}
      <div className="relative overflow-hidden p-8 rounded-3xl glass border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gradient-vibrant">
            {place.name}
          </h2>
          <div className="flex items-center text-gray-300 text-lg mb-8">
            <LocationIcon className="mr-2 text-teal-400" />
            <span>{place.address || place.location}</span>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-4 flex items-center text-teal-300">
              <QuoteIcon className="mr-3 w-6 h-6" /> Resumo Inteligente
            </h3>
            <p className="text-gray-200 leading-relaxed text-lg">
              {place.aiSummary || 'Analisando avaliações para gerar um resumo mágico...'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions & Maps Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-modern flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
            <DirectionsIcon className="mr-3 text-cyan-400" /> Como Chegar
          </h3>
          <div className="flex flex-col gap-4">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="btn-primary text-center flex items-center justify-center gap-2">
              <img src="https://www.google.com/s2/favicons?domain=maps.google.com&sz=32" alt="" className="w-5 h-5" />
              Google Maps
            </a>
            <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-center flex items-center justify-center gap-2">
              <img src="https://www.google.com/s2/favicons?domain=waze.com&sz=32" alt="" className="w-5 h-5" />
              Waze
            </a>
          </div>
        </div>

        <div className="card-modern relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <LocationIcon className="w-24 h-24" />
          </div>
          <h3 className="text-2xl font-bold mb-6 text-white">Localização</h3>
          <div className="space-y-4 text-gray-300 relative z-10">
            <p className="text-lg font-medium leading-snug">
              {place.address || place.location}
            </p>
            <div className="inline-flex px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-sm border border-teal-500/30">
              Endereço Verificado
            </div>
          </div>
        </div>
      </div>

      {/* Add Review Section */}
      <div className="section-modern">
        <h3 className="text-3xl font-extrabold mb-8 text-gradient-primary">Sua experiência importa</h3>
        <div className="card-modern">
          <ReviewForm placeId={place.id} onSubmit={onSubmitReview} />
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="section-modern">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-extrabold text-white">Avaliações</h3>
          <span className="px-4 py-1 rounded-full glass-light text-teal-300 font-bold border border-teal-500/20">
            {place.reviews.length} total
          </span>
        </div>

        {place.reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {place.reviews.map(renderReview)}
          </div>
        ) : (
          <div className="text-center py-20 card-modern border-dashed border-2 border-white/10">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
            <p className="text-gray-400 text-xl">Seja o pioneiro e avalie este local!</p>
            <p className="text-gray-600 mt-2">Suas dicas ajudam milhares de pessoas.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PlaceDetail;

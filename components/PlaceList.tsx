
import React from 'react';
import { Place } from '../types';
import { LocationIcon } from './icons';

interface PlaceListProps {
    places: Place[];
    onSelectPlace: (place: Place) => void;
    title: string;
}

const PlaceList: React.FC<PlaceListProps> = ({ places, onSelectPlace, title }) => {
    return (
        <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gradient-primary">
                {title} <span className="text-gray-400 font-medium text-2xl">({places.length})</span>
            </h2>
            {places.length === 0 ? (
                <div className="text-center py-16 card-modern">
                    <p className="text-gray-300 text-xl mb-2">Nenhum local encontrado.</p>
                    <p className="text-gray-500">Tente outra busca ou volte para escolher uma categoria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {places.map((place, index) => (
                        <div
                            key={place.id}
                            onClick={() => onSelectPlace(place)}
                            className="cursor-pointer card-modern group hover:scale-105 hover-glow-teal"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                                    {place.name}
                                </h3>
                                <div className="flex items-center text-gray-400 text-sm mb-2">
                                    <LocationIcon />
                                    <p className="ml-2">{place.location}</p>
                                </div>
                                {place.address && (
                                    <p className="text-gray-500 text-sm">{place.address}</p>
                                )}
                            </div>
                            {place.distance !== undefined && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-sm text-teal-400 font-semibold">
                                        📍 Aprox. {place.distance.toFixed(1)} km de você
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaceList;


import React, { useState, useRef } from 'react';
import StarRating from './StarRating';
import { CameraIcon, GalleryIcon, XCircleIcon } from './icons';

interface ReviewFormProps {
  placeId: string;
  onSubmit: (placeId: string, reviewData: {
    accessibility: number;
    infrastructure: number;
    value: number;
    comment: string;
    photos?: string[];
  }) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ placeId, onSubmit }) => {
  const [accessibility, setAccessibility] = useState(0);
  const [infrastructure, setInfrastructure] = useState(0);
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: string[] = [];
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            newPhotos.push(reader.result);
            if (newPhotos.length === files.length) {
              setPhotos(prev => [...prev, ...newPhotos].slice(0, 6)); // Limita a 6 fotos
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessibility === 0 || infrastructure === 0 || value === 0 || comment.trim() === '') {
      setError('Por favor, preencha todos os campos e avaliações.');
      return;
    }
    setError('');
    onSubmit(placeId, { accessibility, infrastructure, value, comment, photos });
    // Reset form
    setAccessibility(0);
    setInfrastructure(0);
    setValue(0);
    setComment('');
    setPhotos([]);
  };

  return (
    <form onSubmit={handleSubmit} className="section-modern space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center p-4 glass-light rounded-2xl border border-white/5">
          <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">Acessibilidade</label>
          <StarRating rating={accessibility} setRating={setAccessibility} />
        </div>
        <div className="flex flex-col items-center p-4 glass-light rounded-2xl border border-white/5">
          <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">Infraestrutura</label>
          <StarRating rating={infrastructure} setRating={setInfrastructure} />
        </div>
        <div className="flex flex-col items-center p-4 glass-light rounded-2xl border border-white/5">
          <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">Custo-Benefício</label>
          <StarRating rating={value} setRating={setValue} />
        </div>
      </div>

      <div className="relative">
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-lg"
          placeholder="Compartilhe os detalhes da sua experiência..."
        ></textarea>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fotos do Local</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 btn-primary py-4 flex items-center justify-center gap-3"
          >
            <CameraIcon /> Tirar Foto
          </button>
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 px-6 py-4 rounded-full font-semibold text-white transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center gap-3"
          >
            <GalleryIcon /> Galeria
          </button>
          <input type="file" accept="image/*" multiple ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 glass-light rounded-2xl">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={photo} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-xl border border-white/10 shadow-lg" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full text-white p-1 shadow-xl transform transition-transform group-hover:scale-110"
              >
                <XCircleIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm animate-shake">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-white/5 flex justify-end">
        <button
          type="submit"
          className="btn-primary px-12 py-4 text-lg"
        >
          Publicar Avaliação
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;


import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

// Local icon components for styling
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);


interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageText: string;
  onPrev: () => void;
  onNext: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, imageText, onPrev, onNext }) => {
  const [isVisible, setIsVisible] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Escape') handleClose();
    };

    window.document.addEventListener('keydown', handleKeyDown);
    
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => {
        clearTimeout(timer);
        window.document.removeEventListener('keydown', handleKeyDown);
      }
    } else {
      setIsVisible(false);
      return () => {
        window.document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onPrev, onNext]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleArrowClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = 0;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (touchEndX.current === 0) return;
    if (touchStartX.current - touchEndX.current > 50) onNext();
    if (touchStartX.current - touchEndX.current < -50) onPrev();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
    >
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-gray-800/60 text-white hover:bg-gray-700/80 z-20 transition-all hover:scale-110"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Prev Button */}
        <button
          onClick={(e) => handleArrowClick(e, onPrev)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/60 text-white hover:bg-gray-700/80 z-20 transition-all hover:scale-110 md:left-8"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-7 h-7" />
        </button>
      
        {/* Next Button */}
        <button
          onClick={(e) => handleArrowClick(e, onNext)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/60 text-white hover:bg-gray-700/80 z-20 transition-all hover:scale-110 md:right-8"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-7 h-7" />
        </button>

        {/* Content */}
        <div 
          className={`relative w-full max-w-4xl max-h-[90vh] transition-all duration-200 flex flex-col items-center p-4 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} 
          onClick={(e) => e.stopPropagation()}
        >
          <img src={imageSrc} alt={imageText} className="object-contain w-auto h-auto max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
        </div>
    </div>
  );
};

export default ImageModal;
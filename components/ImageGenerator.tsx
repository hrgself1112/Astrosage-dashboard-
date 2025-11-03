
import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import ImageModal from './ImageModal';
import { XMarkIcon } from './icons/XMarkIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface GeneratedImage {
  text: string;
  data: string;
}

const ImageGenerator: React.FC = () => {
  const [texts, setTexts] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [prefix, setPrefix] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const imageSettings: { [key: string]: { scale?: number, imgXadd?: number, imgYadd?: number } } = {
      virgo: { scale: 0.85 }, libra: { scale: 0.85, imgYadd: -5 }, scorpio: { scale: 1, imgXadd: -15, imgYadd: -25 },
      saggitarius: { scale: 0.9 }, capricorn: { scale: 1, imgYadd: -25 }, pisces: { scale: 1, imgXadd: -5 },
  };

  const handleAddText = () => {
    if (textInput.trim()) {
      setTexts([...texts, textInput.trim()]);
      setTextInput('');
    }
  };
  
  const handleRemoveText = (indexToRemove: number) => {
    setTexts(texts.filter((_, index) => index !== indexToRemove));
  };

  const processImages = () => {
    const planet = (document.getElementById('planets') as HTMLSelectElement).value;
    const zodiac = (document.getElementById('zodiacs') as HTMLSelectElement).value;

    if (texts.length === 0) {
      alert('Please add some text prompts first.');
      return;
    }
    
    setIsLoading(true);
    setGeneratedImages([]);

    const loadImage = (cb: (img: HTMLImageElement | null, name?: string) => void) => {
      const value = planet || zodiac;
      const parent = planet ? 'planets' : 'zodiacs';
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      
      if (value) {
        // Using a public placeholder for assets
        img.src = `https://via.placeholder.com/300/${value === 'sun' ? 'FFD700' : '808080'}/FFFFFF?text=${value.charAt(0).toUpperCase() + value.slice(1)}`;
        img.onload = () => cb(img, value);
        img.onerror = () => { alert(`Failed to load placeholder image for ${value}.`); cb(null); setIsLoading(false); };
      } else {
        cb(null);
      }
    };
    
    setTimeout(() => {
        loadImage((img, name) => {
            const images = texts.map(text => ({
                text,
                data: renderImageWithText(text, img, name)
            }));
            setGeneratedImages(images);
            setIsLoading(false);
        });
    }, 1000);
  };

  const renderImageWithText = (text: string, img: HTMLImageElement | null, name?: string): string => {
      const canvas = canvasRef.current;
      if (!canvas) return '';
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      canvas.width = 1280;
      canvas.height = 720;

      ctx.fillStyle = '#fff2da';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = 135;
      let fontSize = 47;
      const maxWidth = 880;
      const maxLines = 2;

      const getWrappedLines = (txt: string) => {
          ctx.font = `600 ${fontSize}pt 'Nirmala UI', 'Segoe UI', 'Arial', sans-serif`;
          const words = txt.split(' ');
          let lines: string[] = [];
          let line = '';
          words.forEach(word => {
              const testLine = line + word + ' ';
              if (ctx.measureText(testLine).width > maxWidth && line) {
                  lines.push(line.trim());
                  line = word + ' ';
              } else {
                  line = testLine;
              }
          });
          lines.push(line.trim());
          return lines;
      };

      let lines = getWrappedLines(text);
      while (lines.length > maxLines && fontSize > 10) {
          fontSize--;
          lines = getWrappedLines(text);
      }
      
      ctx.font = `600 ${fontSize}pt 'Nirmala UI', 'Segoe UI', 'Arial', sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lineHeight = fontSize * 1.9;
      const startY = centerY - (lines.length - 1) * lineHeight / 2;
      lines.forEach((line, i) => ctx.fillText(line, centerX, startY + i * lineHeight));

      const circleY = startY + (lines.length - 1) * lineHeight / 2 + 160 + 100;
      ctx.beginPath();
      ctx.arc(centerX, circleY, 182, 0, Math.PI * 2);
      ctx.fillStyle = '#e2dacb';
      ctx.fill();

      if (img) {
          const setting = imageSettings[name || ''] || {};
          const { scale = 1, imgXadd = 0, imgYadd = 0 } = setting;
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          ctx.drawImage(img, centerX - scaledWidth / 2 + imgXadd, circleY - scaledHeight / 2 + imgYadd, scaledWidth, scaledHeight);
      }
      return canvas.toDataURL();
  };
  
    const detectLanguage = (text: string) => {
        const scriptRanges: { [key: string]: RegExp } = {
            'Tamil': /[\u0B80-\u0BFF]/, 'Telugu': /[\u0C00-\u0C7F]/, 'Gujarati': /[\u0A80-\u0AFF]/, 'Marathi': /[\u0900-\u097F]/,
            'Malayalam': /[\u0D00-\u0D7F]/, 'Odia': /[\u0B00-\u0B7F]/, 'Assamese': /[\u0980-\u09FF]/, 'Kannada': /[\u0C80-\u0CFF]/,
            'Bengali': /[\u0980-\u09FF]/, 'Punjabi': /[\u0A00-\u0A7F]/, 'Urdu': /[\u0600-\u06FF]/, 'Hindi': /[\u0900-\u097F]/,
            'English': /[a-zA-Z]/
        };
        for (const [lang, regex] of Object.entries(scriptRanges)) {
            if (regex.test(text)) return lang;
        }
        return 'Unknown';
    };

    const downloadZIP = () => {
        if (generatedImages.length === 0) return alert('No images to download.');
        const zip = new JSZip();
        const safePrefix = prefix.trim() || 'image';
        generatedImages.forEach(({ text, data }) => {
            const lang = detectLanguage(text).toLowerCase().replace(/\s+/g, '_');
            zip.file(`${safePrefix}-${lang}.png`, data.split(',')[1], { base64: true });
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = `${safePrefix}.zip`;
            a.click();
            URL.revokeObjectURL(a.href);
        });
    };

    const openModal = (index: number) => {
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-m3-surface-container flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                <div className="bg-m3-surface p-8 rounded-2xl shadow-sm border border-m3-outline/20 flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-m3-on-surface-variant mb-2">Text Prompts</label>
                        <div className="flex gap-2">
                            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddText()} placeholder="Enter text for images" className="flex-grow w-full rounded-lg border border-m3-outline bg-transparent py-2.5 px-4 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:border-m3-primary focus:ring-1 focus:ring-m3-primary" />
                            <button onClick={handleAddText} className="px-6 py-2.5 text-sm font-medium rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 transition-opacity">Add Text</button>
                        </div>
                         {texts.length > 0 && (
                            <ul className="flex flex-wrap gap-2 mt-4">
                                {texts.map((text, i) => (
                                    <li key={i} className="flex items-center gap-2 bg-m3-secondary-container text-m3-on-secondary-container text-sm font-medium pl-3 pr-1 py-1 rounded-full">
                                        <span>{text}</span>
                                        <button onClick={() => handleRemoveText(i)} className="bg-m3-primary/20 rounded-full p-0.5 hover:bg-m3-primary/40">
                                          <XMarkIcon className="w-4 h-4"/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select id="planets" className="w-full rounded-lg border border-m3-outline bg-transparent py-2.5 px-4 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary">
                            <option value="">-- Select Planet --</option>
                            <option value="jupiter">Jupiter</option><option value="mars">Mars</option><option value="mercury">Mercury</option><option value="moon">Moon</option><option value="neptune">Neptune</option><option value="pluto">Pluto</option><option value="saturn">Saturn</option><option value="sun">Sun</option><option value="uranas">Uranus</option><option value="venus">Venus</option><option value="earth">Earth</option>
                        </select>
                        <select id="zodiacs" className="w-full rounded-lg border border-m3-outline bg-transparent py-2.5 px-4 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary">
                            <option value="">-- Select Zodiac --</option>
                            <option value="aries">Aries</option><option value="taurus">Taurus</option><option value="gemini">Gemini</option><option value="cancer">Cancer</option><option value="leo">Leo</option><option value="virgo">Virgo</option><option value="libra">Libra</option><option value="scorpio">Scorpio</option><option value="saggitarius">Sagittarius</option><option value="capricorn">Capricorn</option><option value="aquarius">Aquarius</option><option value="pisces">Pisces</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-m3-on-surface-variant mb-2">File Name Prefix</label>
                        <input type="text" value={prefix} onChange={e => setPrefix(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} placeholder="e.g., my-design" className="w-full max-w-xs rounded-lg border border-m3-outline bg-transparent py-2.5 px-4 text-m3-on-surface" />
                    </div>

                    <div className="mt-4 flex justify-end gap-4">
                         <button onClick={processImages} disabled={isLoading} className="px-6 py-2.5 font-medium rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isLoading ? <><SpinnerIcon className="w-5 h-5" /> Generating...</> : 'Generate Images'}
                        </button>
                        <button onClick={downloadZIP} className="px-6 py-2.5 font-medium rounded-full bg-m3-tertiary text-m3-on-tertiary hover:opacity-90 disabled:opacity-50" disabled={generatedImages.length === 0}>Download All</button>
                    </div>
                </div>
                
                <div className="bg-m3-surface p-6 rounded-2xl shadow-sm border border-m3-outline/20 min-h-[200px]">
                    <h2 className="text-lg font-medium text-m3-on-surface mb-4">Output</h2>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-40">
                            <SpinnerIcon className="w-10 h-10 text-m3-primary" />
                         </div>
                    ) : (
                        generatedImages.length > 0 ? (
                            <div id="outputGrid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {generatedImages.map((imgData, index) => (
                                    <div key={index} className="relative group overflow-hidden rounded-lg" onClick={() => openModal(index)}>
                                        <img src={imgData.data} className="w-full h-auto object-cover aspect-video rounded-lg cursor-pointer transition-transform duration-300 group-hover:scale-105" alt={`Generated for: ${imgData.text}`} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <p className="text-white text-center p-2 text-sm">{imgData.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-m3-on-surface-variant">
                                <p>Your generated images will appear here.</p>
                            </div>
                        )
                    )}
                </div>

            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {isModalOpen && generatedImages.length > 0 && (
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    imageSrc={generatedImages[currentImageIndex].data}
                    imageText={generatedImages[currentImageIndex].text}
                    onPrev={() => setCurrentImageIndex((currentImageIndex - 1 + generatedImages.length) % generatedImages.length)}
                    onNext={() => setCurrentImageIndex((currentImageIndex + 1) % generatedImages.length)}
                />
            )}
        </div>
    );
};

export default ImageGenerator;
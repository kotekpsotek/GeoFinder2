import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import MapDisplay from './components/MapDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { MapPinIcon, ErrorIcon, CopyIcon, CheckIcon } from './components/icons';
import { AppStatus } from './types';
import { type LocationData } from './types';
import { analyzeImageLocation } from './services/geminiService';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove 'data:*/*;base64,' prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.INITIAL);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImageSelect = useCallback(async (file: File) => {
    setStatus(AppStatus.ANALYZING);
    setLocationData(null);
    setError(null);
    setCopied(false);
    setImagePreviewUrl(URL.createObjectURL(file));

    try {
      const base64Image = await fileToBase64(file);
      const result = await analyzeImageLocation(base64Image, file.type);
      
      if (result.locationFound && result.location) {
        setLocationData(result.location);
        setStatus(AppStatus.SUCCESS);
      } else {
        setError(result.reason || "Could not identify a specific location in this image.");
        setStatus(AppStatus.ERROR);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const resetApp = () => {
    setStatus(AppStatus.INITIAL);
    setImagePreviewUrl(null);
    setLocationData(null);
    setError(null);
    setCopied(false);
  };

  const handleCopyCoords = useCallback(() => {
    if (!locationData) return;
    const coords = `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [locationData]);

  const ResultContent = () => {
    switch (status) {
      case AppStatus.ANALYZING:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <LoadingSpinner />
          </div>
        );
      case AppStatus.SUCCESS:
        if (!locationData) return null;
        return (
          <div className="flex flex-col h-full gap-4">
             <div className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPinIcon className="w-7 h-7 text-cyan-400" />
                Location Identified
              </h2>
              <p className="text-lg font-semibold text-cyan-300 mt-1">{locationData.placeName}</p>
              
              <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 tracking-wider">COORDINATES</h3>
                        <p className="text-base text-white font-mono tracking-wider">
                            {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                        </p>
                    </div>
                    <button 
                        onClick={handleCopyCoords} 
                        className="p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" 
                        aria-label="Copy coordinates"
                    >
                        {copied ? (
                            <CheckIcon className="w-5 h-5 text-green-400" />
                        ) : (
                            <CopyIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-4">{locationData.description}</p>
            </div>
            <div className="flex-grow min-h-0">
                <MapDisplay location={locationData} />
            </div>
          </div>
        );
      case AppStatus.ERROR:
        return (
          <div className="flex flex-col items-center justify-center w-full h-full text-center bg-slate-800/50 p-6 rounded-lg">
            <ErrorIcon className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-red-400">Analysis Failed</h2>
            <p className="text-slate-300 mt-2">{error}</p>
          </div>
        );
      default: // INITIAL
        return (
           <div className="flex flex-col items-center justify-center w-full h-full text-center text-slate-400 p-6 bg-slate-800/50 rounded-lg">
                <MapPinIcon className="w-16 h-16 text-slate-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-300">Discover Where Your Photo Was Taken</h2>
                <p className="mt-2">Upload an image, and our AI will analyze it to pinpoint the location on a map.</p>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            GeoPhoto Finder
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Pinpoint your photos on the world map with Gemini AI.</p>
        </header>

        <main className="bg-slate-800/40 p-6 rounded-2xl shadow-2xl shadow-black/20 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[50vh]">
                <div className="flex flex-col gap-4">
                    {imagePreviewUrl ? (
                      <div className="w-full h-full aspect-square relative rounded-xl overflow-hidden border-2 border-slate-700">
                         <img src={imagePreviewUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <ImageUploader onImageSelect={handleImageSelect} disabled={status === AppStatus.ANALYZING} />
                    )}
                     {(status === AppStatus.SUCCESS || status === AppStatus.ERROR) && (
                        <button 
                            onClick={resetApp}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                        >
                            Analyze Another Image
                        </button>
                    )}
                </div>
                <div className="flex flex-col">
                    <ResultContent />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
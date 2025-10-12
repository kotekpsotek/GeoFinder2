
import React from 'react';
import { type LocationData } from '../types';

interface MapDisplayProps {
  location: LocationData;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ location }) => {
  const { latitude, longitude } = location;
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;

  return (
    <div className="w-full h-64 md:h-full rounded-lg overflow-hidden border-2 border-slate-700">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        src={mapUrl}
        title="Photo Location"
      ></iframe>
    </div>
  );
};

export default MapDisplay;

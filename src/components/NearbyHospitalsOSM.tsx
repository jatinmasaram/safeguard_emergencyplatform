import React, { useEffect, useState } from "react";

interface Hospital {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

const NearbyHospitalsOSM: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:500,${latitude},${longitude});
            way["amenity"="hospital"](around:500,${latitude},${longitude});
            relation["amenity"="hospital"](around:500,${latitude},${longitude});
          );
          out center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
          const res = await fetch(url);
          const data = await res.json();

          const hospitalsFound = data.elements.map((el: any) => ({
            id: el.id,
            name: el.tags?.name || "Unnamed Hospital",
            lat: el.lat || el.center?.lat,
            lon: el.lon || el.center?.lon,
          }));

          setHospitals(hospitalsFound);
        } catch (err) {
          console.error("OSM Overpass error:", err);
        } finally {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mt-8 p-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby Hospitals</h2>

      {loading && <p className="text-gray-500">Loading nearby hospitals...</p>}

      {!loading && hospitals.length === 0 && (
        <p className="text-gray-500">No hospitals found nearby.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hospitals.map((h) => (
          <div
            key={h.id}
            className="p-4 border rounded-xl shadow hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 via-white to-green-100"
          >
            <h3 className="font-semibold text-gray-700">{h.name}</h3>
            <p className="text-gray-500 text-sm mb-2">
              Lat: {h.lat.toFixed(4)}, Lon: {h.lon.toFixed(4)}
            </p>
            <a
              href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lon}#map=18/${h.lat}/${h.lon}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              View on Map
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyHospitalsOSM;

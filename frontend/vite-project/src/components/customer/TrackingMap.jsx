import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bike, MapPin, Store, Navigation } from "lucide-react";

// Helper component to smoothly center / fit bounds on marker updates
function MapBoundsUpdater({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch (e) {
        // Ignore bounds error
      }
    }
  }, [points, map]);
  return null;
}

// Custom icons using Leaflet DivIcon with inline HTML/SVG
const createIcon = (bgClass, iconSvg, label) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
        <div style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5); border:2px solid #ffffff;" class="${bgClass}">
          ${iconSvg}
        </div>
        <div style="position:absolute; bottom:-18px; white-space:nowrap; background:#0f172a; color:#f8fafc; font-size:10px; font-weight:800; padding:2px 6px; border-radius:8px; border:1px solid #334155;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 21],
  });
};

const restaurantIcon = createIcon(
  "bg-orange-500 text-white",
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
  "Kitchen"
);

const destinationIcon = createIcon(
  "bg-blue-600 text-white",
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  "Your Home"
);

const riderIcon = createIcon(
  "bg-emerald-500 text-white animate-bounce",
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`,
  "Delivery Partner"
);

const TrackingMap = ({ order }) => {
  const restaurantPos = [22.3072, 73.1812]; // Central Vadodara kitchen coordinate

  // Customer destination
  const destPos = useMemo(() => {
    if (order?.addressDetails?.lat && order?.addressDetails?.lng) {
      return [order.addressDetails.lat, order.addressDetails.lng];
    }
    return [22.3150, 73.1920]; // Default nearby destination
  }, [order?.addressDetails]);

  // Live rider position
  const riderPos = useMemo(() => {
    if (order?.tracking?.lastLocation?.lat && order?.tracking?.lastLocation?.lng) {
      return [order.tracking.lastLocation.lat, order.tracking.lastLocation.lng];
    }
    // Interpolate midpoint if rider just started
    return [
      (restaurantPos[0] + destPos[0]) / 2,
      (restaurantPos[1] + destPos[1]) / 2,
    ];
  }, [order?.tracking?.lastLocation, destPos]);

  // Points for map auto-fit
  const allPoints = useMemo(() => {
    return [restaurantPos, destPos, riderPos];
  }, [destPos, riderPos]);

  // Route path polyline
  const polylinePositions = useMemo(() => {
    if (order?.tracking?.path && order.tracking.path.length > 1) {
      return order.tracking.path.map((p) => [p.lat, p.lng]);
    }
    return [restaurantPos, riderPos, destPos];
  }, [order?.tracking?.path, riderPos, destPos]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      {/* Live Floating Tracker Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-xs font-black text-white block leading-tight">
              Rider is en route to your address
            </span>
            <span className="text-[10px] text-slate-400">
              Live GPS route updated every few seconds
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-xl border border-orange-500/20">
            ETA ~{order?.tracking?.etaMinutes || "10-15"} mins
          </span>
          <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-xl border border-blue-500/20">
            {order?.tracking?.distanceKm ? `${order.tracking.distanceKm} km` : "2.1 km away"}
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="h-80 sm:h-96 w-full">
        <MapContainer
          center={riderPos}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater points={allPoints} />

          {/* Restaurant Marker */}
          <Marker position={restaurantPos} icon={restaurantIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Baroda Gourmet Central Kitchen</strong>
                <p>Order prepared & dispatched here</p>
              </div>
            </Popup>
          </Marker>

          {/* Customer Destination Marker */}
          <Marker position={destPos} icon={destinationIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Delivery Destination</strong>
                <p>{order?.customerDetails?.deliveryAddress}</p>
              </div>
            </Popup>
          </Marker>

          {/* Live Rider Marker */}
          <Marker position={riderPos} icon={riderIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Delivery Partner</strong>
                <p>{order?.assignedPartner?.name || "Rider"}</p>
              </div>
            </Popup>
          </Marker>

          {/* Delivery Route Polyline */}
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#f97316",
              weight: 4,
              dashArray: "8, 8",
              opacity: 0.85,
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default TrackingMap;

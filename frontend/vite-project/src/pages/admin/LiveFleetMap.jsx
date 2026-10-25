import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  Bike,
  Navigation,
  RefreshCw,
  Phone,
  Clock,
  Store,
  MapPin,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

// Auto-recenter helper
function MapViewHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

const createIcon = (bgClass, iconSvg, label) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
        <div style="width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 12px -2px rgba(0,0,0,0.5); border:2px solid #ffffff;" class="${bgClass}">
          ${iconSvg}
        </div>
        <div style="position:absolute; bottom:-16px; white-space:nowrap; background:#0f172a; color:#f8fafc; font-size:9px; font-weight:800; padding:1px 5px; border-radius:6px; border:1px solid #334155;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 20],
  });
};

const restaurantIcon = createIcon(
  "bg-orange-500 text-white",
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
  "Central Kitchen"
);

const riderIcon = createIcon(
  "bg-emerald-500 text-white animate-pulse",
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`,
  "Fleet Rider"
);

const customerIcon = createIcon(
  "bg-blue-600 text-white",
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  "Customer"
);

const LiveFleetMap = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [fleetData, setFleetData] = useState({
    restaurantLocation: { lat: 22.3072, lng: 73.1812 },
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [mapCenter, setMapCenter] = useState([22.3072, 73.1812]);

  const fetchFleet = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axiosInstance.get("/orders/tracking/live");
      if (data.success) {
        setFleetData(data);
      }
    } catch (err) {
      if (!silent) toast.error("Failed to load live fleet tracking");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();

    const interval = setInterval(() => {
      fetchFleet(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.orderId);
    const loc = order.partner?.lastLocation || order.addressDetails;
    if (loc?.lat && loc?.lng) {
      setMapCenter([loc.lat, loc.lng]);
    }
  };

  if (loading) {
    return <Loader text="Connecting to city live fleet telemetry..." />;
  }

  const kitchenLoc = [
    fleetData.restaurantLocation?.lat || 22.3072,
    fleetData.restaurantLocation?.lng || 73.1812,
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Live Delivery Fleet Tracking"
        description="Real-time OpenStreetMap telemetry of courier partners actively delivering feast orders."
        onMenuClick={() => setIsMobileOpen(true)}
        action={
          <Button
            onClick={() => fetchFleet()}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Refresh Telemetry
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deliveries List Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 max-h-[550px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Deliveries in Transit
            </span>
            <span className="text-xs font-extrabold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              {fleetData.orders.length} Active
            </span>
          </div>

          {fleetData.orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bike className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs font-semibold text-slate-400">
                No orders currently out for delivery
              </p>
              <p className="text-[11px] text-slate-500">
                When orders transition to "Out for delivery", their live GPS will stream here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fleetData.orders.map((order) => {
                const isSelected = selectedOrderId === order.orderId;

                return (
                  <div
                    key={order.orderId}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-white">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-black text-orange-400">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <p className="text-[11px] text-slate-400 truncate">
                        To: <strong className="text-white">{order.customerName}</strong> • {order.destination}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Bike className="w-3.5 h-3.5" />
                          {order.partner?.name || "Partner"}
                        </span>
                        <span className="text-slate-400">
                          ETA ~{order.etaMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Leaflet Map Canvas */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[550px] relative bg-slate-950">
          <MapContainer
            center={kitchenLoc}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewHandler center={mapCenter} />

            {/* Central Kitchen Pin */}
            <Marker position={kitchenLoc} icon={restaurantIcon}>
              <Popup>
                <div className="text-xs">
                  <strong>Baroda Gourmet Central Kitchen</strong>
                  <p>Order staging & dispatch hub</p>
                </div>
              </Popup>
            </Marker>

            {/* Render Each Active Delivery */}
            {fleetData.orders.map((o) => {
              const custLat = o.addressDetails?.lat || 22.315;
              const custLng = o.addressDetails?.lng || 73.192;
              const custPos = [custLat, custLng];

              const riderLat = o.partner?.lastLocation?.lat || (kitchenLoc[0] + custLat) / 2;
              const riderLng = o.partner?.lastLocation?.lng || (kitchenLoc[1] + custLng) / 2;
              const riderPos = [riderLat, riderLng];

              return (
                <React.Fragment key={o.orderId}>
                  {/* Customer Marker */}
                  <Marker position={custPos} icon={customerIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong>Order #{o.orderNumber}</strong>
                        <p>{o.customerName}</p>
                        <p>{o.destination}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Rider Marker */}
                  <Marker position={riderPos} icon={riderIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong>{o.partner?.name || "Rider"}</strong>
                        <p>Delivering #{o.orderNumber}</p>
                        {o.partner?.phone && (
                          <a href={`tel:${o.partner.phone}`} className="text-orange-500 font-bold block mt-1">
                            Call {o.partner.phone}
                          </a>
                        )}
                      </div>
                    </Popup>
                  </Marker>

                  {/* Route Polyline */}
                  <Polyline
                    positions={[kitchenLoc, riderPos, custPos]}
                    pathOptions={{
                      color: selectedOrderId === o.orderId ? "#f97316" : "#3b82f6",
                      weight: selectedOrderId === o.orderId ? 4 : 2,
                      dashArray: "6, 6",
                      opacity: 0.8,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveFleetMap;

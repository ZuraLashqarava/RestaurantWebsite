import { useEffect, useState } from "react";
import "./Cart.scss";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const GEORGIA_BOUNDS = L.latLngBounds(
  L.latLng(41.0, 40.0),
  L.latLng(43.6, 46.7)
);
const GEORGIA_CENTER: [number, number] = [42.3, 43.35];

interface SessionCartItem {
  productId: number;
  productName: string;
  variationId: number;
  quantity: number;
  price?: number;
}

interface SessionCartDto {
  items: SessionCartItem[];
}

interface ProductVariation {
  id: number;
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  variations: ProductVariation[];
}

interface OrderForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
}

const API = "https://localhost:7035";


const MapClickHandler = ({
  onLocationPicked,
}: {
  onLocationPicked: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      if (GEORGIA_BOUNDS.contains(e.latlng)) {
        onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const Cart = () => {
  const [cart, setCart] = useState<SessionCartDto>({ items: [] });
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [form, setForm] = useState<OrderForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API}/api/cart`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data: SessionCartDto = await res.json();
        setCart(data);

        if (data.items.length > 0) {
          const productRes = await fetch(`${API}/api/product`);
          const allProducts: Product[] = await productRes.json();
          const map: Record<number, Product> = {};
          allProducts.forEach((p) => (map[p.id] = p));
          setProducts(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

 
  const handleLocationPicked = async (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const addr = data.address ?? {};

      const parts = [
        addr.road,
        addr.house_number,
        addr.city || addr.town || addr.village || addr.suburb,
      ].filter(Boolean);

      const locationStr =
        parts.length > 0 ? parts.join(", ") : data.display_name ?? "";

      setForm((f) => ({ ...f, location: locationStr }));
      setFormErrors((e) => ({ ...e, location: undefined }));
    } catch {
      console.error("Reverse geocoding failed");
    } finally {
      setGeocoding(false);
    }
  };

  const getItemPrice = (item: SessionCartItem): number => {
    const product = products[item.productId];
    if (!product || !product.variations.length) return 0;
    return Number(product.variations[0].price);
  };

  const getItemImage = (productId: number): string => {
    const product = products[productId];
    return product ? `${API}${product.imageUrl}` : "/images/placeholder.jpg";
  };

  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) { await removeItem(productId); return; }
    try {
      const res = await fetch(`${API}/api/cart/items/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQty }),
      });
      if (!res.ok) throw new Error();
      setCart(await res.json());
    } catch { console.error("Failed to update quantity"); }
  };

  const removeItem = async (productId: number) => {
    try {
      const res = await fetch(`${API}/api/cart/items/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setCart(await res.json());
    } catch { console.error("Failed to remove item"); }
  };

  const total = cart.items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const validateForm = (): boolean => {
    const errors: Partial<OrderForm> = {};
    if (!form.firstName.trim()) errors.firstName = "Required";
    if (!form.lastName.trim()) errors.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Valid email required";
    if (!form.phone.trim()) errors.phone = "Required";
    if (!form.location.trim()) errors.location = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || cart.items.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.firstName,
          lastName: form.lastName,
          email: form.email,
          number: form.phone,
          location: form.location,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to place order");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cart__state">
        <div className="cart__spinner" />
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="cart__state">
        <div className="cart__success-icon">✓</div>
        <h2 className="cart__success-title">Order Placed</h2>
        <p className="cart__success-sub">
          We'll contact you at {form.email} with confirmation.
        </p>
      </div>
    );
  }

  return (
    <main className="cart">
      <div className="cart__header">
        <h1 className="cart__title">Your Cart</h1>
        <p className="cart__subtitle">
          {cart.items.length === 0
            ? "Your cart is empty"
            : `${cart.items.length} item${cart.items.length > 1 ? "s" : ""} selected`}
        </p>
        <div className="cart__divider" />
      </div>

      {cart.items.length === 0 ? (
        <div className="cart__empty">
          <span className="cart__empty-icon"></span>
          <p>No items in your cart yet.</p>
          <a href="/menu" className="cart__empty-link">Browse the menu</a>
        </div>
      ) : (
        <div className="cart__layout">
         
          <section className="cart__items">
            {cart.items.map((item) => (
              <div className="cart__card" key={item.productId}>
                <div className="cart__card-img-wrap">
                  <img
                    src={getItemImage(item.productId)}
                    alt={item.productName}
                    className="cart__card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="cart__card-info">
                  <h3 className="cart__card-name">{item.productName}</h3>
                  <span className="cart__card-unit">
                    ${getItemPrice(item).toFixed(2)} each
                  </span>
                </div>
                <div className="cart__card-right">
                  <div className="cart__qty">
                    <button className="cart__qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease">−</button>
                    <span className="cart__qty-value">{item.quantity}</span>
                    <button className="cart__qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Increase">+</button>
                  </div>
                  <span className="cart__card-subtotal">
                    ${(getItemPrice(item) * item.quantity).toFixed(2)}
                  </span>
                  <button className="cart__card-remove" onClick={() => removeItem(item.productId)} aria-label="Remove">✕</button>
                </div>
              </div>
            ))}
          </section>

          
          <aside className="cart__aside">
            <h2 className="cart__aside-title">Delivery Details</h2>
            <div className="cart__aside-divider" />

            <div className="cart__form">
              <div className="cart__form-row">
                <div className="cart__field">
                  <label className="cart__label">First Name</label>
                  <input
                    className={`cart__input ${formErrors.firstName ? "cart__input--error" : ""}`}
                    type="text" placeholder="John" value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                  {formErrors.firstName && <span className="cart__error">{formErrors.firstName}</span>}
                </div>
                <div className="cart__field">
                  <label className="cart__label">Last Name</label>
                  <input
                    className={`cart__input ${formErrors.lastName ? "cart__input--error" : ""}`}
                    type="text" placeholder="Doe" value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                  {formErrors.lastName && <span className="cart__error">{formErrors.lastName}</span>}
                </div>
              </div>

              <div className="cart__field">
                <label className="cart__label">Email</label>
                <input
                  className={`cart__input ${formErrors.email ? "cart__input--error" : ""}`}
                  type="email" placeholder="john@example.com" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                {formErrors.email && <span className="cart__error">{formErrors.email}</span>}
              </div>

              <div className="cart__field">
                <label className="cart__label">Phone Number</label>
                <input
                  className={`cart__input ${formErrors.phone ? "cart__input--error" : ""}`}
                  type="tel" placeholder="+995 555 000 000" value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                {formErrors.phone && <span className="cart__error">{formErrors.phone}</span>}
              </div>

              
              <div className="cart__field">
                <label className="cart__label">
                  Delivery Location
                  {geocoding && <span className="cart__label-geocoding"> ·  locating…</span>}
                </label>
                <input
                  className={`cart__input ${formErrors.location ? "cart__input--error" : ""}`}
                  type="text"
                  placeholder="Click the map or type an address"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
                {formErrors.location && <span className="cart__error">{formErrors.location}</span>}
              </div>

              
              <div className="cart__map-wrap">
                <span className="cart__map-label">
                  Georgia delivery zone — click to pin
                </span>
                <MapContainer
                  center={GEORGIA_CENTER}
                  zoom={7}
                  minZoom={6}
                  maxZoom={17}
                  maxBounds={GEORGIA_BOUNDS}
                  maxBoundsViscosity={1.0}
                  className="cart__map"
                  scrollWheelZoom
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapClickHandler onLocationPicked={handleLocationPicked} />
                  {markerPos && <Marker position={markerPos} />}
                </MapContainer>
              </div>
            </div>

            <div className="cart__summary">
              <div className="cart__summary-divider" />
              <div className="cart__summary-row">
                <span className="cart__summary-label">Total</span>
                <span className="cart__summary-total">${total.toFixed(2)}</span>
              </div>

              {submitError && (
                <p className="cart__submit-error">{submitError}</p>
              )}

              <button
                className={`cart__submit ${submitting ? "cart__submit--loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="cart__submit-spinner" />Placing Order...</>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;
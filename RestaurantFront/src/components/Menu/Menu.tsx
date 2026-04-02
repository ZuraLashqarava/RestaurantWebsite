import { useEffect, useState, useCallback } from "react";
import "./Menu.scss";

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

type CartButtonState = "idle" | "loading" | "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const API = "https://localhost:7035";

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number>>({});
  const [cartStates, setCartStates] = useState<Record<number, CartButtonState>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetch(`${API}/api/product`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        const defaults: Record<number, number> = {};
        data.forEach((p) => {
          if (p.variations.length > 0) defaults[p.id] = 0;
        });
        setSelectedVariations(defaults);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const addToCart = async (product: Product) => {
    
    if (cartStates[product.id] === "loading") return;

    setCartStates((prev) => ({ ...prev, [product.id]: "loading" }));

    try {
      const res = await fetch(`${API}/api/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to add item");
      }

      setCartStates((prev) => ({ ...prev, [product.id]: "success" }));
      showToast(`${product.name} added to cart!`, "success");
    } catch (err: any) {
      setCartStates((prev) => ({ ...prev, [product.id]: "error" }));
      showToast(err.message ?? "Something went wrong", "error");
    } finally {
     
      setTimeout(() => {
        setCartStates((prev) => ({ ...prev, [product.id]: "idle" }));
      }, 1500);
    }
  };

  const getSelectedVariation = (product: Product) => {
    const idx = selectedVariations[product.id] ?? 0;
    return product.variations[idx];
  };

  const getButtonLabel = (state: CartButtonState) => {
    switch (state) {
      case "loading": return "Adding…";
      case "success": return "Added ✓";
      case "error":   return "Try again";
      default:        return "Add to Cart";
    }
  };

  if (loading) {
    return (
      <div className="menu__state">
        <div className="menu__spinner" />
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu__state menu__state--error">
        <p>Failed to load menu: {error}</p>
      </div>
    );
  }

  return (
    <main className="menu">
      
      <div className="menu__toasts" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`menu__toast menu__toast--${t.type}`}
          >
            {t.message}
          </div>
        ))}
      </div>

      <div className="menu__header">
        <h1 className="menu__title">Our Menu</h1>
        <p className="menu__subtitle">Authentic Georgian cuisine, crafted with tradition</p>
        <div className="menu__divider" />
      </div>

      <div className="menu__grid">
        {products.map((product, i) => {
          const variation = getSelectedVariation(product);
          const hasMultiple = product.variations.length > 1;
          const btnState = cartStates[product.id] ?? "idle";

          return (
            <div
              className="menu__card"
              key={product.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="menu__card-img-wrap">
                <img
                  src={`${API}${product.imageUrl}`}
                  alt={product.name}
                  className="menu__card-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              <div className="menu__card-body">
                <div className="menu__card-top">
                  <h3 className="menu__card-name">{product.name}</h3>
                  <span className="menu__card-price">
                    ${variation?.price.toFixed(2)}
                  </span>
                </div>

                {hasMultiple ? (
                  <div className="menu__card-select-wrap">
                    <select
                      className="menu__card-select"
                      value={selectedVariations[product.id] ?? 0}
                      onChange={(e) =>
                        setSelectedVariations((prev) => ({
                          ...prev,
                          [product.id]: Number(e.target.value),
                        }))
                      }
                    >
                      {product.variations.map((v, idx) => (
                        <option key={v.id} value={idx}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <span className="menu__card-arrow">▾</span>
                  </div>
                ) : (
                  <p className="menu__card-variation">{variation?.name}</p>
                )}

                <button
                  className={`menu__card-btn menu__card-btn--${btnState}`}
                  onClick={() => addToCart(product)}
                  disabled={btnState === "loading"}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {btnState === "loading" && (
                    <span className="menu__card-btn-spinner" />
                  )}
                  {getButtonLabel(btnState)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Menu;
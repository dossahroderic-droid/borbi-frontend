import { useState, useEffect, useCallback, useRef } from "react";

const C = {
  navy: "#1e3a8a",
  green: "#10b981",
  amber: "#f59e0b",
  bg: "#060d1f",
  card: "#112044",
  border: "#1e3a8a44",
  text: "#e8f0fe",
  muted: "#7a92cc",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://borbi-backend.onrender.com/api";

// Composant d'affichage d'image (avec types)
const ProductImage = ({ imageUrl, emoji = "📦", width = 120, height = 120 }: { imageUrl?: string; emoji?: string; width?: number; height?: number }) => {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (imageUrl) setSrc(imageUrl);
  }, [imageUrl]);
  return (
    <div style={{ width, height, borderRadius: 12, overflow: "hidden", background: "#0d1b38", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src ? (
        <img src={src} alt="produit" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: 48 }}>{emoji}</span>
      )}
    </div>
  );
};

// Uploader vers Cloudinary via backend
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Upload échoué");
  const data = await res.json();
  return { url: data.url, publicId: data.public_id };
};

// Composant d'upload d'image
const ImageUploader = ({ onUploaded, currentUrl, label }: { onUploaded: (result: { url: string; publicId: string }) => void; currentUrl?: string; label?: string }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const result = await uploadToCloudinary(file);
      setPreview(result.url);
      onUploaded(result);
    } catch (err) {
      console.error(err);
      alert("Erreur d'upload");
    }
    setUploading(false);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: C.muted }}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${C.border}`,
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
          cursor: "pointer",
          background: preview ? "#0d1b38" : "transparent",
          marginTop: 4,
        }}
      >
        {preview ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={preview} alt="aperçu" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />
            <div style={{ fontSize: 13, color: C.green }}>✓ Image chargée</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28 }}>📷</div>
            <div style={{ fontSize: 13 }}>{uploading ? "Upload en cours..." : "Cliquez pour choisir une image"}</div>
            <div style={{ fontSize: 11, color: C.muted }}>JPG, PNG, WebP (max 5 Mo)</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
};

// Page principale
export default function BorBiImages() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products/default`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateProductImage = async (product: any, result: { url: string; publicId: string }) => {
    // Ici, vous pouvez ajouter une route pour mettre à jour l'URL de l'image dans MongoDB
    // Pour l'instant, on met juste à jour l'état local
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, imageUrl: result.url } : p))
    );
    setEditing(null);
    alert("Image mise à jour ! (sauvegarde en base à implémenter)");
  };

  const filtered = products.filter((p) => p.nameFr?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: products.length,
    avecImage: products.filter((p) => p.imageUrl).length,
    sansImage: products.filter((p) => !p.imageUrl).length,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>🖼️ Gestionnaire d'images</h1>
      <p style={{ color: C.muted, marginBottom: 20 }}>Ajoutez ou modifiez les photos des produits (stockées sur Cloudinary).</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ background: C.card, padding: 12, borderRadius: 12, flex: 1 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Total produits</div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>{stats.total}</div>
        </div>
        <div style={{ background: C.card, padding: 12, borderRadius: 12, flex: 1 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Avec image ✓</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: C.green }}>{stats.avecImage}</div>
        </div>
        <div style={{ background: C.card, padding: 12, borderRadius: 12, flex: 1 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Sans image ⚠</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: C.amber }}>{stats.sansImage}</div>
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: C.card,
          color: C.text,
          marginBottom: 16,
        }}
      />

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((p) => {
            const isEditing = editing?.id === p.id;
            return (
              <div key={p.id} style={{ background: C.card, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <ProductImage imageUrl={p.imageUrl} emoji="📦" width={50} height={50} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold" }}>{p.nameFr}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.category} · {Math.round(p.defaultPrice)} FCFA</div>
                  {p.imageUrl ? <div style={{ fontSize: 10, color: C.green }}>✓ Image Cloudinary</div> : <div style={{ fontSize: 10, color: C.amber }}>⚠ Pas d'image</div>}
                </div>
                {isEditing ? (
                  <div style={{ width: 250 }}>
                    <ImageUploader
                      currentUrl={p.imageUrl}
                      onUploaded={(result) => updateProductImage(p, result)}
                      label=""
                    />
                    <button
                      onClick={() => setEditing(null)}
                      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 12px", cursor: "pointer", marginTop: 8 }}
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(p)}
                    style={{ background: p.imageUrl ? C.navy : C.amber, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
                  >
                    📷 {p.imageUrl ? "Changer" : "Ajouter"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

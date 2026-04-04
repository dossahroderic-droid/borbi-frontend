import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/default`)
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Bor‑Bi par TransTech Solution</h1>
        <p className="text-sm opacity-90">Gestion commerciale pour vendeurs et grossistes</p>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Produits à la une</h2>
          <Link href="/login" className="bg-success text-white px-4 py-2 rounded-lg">
            Connexion
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 20).map((product: any) => (
              <div key={product.id} className="border rounded-lg p-3 shadow-sm">
                <div className="h-32 w-full bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                  📷
                </div>
                <h3 className="font-semibold text-sm">{product.nameFr}</h3>
                <p className="text-success font-bold text-sm">{product.defaultPrice} FCFA / {product.unit}</p>
                {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-100 text-center p-4 text-sm text-gray-500 mt-8">
        © 2025 Bor-bi Tech par TransTech Solution
      </footer>
    </div>
  );
}

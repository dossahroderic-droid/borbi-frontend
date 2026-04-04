import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function StockPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setProducts)
      .catch(err => toast.error('Erreur chargement du stock'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion du stock</h1>
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Aucun produit dans votre catalogue
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Produit</th>
                  <th className="p-3 text-left">Prix</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-3">{product.productDetails?.nameFr || product.productId}</td>
                    <td className="p-3">{product.price} FCFA</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3">
                      {product.stock < 5 ? (
                        <span className="text-danger text-sm">⚠️ Stock bas</span>
                      ) : (
                        <span className="text-success text-sm">✓ Disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VendorOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/orders/vendor').catch(() => []),
      api('/wholesalers').catch(() => [])
    ])
      .then(([ordersData, wholesalersData]) => {
        setOrders(ordersData || []);
        setWholesalers(wholesalersData || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status)

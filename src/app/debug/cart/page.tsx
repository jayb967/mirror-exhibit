'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cartService } from '@/services/cartService';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartWithAuth } from '@/redux/features/cartSlice';

export default function CartDebugPage() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.cart);
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testProductId, setTestProductId] = useState('');

  const fetchDebugData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/debug/cart?userId=${user.id}`);
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    if (!user?.id || !testProductId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/debug/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_add_to_cart',
          userId: user.id,
          productId: testProductId
        })
      });
      const result = await response.json();
      console.log('Test add to cart result:', result);

      // Refresh debug data
      await fetchDebugData();
    } catch (error) {
      console.error('Error testing add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCartService = async () => {
    if (!testProductId) return;

    setLoading(true);
    try {
      console.log('Testing cart service with product ID:', testProductId);
      const result = await cartService.addToCart(testProductId, 1);
      console.log('Cart service result:', result);

      // Refresh debug data
      await fetchDebugData();
    } catch (error) {
      console.error('Error testing cart service:', error);
    } finally {
      setLoading(false);
    }
  };

  const testReduxCart = async () => {
    if (!testProductId) return;

    setLoading(true);
    try {
      console.log('Testing Redux cart with product ID:', testProductId);
      const result = await (dispatch as any)(addToCartWithAuth({
        id: testProductId,
        product_id: testProductId,
        title: 'Test Product',
        quantity: 1,
        price: 29.99,
        image: '/test-image.jpg'
      }));
      console.log('Redux cart result:', result);

      // Refresh debug data
      await fetchDebugData();
    } catch (error) {
      console.error('Error testing Redux cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDebugData();
    }
  }, [user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Cart Debug Page</h1>
        <p>Please log in to debug cart functionality.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Cart Debug Page</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <p><strong>User ID:</strong> {user?.id}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Cart Functions</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Product ID"
            value={testProductId}
            onChange={(e) => setTestProductId(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={testAddToCart}
            disabled={loading || !testProductId}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Database Add
          </button>
          <button
            onClick={testCartService}
            disabled={loading || !testProductId}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Cart Service
          </button>
          <button
            onClick={testReduxCart}
            disabled={loading || !testProductId}
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Redux Cart
          </button>
          <button
            onClick={fetchDebugData}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {debugData && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Redux Cart State</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(cartItems, null, 2)}
            </pre>
            <p className="mt-2"><strong>Items in Redux cart:</strong> {cartItems.length}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Table Counts</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugData.data.tableInfo, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Cart Items</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugData.data.cartItems, null, 2)}
            </pre>
            {debugData.data.cartError && (
              <p className="text-red-500 mt-2">Error: {debugData.data.cartError}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Cart Tracking</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugData.data.cartTracking, null, 2)}
            </pre>
            {debugData.data.trackingError && (
              <p className="text-red-500 mt-2">Error: {debugData.data.trackingError}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Sample Products</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugData.data.sampleProducts, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Sample Variations</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugData.data.sampleVariations, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

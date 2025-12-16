'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RateItem {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  outputPerHourSubmitted: number;
  createdAt: string;
}

export default function RatesPage() {
  const [rateItems, setRateItems] = useState<RateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRateItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchRateItems = async () => {
    try {
      setLoading(true);
      const url = search 
        ? `/api/rates?search=${encodeURIComponent(search)}`
        : '/api/rates';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setRateItems(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rates/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchRateItems();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rate Items (Unit Price Analysis)</h1>
        <Link href="/rates/new" className="primary">
          + New Rate Item
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by pay item number or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : rateItems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded text-center">
          <p className="text-gray-600 mb-4">No rate items found.</p>
          <Link href="/rates/new" className="primary">
            Create your first rate item
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table>
            <thead>
              <tr>
                <th>Pay Item No.</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Output/Hour</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rateItems.map((item) => (
                <tr key={item._id}>
                  <td className="font-mono">{item.payItemNumber}</td>
                  <td>{item.payItemDescription}</td>
                  <td>{item.unitOfMeasurement}</td>
                  <td>{item.outputPerHourSubmitted}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link 
                        href={`/rates/${item._id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/rates/${item._id}/edit`}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

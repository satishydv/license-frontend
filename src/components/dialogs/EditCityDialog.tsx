'use client';

import { useState, useEffect } from 'react';
import { useCities } from '@/contexts/CityContext';
import { City } from '@/types/city';

interface EditCityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  city: City | null;
}

export default function EditCityDialog({ isOpen, onClose, city }: EditCityDialogProps) {
  const { updateCity } = useCities();
  const [formData, setFormData] = useState({
    city_name: '',
    city_state: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (city) {
      setFormData({
        city_name: city.city_name,
        city_state: city.city_state
      });
      setErrors({});
    }
  }, [city]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.city_name.trim()) {
      newErrors.city_name = 'City name is required';
    } else if (formData.city_name.trim().length < 2) {
      newErrors.city_name = 'City name must be at least 2 characters';
    }

    if (!formData.city_state.trim()) {
      newErrors.city_state = 'State is required';
    } else if (formData.city_state.trim().length < 2) {
      newErrors.city_state = 'State must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!city) return;

    setIsLoading(true);
    try {
      await updateCity(
        city.city_id,
        formData.city_name.trim(),
        formData.city_state.trim()
      );
      
      // Reset form and close dialog
      setFormData({
        city_name: '',
        city_state: ''
      });
      setErrors({});
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update city:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update city' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        city_name: '',
        city_state: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !city) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit City</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <div>
            <label htmlFor="city_name" className="block text-sm font-medium text-gray-700 mb-1">
              City Name *
            </label>
            <input
              type="text"
              id="city_name"
              name="city_name"
              value={formData.city_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                errors.city_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter city name"
              disabled={isLoading}
            />
            {errors.city_name && (
              <p className="mt-1 text-sm text-red-600">{errors.city_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="city_state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              id="city_state"
              name="city_state"
              value={formData.city_state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                errors.city_state ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter state name"
              disabled={isLoading}
            />
            {errors.city_state && (
              <p className="mt-1 text-sm text-red-600">{errors.city_state}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-800 bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update City'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

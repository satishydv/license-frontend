'use client';

import { useState } from 'react';
import { useVendors } from '@/contexts/VendorContext';

interface AddVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddVendorDialog({ isOpen, onClose }: AddVendorDialogProps) {
  const { createVendor } = useVendors();
  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    address: '',
    amount: '',
    pay_amount: '',
    mode_of_payment: '' as 'cash' | 'upi' | 'bank-transfer' | '',
    total_customer: '',
    receipt_image_path: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number to restrict to 10 digits
    if (name === 'phone_no') {
      // Remove any non-digit characters and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      receipt_image_path: file
    }));
    if (errors.receipt_image_path) {
      setErrors(prev => ({
        ...prev,
        receipt_image_path: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone_no.trim()) {
      newErrors.phone_no = 'Phone number is required';
    } else if (formData.phone_no.length !== 10) {
      newErrors.phone_no = 'Phone number must be exactly 10 digits';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    // Amount is now optional, but if provided, must be valid
    if (formData.amount && (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    // Pay amount is now optional, but if provided, must be valid
    if (formData.pay_amount && (isNaN(parseFloat(formData.pay_amount)) || parseFloat(formData.pay_amount) < 0)) {
      newErrors.pay_amount = 'Please enter a valid pay amount';
    }
    if (!formData.total_customer || parseInt(formData.total_customer) < 0) {
      newErrors.total_customer = 'Valid customer count is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const vendorData = {
        name: formData.name.trim(),
        phone_no: formData.phone_no.trim(),
        address: formData.address.trim(),
        amount: formData.amount ? parseFloat(formData.amount) : null,
        pay_amount: formData.pay_amount ? parseFloat(formData.pay_amount) : null,
        mode_of_payment: formData.mode_of_payment || null,
        total_customer: parseInt(formData.total_customer),
        receipt_image_path: formData.receipt_image_path
      };
      
      await createVendor(vendorData);
      
      // Reset form and close dialog
      setFormData({
        name: '',
        phone_no: '',
        address: '',
        amount: '',
        pay_amount: '',
        mode_of_payment: '',
        total_customer: '',
        receipt_image_path: null
      });
      setErrors({});
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create vendor:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create vendor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        phone_no: '',
        address: '',
        amount: '',
        pay_amount: '',
        mode_of_payment: '',
        total_customer: '',
        receipt_image_path: null
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Vendor</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter vendor name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone_no"
                name="phone_no"
                value={formData.phone_no}
                onChange={handleInputChange}
                maxLength={10}
                pattern="[0-9]{10}"
                inputMode="numeric"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.phone_no ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter 10-digit phone number"
                disabled={isLoading}
              />
              {errors.phone_no && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone_no}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.address ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter full address"
              disabled={isLoading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (Optional)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.amount ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter amount (optional)"
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="pay_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pay Amount (Optional)
              </label>
              <input
                type="number"
                id="pay_amount"
                name="pay_amount"
                value={formData.pay_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.pay_amount ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter pay amount (optional)"
                disabled={isLoading}
              />
              {errors.pay_amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pay_amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="total_customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Customers *
              </label>
              <input
                type="number"
                id="total_customer"
                name="total_customer"
                value={formData.total_customer}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.total_customer ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
                disabled={isLoading}
              />
              {errors.total_customer && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.total_customer}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="mode_of_payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mode of Payment (Optional)
            </label>
            <select
              id="mode_of_payment"
              name="mode_of_payment"
              value={formData.mode_of_payment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            >
              <option value="">Select payment mode (optional)</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank-transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="receipt_image_path" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Receipt Image (Optional)
            </label>
            <input
              type="file"
              id="receipt_image_path"
              name="receipt_image_path"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            {formData.receipt_image_path && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.receipt_image_path.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

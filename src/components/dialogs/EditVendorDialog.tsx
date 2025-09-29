'use client';

import { useState, useEffect } from 'react';
import { useVendors } from '@/contexts/VendorContext';
import { Vendor } from '@/types/vendor';

interface EditVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

export default function EditVendorDialog({ isOpen, onClose, vendor }: EditVendorDialogProps) {
  const { updateVendor } = useVendors();
  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    address: '',
    amount: '',
    pay_amount: '',
    mode_of_payment: 'cash' as 'cash' | 'upi' | 'bank-transfer',
    total_customer: '',
    receipt_image_path: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        phone_no: vendor.phone_no,
        address: vendor.address,
        amount: vendor.amount.toString(),
        pay_amount: vendor.pay_amount.toString(),
        mode_of_payment: vendor.mode_of_payment,
        total_customer: vendor.total_customer.toString(),
        receipt_image_path: null
      });
      setErrors({});
    }
  }, [vendor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.amount || parseFloat(formData.amount) < 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.pay_amount || parseFloat(formData.pay_amount) < 0) {
      newErrors.pay_amount = 'Valid pay amount is required';
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
    if (!vendor) return;

    setIsLoading(true);
    try {
      const vendorData = {
        name: formData.name.trim(),
        phone_no: formData.phone_no.trim(),
        address: formData.address.trim(),
        amount: parseFloat(formData.amount),
        pay_amount: parseFloat(formData.pay_amount),
        mode_of_payment: formData.mode_of_payment,
        total_customer: parseInt(formData.total_customer),
        receipt_image_path: formData.receipt_image_path
      };
      
      await updateVendor(vendor.vendor_id, vendorData);
      
      // Reset form and close dialog
      setFormData({
        name: '',
        phone_no: '',
        address: '',
        amount: '',
        pay_amount: '',
        mode_of_payment: 'cash',
        total_customer: '',
        receipt_image_path: null
      });
      setErrors({});
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update vendor:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update vendor' });
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
        mode_of_payment: 'cash',
        total_customer: '',
        receipt_image_path: null
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Vendor</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.phone_no ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter phone number"
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
                Amount *
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
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="pay_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pay Amount *
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
                placeholder="0.00"
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
              Mode of Payment *
            </label>
            <select
              id="mode_of_payment"
              name="mode_of_payment"
              value={formData.mode_of_payment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            >
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            />
            {formData.receipt_image_path && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.receipt_image_path.name}
              </p>
            )}
            {vendor.receipt_image_path && !formData.receipt_image_path && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Current: {vendor.receipt_image_path}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

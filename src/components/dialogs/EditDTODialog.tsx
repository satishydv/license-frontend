'use client';

import { useState, useEffect, useRef } from 'react';
import { useDTOs } from '@/contexts/DTOContext';
import { DTO } from '@/types/dto';
import { getBaseUrl } from '@/lib/utils';

interface EditDTODialogProps {
  isOpen: boolean;
  onClose: () => void;
  dto: DTO | null;
}

export default function EditDTODialog({ isOpen, onClose, dto }: EditDTODialogProps) {
  const { updateDTO } = useDTOs();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    pay_amount: '',
    no_of_applicant: '',
    receipt: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dto) {
      setFormData({
        date: dto.date,
        amount: dto.amount ? dto.amount.toString() : '',
        pay_amount: dto.pay_amount ? dto.pay_amount.toString() : '',
        no_of_applicant: dto.no_of_applicant.toString(),
        receipt: null
      });
      setErrors({});
    }
  }, [dto]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      receipt: file
    }));
    if (errors.receipt) {
      setErrors(prev => ({
        ...prev,
        receipt: ''
      }));
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleViewCurrent = () => {
    if (dto?.receipt) {
      const baseUrl = getBaseUrl();
      const imageUrl = `${baseUrl}/public/payment/${dto.receipt}`;
      window.open(imageUrl, '_blank');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    // Amount is now optional, but if provided, must be valid
    if (formData.amount && (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    // Pay amount is now optional, but if provided, must be valid
    if (formData.pay_amount && (isNaN(parseFloat(formData.pay_amount)) || parseFloat(formData.pay_amount) < 0)) {
      newErrors.pay_amount = 'Please enter a valid pay amount';
    }
    if (!formData.no_of_applicant || parseInt(formData.no_of_applicant) < 0) {
      newErrors.no_of_applicant = 'Valid number of applicants is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (!dto) return;

    setIsLoading(true);
    try {
      const dtoData = {
        date: formData.date,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        pay_amount: formData.pay_amount ? parseFloat(formData.pay_amount) : null,
        no_of_applicant: parseInt(formData.no_of_applicant),
        receipt: formData.receipt
      };
      
      await updateDTO(dto.dto_id, dtoData);
      
      // Reset form and close dialog
      setFormData({
        date: '',
        amount: '',
        pay_amount: '',
        no_of_applicant: '',
        receipt: null
      });
      setErrors({});
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update DTO:', error);
      let errorMessage = 'Failed to update DTO';
      
      if (error instanceof Error) {
        // Check if it's a specific API error message
        if (error.message.includes('Permission denied') || error.message.includes('Forbidden')) {
          errorMessage = error.message;
        } else if (error.message !== 'Request failed') {
          errorMessage = error.message;
        } else {
          errorMessage = 'Failed to update DTO. Please check your permissions.';
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        date: '',
        amount: '',
        pay_amount: '',
        no_of_applicant: '',
        receipt: null
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !dto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit DTO</h2>
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.date ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="no_of_applicant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Applicants *
              </label>
              <input
                type="number"
                id="no_of_applicant"
                name="no_of_applicant"
                value={formData.no_of_applicant}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.no_of_applicant ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
                disabled={isLoading}
              />
              {errors.no_of_applicant && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.no_of_applicant}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Receipt Image (Optional)
            </label>
            {/* Hidden input, triggered by Update button */}
            <input
              ref={fileInputRef}
              type="file"
              id="receipt"
              name="receipt"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              disabled={isLoading}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleViewCurrent}
                disabled={!dto?.receipt}
                className={`px-3 py-2 text-sm rounded-md border ${dto?.receipt ? 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white' : 'opacity-50 cursor-not-allowed'}`}
              >
                View
              </button>
              <button
                type="button"
                onClick={handleChooseFile}
                disabled={isLoading}
                className="px-3 py-2 text-sm rounded-md bg-yellow-400 hover:bg-yellow-500 text-gray-900"
              >
                Update
              </button>
              {formData.receipt && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {formData.receipt.name}
                </span>
              )}
              {!formData.receipt && dto?.receipt && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Current: {dto.receipt}
                </span>
              )}
            </div>
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
              {isLoading ? 'Updating...' : 'Update DTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

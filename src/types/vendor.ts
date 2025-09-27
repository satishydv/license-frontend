export type Vendor = {
  vendor_id: number;
  name: string;
  phone_no: string;
  address: string;
  amount: number;
  pay_amount: number;
  mode_of_payment: 'cash' | 'upi' | 'bank-transfer';
  total_customer: number;
  receipt_image_path: string | null;
  created_at: string;
  updated_at: string;
};

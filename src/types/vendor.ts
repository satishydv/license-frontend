// Updated Vendor type with nullable amount and pay_amount fields
export type Vendor = {
  vendor_id: number;
  name: string;
  phone_no: string;
  address: string;
  amount: number | null;
  pay_amount: number | null;
  mode_of_payment: 'cash' | 'upi' | 'bank-transfer' | null;
  total_customer: number;
  receipt_image_path: string | null;
  created_at: string;
  updated_at: string;
};

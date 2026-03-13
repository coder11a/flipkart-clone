export type OrderItem = {
  productSlug: string;
  title: string;
  brand: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type OrderSummary = {
  id: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  shippingName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  items: OrderItem[];
};

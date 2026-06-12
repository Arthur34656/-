export interface Product {
  id: string;
  name: string;
  category: "knives" | "gas_sprays" | "self_defense" | "accessories";
  categoryLabel: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  features: string[];
  specs: {
    [key: string]: string;
  };
  isBestSeller?: boolean;
  legalSelfDefenseStatus: string; // Information on Ukrainian legal status
  isLegalInUkraine: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  productName: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    value: string;
    points: { [key: string]: number }; // Categories mapped to weight
  }[];
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface OrderDetails {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  deliveryMethod: "nova_poshta" | "ukr_poshta" | "pickup";
  novaPoshtaOffice?: string;
  address?: string;
  paymentMethod: "cod" | "online";
  promoCode?: string;
}

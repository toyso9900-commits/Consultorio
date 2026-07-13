export type Professional = {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialty: string;
  location: string;
  modality: string;
  price: number;
  isPremium: boolean;
  image: string;
  averageRating: number;
  reviewCount: number;
  isPremiumActive?: boolean;
  planPrice?: number | null;
  planDuration?: string | null;
};


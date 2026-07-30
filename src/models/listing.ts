export interface CropListing {
  id: string;
  farmerId: string;
  farmerName?: string;
  cropName: string;
  quantity: number;
  unit: string; // e.g. 'kg', 'quintal', 'sack', 'ton'
  pricePerUnit: number; // in NPR
  location: string; // District/City e.g. 'Chitwan', 'Jhapa', 'Kaski'
  contactInfo: string; // Phone number or email
  createdAt: string;
  description?: string;
  imageUrl?: string;
}

export interface Service {
  service: { $oid: string };
  name: string;
  description: string;
  price: number;
  _id: string;
}

export interface Image {
  id: string;
  url: string;
  _id: string;
}

export interface Address {
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SalonData {
  salonName: string;
  email: string;
  phone: number;
  address: Address;
  openingTime: string;
  closingTime: string;
  images: Image[];
  services: Service[];
  rating: string;
  is_Active: boolean;
  verified: boolean;
}
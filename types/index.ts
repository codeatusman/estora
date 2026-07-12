export type PropertyTypeValue =
  | "apartment"
  | "house"
  | "villa"
  | "studio"
  | "townhouse"
  | "penthouse"
  | "plot"
  | "flat"
  | "condo"
  | "duplex"
  | "townhome"
  | "other";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyTypeValue;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  is_featured: boolean;
  is_sold: boolean;
  created_at: string;
}

export type PropertyFilterType = PropertyTypeValue | null;

export interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

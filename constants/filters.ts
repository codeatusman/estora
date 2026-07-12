import { PropertyFilterType, PropertyTypeValue } from "@/types";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface FilterOption {
  label: string;
  value: PropertyFilterType;
  icon?: IoniconName;
}

export interface ListingFilterOption {
  label: string;
  value: PropertyTypeValue;
  icon: IoniconName;
}

export const PROPERTY_TYPE_OPTIONS: FilterOption[] = [
  { label: "All", value: null, icon: "apps-outline" },
  { label: "Apartment", value: "apartment", icon: "business-outline" },
  { label: "House", value: "house", icon: "home-outline" },
  { label: "Villa", value: "villa", icon: "leaf-outline" },
  { label: "Studio", value: "studio", icon: "cube-outline" },
  { label: "Townhouse", value: "townhouse", icon: "home-outline" },
  { label: "Penthouse", value: "penthouse", icon: "diamond-outline" },
  { label: "Plot", value: "plot", icon: "map-outline" },
];

export const LISTING_PROPERTY_OPTIONS: ListingFilterOption[] =
  PROPERTY_TYPE_OPTIONS.filter(
    (option): option is ListingFilterOption =>
      option.value !== null && !!option.icon,
  );

export const BEDROOM_OPTIONS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

export const PRICE_PRESETS = [
  { label: "Under PKR 50L", min: null, max: 5000000 },
  { label: "PKR 50L – PKR 1Cr", min: 5000000, max: 10000000 },
  { label: "PKR 1Cr – PKR 2Cr", min: 10000000, max: 20000000 },
  { label: "Above PKR 2Cr", min: 20000000, max: null },
];

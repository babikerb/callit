import {
  Coffee,
  CupSoda,
  Gamepad2,
  IceCreamCone,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';

export type Category = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

/** The decision categories a Call can be about. */
export const CATEGORIES: Category[] = [
  { key: 'food', label: 'Food', Icon: Utensils },
  { key: 'boba', label: 'Boba', Icon: CupSoda },
  { key: 'coffee', label: 'Coffee', Icon: Coffee },
  { key: 'dessert', label: 'Dessert', Icon: IceCreamCone },
  { key: 'activities', label: 'Activities', Icon: Gamepad2 },
];

export const CATEGORY_BY_KEY = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<string, Category>;

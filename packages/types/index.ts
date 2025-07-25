export interface Product {
  id: string;
  name: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., 'kg', 'liter', 'piece'
}

export interface RecipeComponent {
  rawMaterialId: string;
  quantity: number;
}

export interface Recipe {
  productId: string;
  components: RecipeComponent[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ConstructionSite {
  id: string;
  customerId: string;
  name: string;
  address: string;
  facilityId?: string; // Bağlı olduğu tesis ID'si
}

export interface Facility {
  id: string;
  name: string;
  address: string;
}

export interface Delivery {
  id: string;
  date: string;
  sourceFacilityId: string;
  productId: string;
  quantity: number;
  distanceKm: number;
  customerId: string;
  constructionSiteId: string;
}

//INTERFACES

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  email?: string;
  phone?: string;
  membership_number: string;
  member_state_id: number;
  discount: number;
  is_active: number; // 0 oder 1
  is_service_required: number; // 0 oder 1
  created_at: string;
}

export interface Artikel {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number | null;
  unit: string;
  category_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface GuestMember {
  id: null;
  first_name: "Gast";
  last_name: "";
}

//TYPES
export type User = {
  id: number;
  username: string;
  role: string;
  role_id: number;
};

export type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
};

export type NewMember = {
  first_name: string;
  last_name: string;
  birthdate: string;
  email?: string;
  phone?: string;
  membership_number: string;
  member_state_id: number;
  discount?: number;
  is_active: boolean;
  is_service_required: boolean;
};
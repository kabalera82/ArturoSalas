export type UserRole = 'user' | 'admin' | 'premium';
export type UserStatus = 'pendiente' | 'activo' | 'baneado';
export type CustomerOrigin = 'regular' | 'athlete' | 'admin_created';
export type MembershipStatus = 'inactive' | 'active' | 'pending' | 'expired';
export type MembershipPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface ShippingAddress {
  _id?: string;
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  esPredeterminada: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  addresses: ShippingAddress[];
}

export interface UserCustomer {
  isCustomer: boolean;
  origin: CustomerOrigin;
  since?: string;
}

export interface UserSportsProfile {
  isAthlete: boolean;
  isFederated: boolean;
  licenseNumber?: string;
  federationName?: string;
  clubName?: string;
}

export interface UserMembership {
  status: MembershipStatus;
  monthlyFee?: number;
  currency: string;
  startDate?: string;
  nextDueDate?: string;
}

export interface UserMembershipPayment {
  _id?: string;
  period: string;
  amount: number;
  currency: string;
  status: MembershipPaymentStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface Usuario {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  profile?: UserProfile;
  customer?: UserCustomer;
  sportsProfile?: UserSportsProfile;
  membership?: UserMembership;
  membershipPayments?: UserMembershipPayment[];
  metadata?: {
    lastLogin?: string;
    emailVerified: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaLogin {
  token: string;
  user: Usuario;
}

export type UsuarioInput = Partial<Omit<Usuario, 'id' | '_id' | 'createdAt' | 'updatedAt'>>;

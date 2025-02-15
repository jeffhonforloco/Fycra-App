export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  subscription: SubscriptionStatus;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  thumbnailStyle: 'modern' | 'dramatic' | 'minimal' | 'bold';
  defaultPrivacy: 'public' | 'private';
}

export interface SubscriptionStatus {
  plan: 'free' | 'pro';
  status: 'active' | 'inactive' | 'cancelled';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface AuthResponse {
  user: User | null;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } | null;
  error?: {
    message: string;
    code: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  preferences?: Partial<UserPreferences>;
}
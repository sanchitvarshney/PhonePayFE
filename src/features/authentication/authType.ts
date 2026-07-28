export interface LoginCredentials {
  username: string;
  password: string;
}

export type PasswordChangePayload = {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ForgotPasswordOtpPayload = {
  emailId: string;
};

export type ResetPasswordPayload = {
  emailId: string;
  otp: string;
  password: string;
};

/** API response body for /auth/signin */
export type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    department?: string;
    crn_mobile?: string;
    crn_email?: string;
    crn_id: string;
    company_id?: string;
    username: string;
    fav_pages?: { page_id: string; page_name: string; url: string }[];
    settings?: { name: string; code: string; value: string }[];
    crn_type: string;
    successPath?: string;
    validity?: number;
    other?: {
      m_v?: boolean | string;
      e_v?: boolean | string;
      c_p?: boolean | string;
    };
  };
  isTwoStep?: string;
  username?: string;
};

export interface AuthState {
  user: unknown | null;
  loading: boolean;
  token: string | null;
  changepasswordloading: boolean;
  otpLoading: boolean;
}

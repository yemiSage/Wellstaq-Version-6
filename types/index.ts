// path: types/index.ts
export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OnboardingData {
  email: string;
  password: string;
  otp: string;
  emailVerificationToken: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  businessName: string;
  businessWebsite: string;
  employeeCount: string;
  organizationType: string;
  workModel: string;
  invites: string;
}

export const initialData: OnboardingData = {
  email: "",
  password: "",
  otp: "",
  emailVerificationToken: "",
  firstName: "",
  lastName: "",
  phoneCode: "+234",
  phoneNumber: "",
  businessName: "",
  businessWebsite: "",
  employeeCount: "",
  organizationType: "",
  workModel: "",
  invites: "",
};
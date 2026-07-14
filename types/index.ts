export type Step = 1 | 2 | 3 | 4 | 5 | 6;

export interface OnboardingData {
  email: string;
  password: string;
  otp: string;
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

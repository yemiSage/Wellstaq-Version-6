export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OnboardingData {
  email: string;
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
  otp: "",
  firstName: "",
  lastName: "",
  phoneCode: "NG",
  phoneNumber: "",
  businessName: "",
  businessWebsite: "",
  employeeCount: "",
  organizationType: "",
  workModel: "",
  invites: "",
};

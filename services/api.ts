export const api = {
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  sendOTP: async (email: string) => {
    await api.delay(1000);
  },
  verifyOTP: async (code: string) => {
    await api.delay(1000);
    return code.length === 6; // Mock validation
  },
  submitData: async (data: any) => {
    await api.delay(1000);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingData', JSON.stringify(data));
    }
  }
};

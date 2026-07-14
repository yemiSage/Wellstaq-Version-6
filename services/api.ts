import type { OnboardingData } from "@/types";
import type { Branch, ChatMessage, DashboardBootstrap, ResourceMutation, UserProfile, UserSearchResult } from "@/types/api";
import { request, type RequestOptions } from "@/services/http";

const dataSource = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") as "mock" | "api";
const usingMockData = dataSource === "mock";
const backendPath = (path: string) => `/api/backend${path}`;

const demoUser: UserProfile = {
  firstName: "Demo",
  lastName: "Admin",
  email: "admin@example.com",
  businessName: "Wellstaq Demo",
};

let mockUser = demoUser;

async function mockResult<T>(value: T): Promise<T> {
  return structuredClone(value);
}

function onboardingProfile(data: Partial<OnboardingData>) {
  const profile = { ...data };
  delete profile.password;
  delete profile.otp;
  return profile;
}

async function fromApiOrMock<T>(path: string, fallback: T, options?: RequestOptions) {
  return usingMockData ? mockResult(fallback) : request<T>(backendPath(path), options);
}

export const api = {
  mode: dataSource,
  isMock: usingMockData,

  sendOTP: (email: string) => fromApiOrMock("/v1/auth/otp", { accepted: true }, {
    method: "POST",
    body: { email },
  }),
  verifyOTP: (code: string, email = "") => fromApiOrMock("/v1/auth/otp/verify", {
    verified: /^\d{6}$/.test(code),
  }, {
    method: "POST",
    body: { email, code },
  }).then((result) => result.verified),
  submitData: (data: Partial<OnboardingData>) => fromApiOrMock("/v1/onboarding", { saved: true }, {
    method: "PUT",
    body: data,
  }),

  auth: {
    sendOtp: (email: string) => fromApiOrMock("/v1/auth/otp", { accepted: true }, {
      method: "POST",
      body: { email },
    }),
    verifyOtp: async (email: string, code: string, password: string) => {
      if (usingMockData) {
        mockUser = { ...mockUser, email };
        return mockResult({ verified: /^\d{6}$/.test(code), user: mockUser });
      }
      return request<{ verified: boolean; user: UserProfile }>(backendPath("/v1/auth/otp/verify"), {
        method: "POST",
        body: { email, code, password },
      });
    },
    me: () => fromApiOrMock("/v1/auth/me", mockUser),
    logout: () => fromApiOrMock("/v1/auth/logout", { success: true }, { method: "POST" }),
  },

  onboarding: {
    save: (data: Partial<OnboardingData>) => fromApiOrMock("/v1/onboarding", { saved: true }, {
      method: "PUT",
      body: onboardingProfile(data),
    }),
    complete: async (data: OnboardingData) => {
      if (usingMockData) {
        mockUser = {
          ...mockUser,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          businessName: data.businessName.trim(),
          profileImage: undefined,
        };
        return mockResult({ completed: true });
      }
      return request<{ completed: boolean }>(backendPath("/v1/onboarding/complete"), {
        method: "POST",
        body: onboardingProfile(data),
      });
    },
  },

  dashboard: {
    bootstrap: async (): Promise<DashboardBootstrap> => {
      if (usingMockData) {
        const { mockDashboardBootstrap } = await import("@/services/mock-api");
        return mockResult({ ...mockDashboardBootstrap, user: mockUser });
      }
      return request<DashboardBootstrap>(backendPath("/v1/dashboard/bootstrap"));
    },
  },

  branches: {
    nameCurrent: (name: string) => fromApiOrMock("/v1/branches/current", { name, invitees: [] }, {
      method: "PUT",
      body: { name },
    }),
    create: (branch: Omit<Branch, "id">) => fromApiOrMock("/v1/branches", branch, {
      method: "POST",
      body: branch,
    }),
    select: (branchName: string) => fromApiOrMock("/v1/branches/active", { activeBranch: branchName }, {
      method: "PUT",
      body: { branchName },
    }),
  },

  users: {
    search: async (query: string): Promise<UserSearchResult[]> => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return [];

      if (usingMockData) {
        const { mockDashboardBootstrap } = await import("@/services/mock-api");
        return mockDashboardBootstrap.members
          .filter((member) => (
            member.name.toLowerCase().includes(normalized) ||
            member.email.toLowerCase().includes(normalized)
          ))
          .slice(0, 6)
          .map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
          }));
      }

      return request<UserSearchResult[]>(
        backendPath(`/v1/users/search?q=${encodeURIComponent(query.trim())}`),
      );
    },
  },

  ai: {
    chat: (messages: ChatMessage[], branchName: string) => request<{ message: string }>("/api/ai/chat", {
      method: "POST",
      body: { messages, branchName },
      timeoutMs: 30_000,
    }),
  },

  resources: {
    get: <T>(resource: string, id: string | number, fallback: T) =>
      fromApiOrMock(`/v1/${resource}/${encodeURIComponent(String(id))}`, fallback),
    list: <T>(resource: string, fallback: T, query = "") =>
      fromApiOrMock(`/v1/${resource}${query ? `?${query}` : ""}`, fallback),
    mutate: <T = { success: true }>({ resource, action, id, payload }: ResourceMutation) =>
      fromApiOrMock(`/v1/${resource}${id === undefined ? "" : `/${encodeURIComponent(String(id))}`}/${action}`, { success: true } as T, {
        method: "POST",
        body: payload,
      }),
    upload: (resource: string, file: File) => {
      if (usingMockData) {
        return mockResult({ url: URL.createObjectURL(file) });
      }

      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>(backendPath(`/v1/${resource}/upload`), {
        method: "POST",
        body: form,
      });
    },
  },

  public: {
    requestDemo: (payload: { name: string; email: string; reason: string }) =>
      fromApiOrMock("/v1/public/demo-requests", { accepted: true }, { method: "POST", body: payload }),
    contactSupport: (payload: { name: string; email: string; subject: string; message: string }) =>
      fromApiOrMock("/v1/support/tickets", { accepted: true }, { method: "POST", body: payload }),
  },
};

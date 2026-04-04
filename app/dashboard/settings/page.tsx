"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Palette, 
  Link as LinkIcon, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const NAV_ITEMS = [
  { id: "profile", label: "Profile", sublabel: "Personal information", icon: <User className="w-5 h-5" /> },
  { id: "account", label: "Account", sublabel: "Security & login", icon: <Shield className="w-5 h-5" /> },
  { id: "notifications", label: "Notifications", sublabel: "Alerts & reminders", icon: <Bell className="w-5 h-5" /> },
  { id: "privacy", label: "Privacy", sublabel: "Data & visibility", icon: <Lock className="w-5 h-5" /> },
  { id: "appearance", label: "Appearance", sublabel: "Theme & display", icon: <Palette className="w-5 h-5" /> },
  { id: "roles", label: "Roles & Permissions", sublabel: "Manage access levels", icon: <Lock className="w-5 h-5" /> },
  { id: "billing", label: "Billing", sublabel: "Plan & payments", icon: <CreditCard className="w-5 h-5" /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Opeyemi",
    lastName: "Adegboye",
    email: "yemi.fig@mail.com",
    phone: "+234 801 234 5678",
    location: "Lagos, Nigeria",
    website: "wellstaq.co/opeyemi",
    bio: "Wellness enthusiast and fitness community builder. Passionate about helping teams build healthy habits."
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.clear();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-[24px]">
        <h1 className="text-[20px] font-medium text-grey-1 mb-[6px] leading-[30px]">Settings</h1>
        <p className="text-sm text-grey-2">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-[12px] p-5 bg-white rounded-[12px]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[280px] flex flex-col gap-2 p-3 border border-grey-4 rounded-[8px] bg-white">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border-[1.5px] ${
                activeTab === item.id 
                  ? "bg-white border-[#F27D26] shadow-sm" 
                  : "bg-white border-[#E6E6E6] hover:bg-grey-5"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-[1.5px] ${
                activeTab === item.id ? "bg-white border-[#F27D26] text-[#F27D26]" : "bg-grey-5 border-transparent text-grey-2"
              }`}>
                {item.icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${activeTab === item.id ? "text-grey-1" : "text-grey-2"}`}>{item.label}</div>
                <div className={`text-[12px] ${activeTab === item.id ? "text-grey-2" : "text-grey-3"}`}>{item.sublabel}</div>
              </div>
            </button>
          ))}

          <div className="h-px bg-grey-4 my-2" />

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl text-left text-red-500 hover:bg-red-50 transition-all border-[1.5px] border-transparent"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Sign Out</div>
              <div className="text-[12px] opacity-70">Log out of account</div>
            </div>
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white rounded-[8px] border border-grey-4 p-5">
          {activeTab === "profile" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Profile Information</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Update your personal details here.</p>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm">
                    <Image 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop" 
                      alt="Profile" 
                      width={96} 
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#F27D26] rounded-full flex items-center justify-center text-white border-2 border-white">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="text-[16px] font-bold text-grey-1">Opeyemi Adegboye</div>
                  <div className="text-sm text-grey-2 mb-2">Community Manager</div>
                  <button className="text-sm font-medium text-[#F27D26]">Change photo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-1">First Name</label>
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-1">Last Name</label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-grey-1">Email Address</label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-1">Phone Number</label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-1">Location</label>
                  <Input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-grey-1">Website</label>
                <Input 
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-medium text-grey-1">Bio</label>
                <textarea 
                  className="w-full p-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[120px] resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
                <div className="text-right text-[10px] text-grey-3">{formData.bio.length}/200</div>
              </div>
            </>
          )}

          {activeTab === "account" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Account Security</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Manage your password and security settings.</p>
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-grey-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Change Password</div>
                    <div className="text-xs text-grey-2">Update your login credentials</div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
                <div className="p-4 rounded-xl border border-grey-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Two-Factor Authentication</div>
                    <div className="text-xs text-grey-2">Add an extra layer of security</div>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="p-4 rounded-xl border border-grey-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Active Sessions</div>
                    <div className="text-xs text-grey-2">Manage your logged-in devices</div>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Notification Preferences</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Choose what updates you want to receive.</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Email Notifications</div>
                    <div className="text-xs text-grey-2">Receive updates via email</div>
                  </div>
                  <div className="w-12 h-6 bg-[#F27D26] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Push Notifications</div>
                    <div className="text-xs text-grey-2">Receive alerts on your device</div>
                  </div>
                  <div className="w-12 h-6 bg-grey-4 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Challenge Reminders</div>
                    <div className="text-xs text-grey-2">Get notified about active challenges</div>
                  </div>
                  <div className="w-12 h-6 bg-[#F27D26] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "privacy" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Privacy Settings</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Control who can see your activity and profile.</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Public Profile</div>
                    <div className="text-xs text-grey-2">Allow others to see your profile</div>
                  </div>
                  <div className="w-12 h-6 bg-[#F27D26] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Show Activity</div>
                    <div className="text-xs text-grey-2">Display your wellness progress to teams</div>
                  </div>
                  <div className="w-12 h-6 bg-[#F27D26] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "appearance" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Appearance</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Customize how WellStaq looks on your device.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border-2 border-[#F27D26] bg-white flex flex-col gap-3 cursor-pointer">
                  <div className="w-full h-20 bg-grey-5 rounded-lg border border-grey-4" />
                  <div className="text-sm font-bold text-grey-1 text-center">Light Mode</div>
                </div>
                <div className="p-4 rounded-xl border border-grey-4 bg-white flex flex-col gap-3 cursor-pointer hover:bg-grey-5">
                  <div className="w-full h-20 bg-grey-1 rounded-lg border border-grey-4" />
                  <div className="text-sm font-bold text-grey-1 text-center">Dark Mode</div>
                </div>
              </div>
            </>
          )}

          {activeTab === "roles" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Roles & Permissions</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Manage user roles and their access levels across the platform.</p>
              
              <div className="space-y-6 mt-4">
                {[
                  { 
                    role: "Super Admin", 
                    description: "Full access to all features and settings across all branches.",
                    users: 2,
                    permissions: ["Manage Branches", "Manage Billing", "Full System Access"]
                  },
                  { 
                    role: "Branch Manager", 
                    description: "Manage teams, events, and challenges for a specific branch.",
                    users: 12,
                    permissions: ["Manage Branch Teams", "Create Events", "Manage Challenges"]
                  },
                  { 
                    role: "Team Lead", 
                    description: "Manage specific teams and view team-level insights.",
                    users: 45,
                    permissions: ["View Team Stats", "Approve Team Requests", "Create Team Events"]
                  },
                  { 
                    role: "Employee", 
                    description: "Standard access to participate in events and challenges.",
                    users: 850,
                    permissions: ["Participate in Events", "Join Challenges", "View Personal Stats"]
                  }
                ].map((role, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-grey-4 hover:border-primary-1/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-grey-1">{role.role}</h3>
                        <p className="text-xs text-grey-2 mt-1">{role.description}</p>
                      </div>
                      <div className="px-3 py-1 bg-grey-5 rounded-full text-[10px] font-bold text-grey-2">
                        {role.users} USERS
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((perm, pIdx) => (
                        <span key={pIdx} className="px-2 py-1 bg-primary-1/5 text-primary-1 text-[10px] font-medium rounded-md border border-primary-1/10">
                          {perm}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-grey-4/50">
                      <button className="text-xs font-bold text-grey-2 hover:text-grey-1">View Details</button>
                      <button className="text-xs font-bold text-primary-1 hover:text-primary-2">Edit Permissions</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "billing" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Billing & Subscription</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Manage your subscription plan and billing details.</p>
              <div className="p-6 rounded-xl bg-[#F27D26]/5 border border-[#F27D26]/20 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold text-[#F27D26] uppercase tracking-wider">Current Plan</div>
                    <div className="text-2xl font-bold text-grey-1">Professional Plan</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#F27D26] text-white text-[10px] font-bold">ACTIVE</div>
                </div>
                <div className="text-sm text-grey-2 mb-6">Your next billing date is April 23, 2026 for $49.00.</div>
                <Button className="bg-[#F27D26] hover:bg-[#F27D26]/90">Upgrade Plan</Button>
              </div>
              
              <h3 className="text-sm font-bold text-grey-1 mb-4">Payment Methods</h3>
              <div className="p-4 rounded-xl border border-grey-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-grey-5 rounded flex items-center justify-center border border-grey-4">
                    <CreditCard className="w-5 h-5 text-grey-2" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-grey-1">Visa ending in 4242</div>
                    <div className="text-xs text-grey-2">Expires 12/28</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-grey-4 mt-8">
            <Button variant="outline" onClick={() => toast.info("Changes discarded")}>Discard Changes</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive={true}
      />
    </div>
  );
}

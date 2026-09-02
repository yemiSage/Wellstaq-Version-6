"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Search, Plus, Calendar, Mail, MessageSquare, Video, Link as LinkIcon, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";

const INTEGRATION_PRESENTATION = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sync your wellness events and challenges directly to your Google Calendar.",
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
    iconBg: "bg-blue-50",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications about team wellness challenges and updates in your Slack channels.",
    icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
    iconBg: "bg-purple-50",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Automatically generate Zoom links for your virtual wellness sessions.",
    icon: <Video className="w-6 h-6 text-blue-400" />,
    iconBg: "bg-blue-50",
  },
  {
    id: "microsoft_outlook",
    name: "Microsoft Outlook",
    description: "Sync events and get email reminders through your Outlook account.",
    icon: <Mail className="w-6 h-6 text-blue-600" />,
    iconBg: "bg-blue-50",
  }
];

interface IntegrationView {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected";
  enabled: boolean;
  icon: ReactNode;
  iconBg: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organizationId } = useDashboardData();
  const [searchQuery, setSearchQuery] = useState("");
  const [integrationToDisconnect, setIntegrationToDisconnect] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    setIntegrations([]);
    setIsLoading(true);
    setError(null);
    void api.integrations.list(organizationId).then(({ items: remoteIntegrations }) => {
      if (cancelled) return;
      setIntegrations(remoteIntegrations.map((integration) => {
        const presentation = INTEGRATION_PRESENTATION.find((item) => item.id === integration.id);
        return {
          ...integration,
          icon: presentation?.icon ?? <LinkIcon className="h-6 w-6 text-grey-2" />,
          iconBg: presentation?.iconBg ?? "bg-grey-5",
        };
      }));
    }).catch(() => {
      if (!cancelled) setError("We couldn't load integrations. Try again.");
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [organizationId]);

  const filteredIntegrations = integrations.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (id: string) => {
    const integration = integrations.find((item) => item.id === id);
    if (!integration) return;
    if (!organizationId) return;
    await api.integrations.toggle(organizationId, id, !integration.enabled);
    setIntegrations(integrations.map(i => {
      if (i.id === id) {
        const newEnabled = !i.enabled;
        if (newEnabled) {
          toast.success(`${i.name} integration enabled`);
        } else {
          toast.info(`${i.name} integration disabled`);
        }
        return { ...i, enabled: newEnabled };
      }
      return i;
    }));
  };

  const handleConnect = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.status === "connected") {
      setIntegrationToDisconnect(id);
    } else {
      if (!organizationId) return;
      await api.integrations.connect(organizationId, id);
      setIntegrations(integrations.map(i => {
        if (i.id === id) {
          toast.success(`Successfully connected to ${i.name}`);
          return { ...i, status: "connected", enabled: true };
        }
        return i;
      }));
    }
  };

  const confirmDisconnect = async () => {
    if (integrationToDisconnect !== null) {
      if (!organizationId) return;
      await api.integrations.disconnect(organizationId, integrationToDisconnect);
      setIntegrations(integrations.map(i => {
        if (i.id === integrationToDisconnect) {
          toast.success(`Disconnected from ${i?.name}`);
          return { ...i, status: "disconnected", enabled: false };
        }
        return i;
      }));
      setIntegrationToDisconnect(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-description">Connect your favorite tools to streamline your wellness journey.</p>
        </div>
        <button className="px-4 py-2 bg-[#C45700] text-white font-medium text-sm rounded-lg hover:bg-[#C45700]/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[12px] p-6 flex flex-col gap-[20px] border border-grey-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input 
              type="text" 
              placeholder="Search integrations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-4 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading && Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-xl bg-grey-4" />
          ))}

          {!isLoading && error && (
            <div className="col-span-1 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 md:col-span-2" role="alert">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-[#FAFAFA] rounded-xl border border-grey-4 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integration.iconBg}`}>
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-grey-1 text-base">{integration.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {integration.status === "connected" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-grey-3 bg-grey-5 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Disconnected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Toggle Switch (only show if connected) */}
                {integration.status === "connected" && (
                  <button 
                    onClick={() => handleToggle(integration.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-1 focus:ring-offset-2 ${
                      integration.enabled ? 'bg-primary-1' : 'bg-grey-4'
                    }`}
                  >
                    <span className="sr-only">Enable {integration.name}</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        integration.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              </div>
              
              <p className="text-sm text-grey-2 leading-relaxed">
                {integration.description}
              </p>
              
              <div className="mt-auto pt-4 border-t border-grey-4 flex items-center justify-end">
                <button 
                  onClick={() => handleConnect(integration.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    integration.status === "connected" 
                      ? "bg-white border border-grey-4 text-grey-1 hover:bg-grey-5 hover:text-red-600" 
                      : "bg-primary-1 text-white hover:bg-primary-1/90"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  {integration.status === "connected" ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          ))}
          
          {!isLoading && !error && filteredIntegrations.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-grey-5 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-grey-3" />
              </div>
              <h3 className="text-lg font-bold text-grey-1 mb-1">No integrations found</h3>
              <p className="text-sm text-grey-2">We couldn&apos;t find any integrations matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={integrationToDisconnect !== null}
        onClose={() => setIntegrationToDisconnect(null)}
        onConfirm={confirmDisconnect}
        title="Disconnect Integration"
        description={`Are you sure you want to disconnect ${integrations.find(i => i.id === integrationToDisconnect)?.name}? This will stop syncing data between the platforms.`}
        confirmText="Disconnect"
        isDestructive={true}
      />
    </div>
  );
}

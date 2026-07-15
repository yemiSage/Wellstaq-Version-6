"use client";

import { useState } from "react";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2,
  HelpCircle,
  Clock,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    await api.public.contactSupport(formData);
    setIsSubmitted(true);
    toast.success("Message sent successfully!");
  };

  if (isSubmitted) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-[24px]">
          <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Contact Support</h1>
          <p className="text-sm text-grey-2">Have questions about WellStaq? Our team is here to help you build a healthier workplace.</p>
        </div>
        <div className="bg-white p-12 rounded-[12px] shadow-sm border border-grey-4 text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-grey-1 mb-2">Message Sent!</h2>
          <p className="text-grey-2 mb-8">
            Thank you for reaching out. Our support team will get back to you within 24 hours.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="inline-flex items-center justify-center px-8 py-3 bg-[#EA6A05] text-white rounded-xl font-bold hover:bg-[#C45700] transition-all"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-[24px]">
        <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Contact Support</h1>
        <p className="text-sm text-grey-2">Have questions about WellStaq? Our team is here to help you build a healthier workplace.</p>
      </div>

      <div className="flex flex-col gap-[12px] p-5 bg-white rounded-[12px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
          {/* Contact Info */}
          <div className="space-y-[12px]">
            <div className="bg-white p-6 rounded-[12px] border border-grey-4 space-y-6">
              <h3 className="text-[18px] font-bold text-grey-1">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#EA6A05]/10 text-[#EA6A05] rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-grey-1 text-sm">Email Us</h4>
                    <p className="text-sm text-grey-2 mt-1">support@wellstaq.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#EA6A05]/10 text-[#EA6A05] rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-grey-1 text-sm">Call Us</h4>
                    <p className="text-sm text-grey-2 mt-1">+1 (555) 000-0000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#EA6A05]/10 text-[#EA6A05] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-grey-1 text-sm">Our Office</h4>
                    <p className="text-sm text-grey-2 mt-1">123 Wellness Way, San Francisco, CA 94103</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#EA6A05] p-6 rounded-[12px] text-white">
              <HelpCircle className="mb-4 opacity-80" size={32} />
              <h3 className="text-[18px] font-bold mb-2">Check our Help Center</h3>
              <p className="text-white/80 text-sm mb-6">
                Find quick answers to common questions in our comprehensive documentation.
              </p>
              <button className="w-full py-3 bg-white text-[#EA6A05] rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
                Go to Help Center
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 flex flex-col gap-[12px]">
            <div className="bg-white p-6 rounded-[12px] border border-grey-4 flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-grey-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#EA6A05]/20 focus:border-[#EA6A05] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-grey-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#EA6A05]/20 focus:border-[#EA6A05] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-grey-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#EA6A05]/20 focus:border-[#EA6A05] transition-all bg-white"
                  >
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-grey-1">Message</label>
                  <textarea
                    rows={6}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#EA6A05]/20 focus:border-[#EA6A05] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#EA6A05] text-white rounded-xl font-bold text-lg hover:bg-[#C45700] transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
              <div className="flex items-center gap-3 p-4 bg-white rounded-[12px] border border-grey-4">
                <Clock className="text-[#EA6A05]" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-grey-1">Response Time</p>
                  <p className="text-grey-2">Under 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-[12px] border border-grey-4">
                <Globe className="text-[#EA6A05]" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-grey-1">Global Support</p>
                  <p className="text-grey-2">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-[12px] border border-grey-4">
                <MessageSquare className="text-[#EA6A05]" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-grey-1">Live Chat</p>
                  <p className="text-grey-2">Available for Pro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

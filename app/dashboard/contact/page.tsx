"use client";

import { useState } from "react";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
  Clock,
  Globe
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitted(true);
    toast.success("Message sent successfully!");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-sm border border-grey-4 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-grey-1 mb-2">Message Sent!</h2>
          <p className="text-grey-2 mb-8">
            Thank you for reaching out. Our support team will get back to you within 24 hours.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary-1 text-white rounded-xl font-bold hover:bg-primary-1/90 transition-all"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Navigation */}
      <nav className="bg-white border-b border-grey-4 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-grey-2 hover:text-grey-1 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-1 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="font-bold text-grey-1">WellStaq</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-grey-1 mb-4"
          >
            How can we help you?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-grey-2 max-w-2xl mx-auto"
          >
            Have questions about WellStaq? Our team is here to help you build a healthier workplace.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-grey-4 space-y-8">
              <h3 className="text-xl font-bold text-grey-1">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-5 text-primary-1 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-grey-1 text-sm">Email Us</h4>
                    <p className="text-sm text-grey-2 mt-1">support@wellstaq.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-5 text-primary-1 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-grey-1 text-sm">Call Us</h4>
                    <p className="text-sm text-grey-2 mt-1">+1 (555) 000-0000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-5 text-primary-1 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-grey-1 text-sm">Our Office</h4>
                    <p className="text-sm text-grey-2 mt-1">123 Wellness Way, San Francisco, CA 94103</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-grey-4">
                <h4 className="font-bold text-grey-1 text-sm mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-grey-5 rounded-full hover:bg-primary-5 hover:text-primary-1 transition-all cursor-pointer" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-primary-1 p-8 rounded-3xl text-white">
              <HelpCircle className="mb-4 opacity-80" size={32} />
              <h3 className="text-xl font-bold mb-2">Check our Help Center</h3>
              <p className="text-white/80 text-sm mb-6">
                Find quick answers to common questions in our comprehensive documentation.
              </p>
              <button className="w-full py-3 bg-white text-primary-1 rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
                Go to Help Center
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 rounded-3xl border border-grey-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-grey-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-grey-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-grey-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-all bg-white"
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
                    className="w-full px-4 py-3 rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary-1 text-white rounded-xl font-bold text-lg hover:bg-primary-1/90 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-grey-4">
                <Clock className="text-primary-1" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-grey-1">Response Time</p>
                  <p className="text-grey-2">Under 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-grey-4">
                <Globe className="text-primary-1" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-grey-1">Global Support</p>
                  <p className="text-grey-2">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-grey-4">
                <MessageSquare className="text-primary-1" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-grey-1">Live Chat</p>
                  <p className="text-grey-2">Available for Pro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronDown, 
  Plus, 
  Layers, 
  ChevronRight, 
  Camera, 
  Moon, 
  Circle, 
  Target, 
  Users, 
  BookOpen, 
  Leaf, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Palette, 
  Clock, 
  Bell, 
  Trophy,
  Zap,
  Eye,
  RefreshCw,
  Compass,
  GitBranch,
  UserPlus,
  Phone,
  MapPin,
  Mail,
  Linkedin,
  Instagram,
  Twitter,
  Layout,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', reason: '' });

  // Marquee items for Logo Strip
  const brands = ["Tricycle", "Inventory", "Neoniq", "Vertex", "Quonar", "Fission"];

  const wellbeingPillars = [
    {
      title: "Mental Wellbeing",
      description: "Build clarity, resilience, and emotional awareness with guided check-ins and AI nudges.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L16 16H0V0Z" fill="currentColor"/>
          <path d="M16 0L32 16H16V0Z" fill="currentColor"/>
          <path d="M0 16L16 32H0V16Z" fill="currentColor"/>
          <path d="M16 16L32 32H16V16Z" fill="currentColor"/>
        </svg>
      ),
      variant: "white"
    },
    {
      title: "Physical Wellbeing",
      description: "Track movements, energies, sleep, and every habits that support long-term health of your staff or employee.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 0V32C1.79086 32 0 30.2091 0 28V4C0 1.79086 1.79086 0 4 0Z" fill="currentColor"/>
          <path opacity="0.3" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0V32Z" fill="currentColor"/>
          <path opacity="0.5" d="M8 32C16.8366 32 24 24.8366 24 16C24 7.16344 16.8366 0 8 0V32Z" fill="currentColor"/>
        </svg>
      ),
      variant: "orange"
    },
    {
      title: "Financial Wellbeing",
      description: "Encourage smarter financial habits with literacy programs and consistent progress tracking.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="currentColor" opacity="0.2"/>
          <path d="M16 16L32 16C32 24.8366 24.8366 32 16 32V16Z" fill="currentColor"/>
          <path d="M16 16L16 0C7.16344 0 0 7.16344 0 16H16V16Z" fill="currentColor"/>
          <path d="M16 16V32C7.16344 32 0 24.8366 0 16H16V32Z" fill="currentColor" opacity="0.5"/>
        </svg>
      ),
      variant: "white"
    },
    {
      title: "Occupation Wellbeing",
      description: "Align productivity with purpose through focus modes and performance balance tools.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="currentColor" opacity="0.1"/>
          <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.3"/>
          <circle cx="16" cy="16" r="8" fill="currentColor"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
      ),
      variant: "white"
    },
    {
      title: "Social Wellbeing",
      description: "Strengthen relationships through clubs, events, communities and shared experiences.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4" cy="4" r="4" fill="currentColor"/>
          <circle cx="16" cy="4" r="4" fill="currentColor"/>
          <circle cx="28" cy="4" r="4" fill="currentColor"/>
          <circle cx="4" cy="16" r="4" fill="currentColor"/>
          <circle cx="16" cy="16" r="4" fill="currentColor"/>
          <circle cx="28" cy="16" r="4" fill="currentColor"/>
          <circle cx="4" cy="28" r="4" fill="currentColor"/>
          <circle cx="16" cy="28" r="4" fill="currentColor"/>
          <circle cx="28" cy="28" r="4" fill="currentColor"/>
        </svg>
      ),
      variant: "white"
    },
    {
      title: "Intellectual Wellbeing",
      description: "Stimulate growth with curated content, learning challenges, and skill-building prompts.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="6" fill="currentColor"/>
          <circle cx="4" cy="4" r="4" fill="currentColor"/>
          <circle cx="28" cy="4" r="4" fill="currentColor"/>
          <circle cx="4" cy="28" r="4" fill="currentColor"/>
          <circle cx="28" cy="28" r="4" fill="currentColor"/>
        </svg>
      ),
      variant: "white"
    },
    {
      title: "Environment Wellbeing",
      description: "Encourage healthier surroundings and sustainable choices at work and also beyond work.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L24 16L16 30L8 16L16 2Z" fill="currentColor"/>
          <path d="M4 8L8 16L4 24L0 16L4 8Z" fill="currentColor" opacity="0.5"/>
          <path d="M28 8L32 16L28 24L24 16L28 8Z" fill="currentColor" opacity="0.5"/>
        </svg>
      ),
      variant: "white"
    },
    {
      title: "Spiritual Wellbeing",
      description: "Create a safe space for personal reflection, mindfulness, and also personal meaning.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C16 8.83656 8.83656 16 0 16C8.83656 16 16 23.1634 16 32C16 23.1634 23.1634 16 32 16C23.1634 16 16 8.83656 16 0Z" fill="currentColor"/>
          <path opacity="0.5" d="M16 4C16 10.6274 10.6274 16 4 16C10.6274 16 16 21.3726 16 28C16 21.3726 21.3726 16 28 16C21.3726 16 16 10.6274 16 4Z" fill="currentColor"/>
        </svg>
      ),
      variant: "green"
    }
  ];

  const featureTabs = [
    {
      title: "Spark wellbeing awareness across your workforce",
      subtitle: "Enable the measurement of wellbeing in a way that respects privacy and comfort.",
      image: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377110/Spark_wellbeing_awareness_across_your_workforce_y8lc56.png"
    },
    {
      title: "Foster a workplace culture that encourages teamwork.",
      subtitle: "Foster an environment where discussions about mental health are welcomed and encouraged.",
      image: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377116/Foster_a_workplace_culture_that_encourages_teamwork._n1jrrd.png"
    },
    {
      title: "Provide flexible work options for better work-life balance.",
      subtitle: "Promote a healthy work-life balance that benefits every employee.",
      image: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377109/Provide_flexible_work_options_for_better_work-life_balance._v5y1m1.png"
    },
    {
      title: "Ensure easy access to wellness resources for health.",
      subtitle: "Provide resources and initiatives that encourage and support healthy living.",
      image: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377110/Ensure_easy_access_to_wellness_resources_for_health._p0otgo.png"
    }
  ];

  const faqs = [
    {
      icon: <Zap className="w-6 h-6 text-primary-orange" />,
      question: "What makes Wellstaq different?",
      answer: "Wellstaq is transforming wellbeing into a sustainable practice for everyone. By using a simple behavioral loop, it helps people incorporate healthy habits into their daily routines, making the path to wellness both achievable and enjoyable."
    },
    {
      icon: <Eye className="w-6 h-6 text-primary-orange" />,
      question: "Is employee data visible to HR or management?",
      answer: "No individual data is shared with employers. HR teams only see anonymous, aggregated insights across departments or teams. Wellstaq is built with privacy and compliance at its core — supporting NDPR and global data standards."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-primary-orange" />,
      question: "How quickly can a company implement Wellstaq?",
      answer: "Most organizations can onboard within hours. We offer guided setup, challenge configuration, and dashboard access for HR teams. Pilot programs can be launched quickly to measure impact before full rollout."
    },
    {
      icon: <Compass className="w-6 h-6 text-primary-orange" />,
      question: "Is Wellstaq suitable for remote and hybrid teams?",
      answer: "Wellstaq is built specifically for remote and hybrid work environments. From productivity modes to digital clubs and curated physical spaces, the platform supports distributed teams while fostering connection and balance."
    },
    {
      icon: <GitBranch className="w-6 h-6 text-primary-orange" />,
      question: "Do you ensure long-term engagement?",
      answer: "We use a behavioral framework built around Cue → Action → Reward. AI-driven nudges prompt meaningful actions, progress tracking reinforces habits, and rewards, including recognition and partner perks, help sustain motivation over time."
    },
    {
      icon: <UserPlus className="w-6 h-6 text-primary-orange" />,
      question: "Does Wellstaq replace our existing HR systems?",
      answer: "No. Wellstaq is not a payroll or HRIS replacement. It complements existing systems by adding a dedicated wellbeing and engagement layer. Our platform focuses on insights, habit formation, community, and productivity."
    }
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-mid selection:text-primary-orange leading-[1.5] lg:leading-normal">
      
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 h-[76px] transition-all duration-300 z-50 flex items-center justify-between px-4 lg:px-[60px] ${scrolled ? 'bg-white border-b border-grey-4 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170704/wellstaq_logo_raxmmg.png"
            alt="Wellstaq Logo"
            width={120}
            height={30}
            className={`object-contain transition-all ${scrolled ? '' : 'brightness-0 invert'}`}
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-8 text-white">
            <Link href="#solutions" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>
              Solutions
            </Link>
            <Link href="#why-wellstaq" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>Why Wellstaq</Link>
            <Link href="#faq" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>FAQ</Link>
            <Link href="#" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>Pricing</Link>
            <Link href="/" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>Contact Us</Link>
          </div>
          <div className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className={`w-8 h-8 transition-colors ${scrolled ? 'text-grey-1' : 'text-white'}`} />
          </div>
          <div className="hidden lg:block">
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className={`px-6 py-3 border rounded-[12px] font-medium transition-all ${scrolled ? 'border-primary-orange bg-primary-light text-primary-orange hover:bg-primary-mid' : 'border-white bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
            >
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-12">
              <Image
                src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170704/wellstaq_logo_raxmmg.png"
                alt="Wellstaq Logo"
                width={120}
                height={30}
                className="object-contain"
              />
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <X size={32} className="text-grey-1" />
              </button>
            </div>
            
            <div className="flex flex-col gap-8">
              {[
                { name: 'Solutions', href: '#solutions' },
                { name: 'Why Wellstaq', href: '#why-wellstaq' },
                { name: 'FAQ', href: '#faq' },
                { name: 'Pricing', href: '#' },
                { name: 'Contact Us', href: '/' }
              ].map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-medium text-grey-1 hover:text-primary-orange"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <Link href="/onboarding" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full py-4 bg-primary-orange text-white rounded-[12px] font-medium text-xl mb-4">
                  Get Started
                </button>
              </Link>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="w-full py-4 border border-grey-4 text-grey-1 rounded-[12px] font-medium text-xl"
              >
                Request a Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEMO REQUEST MODAL (DRAWER/BOTTOM SHEET) */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end lg:items-stretch lg:justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm shadow-none"
            />
            <motion.div
              initial={{ y: '100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full lg:w-[500px] h-fit lg:h-full bg-white rounded-t-[24px] lg:rounded-t-none p-6 lg:p-10 flex flex-col shadow-2xl z-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-grey-1">Book a Demo</h3>
                <button onClick={() => setIsDemoModalOpen(false)} className="p-2 hover:bg-grey-5 rounded-full transition-colors">
                  <X size={24} className="text-grey-2" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-grey-2 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-[12px] border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-2 mb-2">Work Email</label>
                  <input 
                    type="email" 
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({...demoForm, email: e.target.value})}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-[12px] border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-2 mb-2">Reason for Contact</label>
                  <textarea 
                    value={demoForm.reason}
                    onChange={(e) => setDemoForm({...demoForm, reason: e.target.value})}
                    placeholder="How can we help your team?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-[12px] border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all resize-none"
                  />
                </div>
              </div>

              <div className="mt-10 mb-6 lg:mb-0">
                <button 
                  onClick={() => setIsDemoModalOpen(false)}
                  className="w-full py-4 bg-primary-orange text-white rounded-[12px] font-medium text-lg hover:bg-[#D45F04] transition-all shadow-lg shadow-primary-orange/20"
                >
                  Send Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative w-full h-screen lg:h-[842px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377174/Hero_Image_feakdi.png" 
            alt="Team collaboration" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col items-start text-left lg:items-center lg:text-center px-4 mt-12">
          <h1 className="text-white text-[32px] leading-[38px] lg:leading-[54px] lg:text-5xl max-w-[633px] mb-6 text-left lg:text-center">
            Enhance the well-being of your remote and hybrid teams!
          </h1>
          <p className="text-white text-sm lg:text-lg max-w-[556px] mb-10 opacity-90 text-left lg:text-center">
            Improve team wellness, discover inspiring spaces, and make informed HR decisions with privacy-focused insights.
          </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-[551px]">
            <Link href="/onboarding" className="flex-1">
              <button className="w-full py-4 bg-primary-orange text-white rounded-[12px] font-medium text-lg hover:bg-[#D45F04] transition-all shadow-lg shadow-primary-orange/20">
                Get Started
              </button>
            </Link>
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="flex-1 py-4 border border-white bg-white/10 backdrop-blur-md text-white rounded-[12px] font-medium text-lg hover:bg-white/20 transition-all"
            >
              Request a Demo
            </button>
          </div>
        </div>
      </section>

      {/* 3. LOGO STRIP */}
      <section className="w-full h-[109px] bg-white border-b border-grey-4 flex items-center overflow-hidden">
        <div className="flex items-center gap-[94px] px-4 lg:px-[60px] animate-marquee whitespace-nowrap">
          {[...brands, ...brands, ...brands].map((brand, idx) => (
            <div key={idx} className="flex items-center gap-2 opacity-40 grayscale">
              <div className="w-8 h-8 bg-grey-1 rounded-full flex items-center justify-center">
                <Layout size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-grey-1 uppercase tracking-widest">{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WELLBEING PILLARS SECTION */}
      <section id="why-wellstaq" className="py-10 lg:py-[120px] px-4 lg:px-[60px] bg-white w-full scroll-mt-20">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl leading-[32px] lg:leading-normal lg:text-4xl mb-4">We handle the complexity. Your team sees clarity.</h3>
          <p className="text-grey-2 max-w-[655px] lg:mx-auto text-sm lg:text-lg">
            Wellbeing isn't just mental or physical. It's everything. Wellstaq helps individuals and organizations track and improve all dimensions in one unified system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wellbeingPillars.map((pillar, idx) => (
            <div 
              key={idx} 
              className={`min-h-[307px] w-full p-5 rounded-[12px] lg:rounded-[20px] flex flex-col justify-between transition-all hover:scale-[1.02] ${
                pillar.variant === 'orange' ? 'bg-[#ffc193] text-[#373737] border-0' :
                pillar.variant === 'green' ? 'bg-[#ccefd2] text-[#373737] border-0' :
                'bg-white text-grey-1 border-2 border-[#f2f2f2]'
              }`}
            >
              <div className={`w-8 h-8 ${pillar.variant === 'white' ? 'text-primary-orange' : (pillar.variant === 'orange' || pillar.variant === 'green') ? 'text-[#373737]' : 'text-white'}`}>
                {pillar.icon}
              </div>
              <div>
                <h4 className="mb-3 font-bold text-lg">{pillar.title}</h4>
                <p className={`text-sm leading-relaxed ${pillar.variant === 'white' ? 'text-grey-2' : (pillar.variant === 'orange' || pillar.variant === 'green') ? 'text-[#373737]' : 'text-white/90'}`}>
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. UNLOCK THE POWER DARK FEATURE SECTION */}
      <section className="px-4 lg:px-[60px] py-10 lg:py-[120px]">
        <div className="relative w-full h-[610px] lg:h-[765px] rounded-[12px] lg:rounded-[32px] overflow-hidden bg-black">
          <Image 
            src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1776764993/Frame_26_n6laxa.png" 
            alt="Unlock the power of a healthier workforce" 
            fill 
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Content */}
          <div className="absolute inset-x-0 bottom-10 lg:bottom-auto lg:left-[59px] lg:top-[197px] flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:px-0 z-20">
            <div className="w-[50px] h-[40px] lg:w-[50px] lg:h-[50px] border-2 border-white rounded-lg flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M5 15L3 6L9 9L12 3L15 9L21 6L19 15H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 18H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-white text-[28px] lg:text-4xl leading-tight mb-4 font-bold max-w-[321px]">Unlock the power of a healthier workforce</h3>
            <p className="text-grey-4 text-sm lg:text-lg max-w-[321px]">
              Bring together productivity, community, and compliance in one unified wellbeing platform.
            </p>
          </div>

          {/* Mobile Icon Arc Overlay */}
          <div className="absolute inset-0 z-10 lg:hidden pointer-events-none">
            <div className="relative w-full h-full">
              {/* Arc Path (Visual Only) */}
              <svg className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] opacity-20" viewBox="0 0 100 50">
                <path d="M0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50" stroke="white" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
              </svg>

              {/* Icons along arc */}
              <div className="absolute left-[8%] top-[35%] w-10 h-10 rounded-full bg-[#DE9300] flex items-center justify-center border-2 border-white/20 shadow-lg">
                <Activity size={20} className="text-white" />
              </div>
              <div className="absolute left-[18%] top-[22%] w-10 h-10 rounded-full bg-[#318AFF] flex items-center justify-center border-2 border-white/20 shadow-lg">
                <Heart size={20} className="text-white" />
              </div>
              <div className="absolute left-[50%] top-[14%] -translate-x-1/2 w-10 h-10 rounded-full bg-[#AE22FF] flex items-center justify-center border-2 border-white/20 shadow-lg">
                <Leaf size={20} className="text-white" />
              </div>
              <div className="absolute right-[18%] top-[22%] w-10 h-10 rounded-full bg-[#00CEFD] flex items-center justify-center border-2 border-white/20 shadow-lg">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="absolute right-[8%] top-[35%] w-10 h-10 rounded-full bg-[#86A400] flex items-center justify-center border-2 border-white/20 shadow-lg">
                <BookOpen size={20} className="text-white" />
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {/* Purple Glow */}
            <div className="absolute top-[10%] right-[10%] w-[400px] h-[300px] bg-purple-600/30 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* 6. GO WELLSTAQ FEATURE TABS SECTION - STICKY SCROLL REVEAL */}
      <section id="solutions" className="py-10 lg:py-[120px] px-4 lg:px-[60px] bg-primary-light scroll-mt-20">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl leading-[32px] lg:leading-normal lg:text-4xl mb-4">Enjoy solution that drives real results. Go Wellstaq.</h3>
          <p className="text-grey-2 max-w-[702px] lg:mx-auto text-sm lg:text-lg">
            Wellstaq empowers teams to thrive by blending lifestyle, productivity, and compliance into one cohesive system. Dashboards for HR to habit-forming tools for employees, we create measurable impact without compromising trust.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start relative">
          {/* Left Side: Scrollable Content */}
          <div className="flex-1 space-y-[100px] lg:space-y-[300px] py-0 lg:py-[100px]">
            {featureTabs.map((tab, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0.3 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-40% 0px -40% 0px" }}
                onViewportEnter={() => setActiveTab(idx)}
                className="flex flex-col lg:flex-row gap-4"
              >
                <div className="lg:hidden w-full h-[250px] relative rounded-[12px] lg:rounded-[20px] overflow-hidden mb-6">
                  <Image 
                    src={tab.image} 
                    alt={tab.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-4">
                  <div className={`w-1 h-full min-h-[100px] rounded-full transition-colors duration-500 ${activeTab === idx ? 'bg-primary-orange' : 'bg-grey-4'}`} />
                  <div>
                    <h3 className="text-grey-1 mb-4 text-[24px] leading-[30px] lg:leading-[38px] lg:text-3xl font-bold">{tab.title}</h3>
                    <p className="text-sm lg:text-lg text-grey-2 max-w-[400px]">{tab.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Side: Sticky Image */}
          <div className="hidden lg:block sticky top-[150px] w-[656px] h-[550px] rounded-[12px] lg:rounded-[20px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image 
                  src={featureTabs[activeTab].image} 
                  alt={featureTabs[activeTab].title} 
                  fill 
                  className="object-cover"
                />
                {activeTab === 0 && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-10">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl w-full max-w-md shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-4 w-24 bg-grey-4 rounded" />
                        <div className="h-4 w-12 bg-primary-orange/20 rounded" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-20 w-full bg-grey-5 rounded-xl border border-grey-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 bg-primary-light rounded-xl border border-primary-border" />
                          <div className="h-24 bg-secondary-light-green rounded-xl border border-secondary-green/20" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 7. HABIT FORMATION SECTION */}
      <section className="pt-10 pb-0 lg:py-[120px] px-4 lg:px-[60px] bg-white">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl leading-[30px] lg:leading-normal lg:text-4xl mb-4">Built on the science of habit formation</h3>
          <p className="text-grey-2 max-w-[655px] lg:mx-auto text-sm lg:text-lg">
            Wellstaq is transforming wellbeing into a sustainable practice for everyone. By using a simple behavioral loop, it helps people incorporate healthy habits into their daily routines, making the path to wellness both achievable and enjoyable.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:h-[520px] lg:w-auto">
          {/* Left Card */}
          <div className="w-full lg:w-[607px] min-h-[300px] lg:min-h-0 relative rounded-[12px] lg:rounded-[20px] overflow-hidden bg-grey-1">
            <Image 
              src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377095/1_y5hopw.png" 
              alt="Gym space" 
              fill 
              className="object-cover"
            />
          </div>

          {/* Right Card */}
          <div className="flex-1 min-h-[300px] lg:min-h-0 relative rounded-[12px] lg:rounded-[20px] overflow-hidden bg-grey-5">
            <Image 
              src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377105/2_xghqdi.png" 
              alt="Joyful woman" 
              fill 
              className="object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-10 lg:py-[120px] px-4 lg:px-[60px] bg-white scroll-mt-20">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl lg:text-4xl mb-4">Commonly Asked Questions</h3>
          <p className="text-grey-2 max-w-[686px] lg:mx-auto text-sm lg:text-lg">
            Let's delve deeper into the intriguing aspects of this topic and uncover all the fascinating insights and benefits that they provide! There's so much to explore and understand, and I'm excited to share everything with you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3 lg:p-8 border-2 border-grey-4 rounded-[12px] lg:rounded-[24px] bg-white hover:border-primary-border transition-all group">
              <div className="flex items-center gap-5 mb-4">
                <div className="w-8 h-8 lg:w-[52px] lg:h-[52px] bg-primary-mid rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {faq.icon}
                </div>
                <h5 className="text-grey-1 text-base leading-[24px] font-bold lg:font-bold lg:text-lg lg:leading-normal">{faq.question}</h5>
              </div>
              <p className="text-grey-3 text-sm leading-relaxed pl-0 lg:pl-[72px]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CTA BANNER */}
      <section className="py-10 lg:py-[120px] px-4 lg:px-[60px] bg-grey-5">
        <div className="relative w-full h-[551px] rounded-[12px] lg:rounded-[20px] overflow-hidden flex flex-col items-center justify-center text-center px-6">
          <Image 
            src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377098/Banner_Image_wxrsdz.png"
            alt="Banner background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 flex flex-col items-start text-left lg:items-center lg:text-center">
            <div className="mb-8 rotate-12">
              <Leaf className="text-white fill-current w-[60px] h-[60px] lg:w-[84px] lg:h-[84px]" />
            </div>
            <h2 className="text-white text-2xl leading-[32px] lg:leading-normal lg:text-5xl mb-6 text-left lg:text-center">Start building a healthier work culture.</h2>
            <p className="text-white/90 max-w-[568px] mb-10 text-sm lg:text-lg text-left lg:text-center">
              Empower your team with tools that balance productivity, wellbeing, and community, all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-[642px]">
              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="flex-1 py-4 border lg:border-[3px] border-white text-white rounded-[12px] font-medium text-lg hover:bg-white/10 transition-all"
              >
                Book a demo
              </button>
              <Link href="/onboarding" className="flex-1">
                <button className="w-full py-4 bg-primary-orange text-white rounded-[12px] font-medium text-lg hover:bg-[#D45F04] transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-grey-5 pt-10 pb-20 px-[12px] lg:px-10 border-t border-grey-4">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Column 1 */}
            <div>
              <h5 className="font-bold text-grey-1 mb-8">Contact</h5>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center text-white">
                    <Phone size={16} />
                  </div>
                  <span className="text-grey-2">+2349 - 535 - 342</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center text-white">
                    <MapPin size={16} />
                  </div>
                  <span className="text-grey-2">1102 South Abuja, Phonesnix vila, 123C400</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center text-white">
                    <Mail size={16} />
                  </div>
                  <span className="text-grey-2">hello@wellstaq.com</span>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex gap-[95px]">
              <div>
                <h5 className="font-bold text-grey-1 mb-8">Navigate</h5>
                <ul className="space-y-4">
                  {['Solutions', 'Resources', 'Spaces', 'Community', 'Pricing'].map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-grey-2 hover:text-primary-orange transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-grey-1 mb-8">Follow us</h5>
                <ul className="space-y-4">
                  {[
                    { name: 'LinkedIn', icon: <Linkedin size={16} /> },
                    { name: 'Instagram', icon: <Instagram size={16} /> },
                    { name: 'X (formally twitter)', icon: <Twitter size={16} /> }
                  ].map((social) => (
                    <li key={social.name}>
                      <Link href="#" className="text-grey-2 hover:text-primary-orange transition-colors flex items-center gap-2">
                        {social.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-grey-3/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-grey-3 text-sm">
              ©️ Copyright <span className="text-primary-orange font-medium">WellStarq.com</span> All rights reserved 2026
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-grey-3 text-sm hover:text-grey-1">Privacy & Policy</Link>
              <Link href="#" className="text-grey-3 text-sm hover:text-grey-1">Terms & Condition</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

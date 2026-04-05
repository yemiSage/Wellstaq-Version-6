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
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Marquee items for Logo Strip
  const brands = ["Tricycle", "Inventory", "Neoniq", "Vertex", "Quonar", "Fission"];

  const wellbeingPillars = [
    {
      title: "Mental Wellbeing",
      description: "Build clarity, resilience, and emotional awareness with guided check-ins and AI nudges.",
      icon: <Target className="w-8 h-8" />,
      variant: "white"
    },
    {
      title: "Physical Wellbeing",
      description: "Track movements, energies, sleep, and every habits that support long-term health of your staff or employee.",
      icon: <Moon className="w-8 h-8" />,
      variant: "orange"
    },
    {
      title: "Financial Wellbeing",
      description: "Encourage smarter financial habits with literacy programs and consistent progress tracking.",
      icon: <Circle className="w-8 h-8" />,
      variant: "white"
    },
    {
      title: "Occupation Wellbeing",
      description: "Align productivity with purpose through focus modes and performance balance tools.",
      icon: <Circle className="w-8 h-8 fill-current" />,
      variant: "white"
    },
    {
      title: "Social Wellbeing",
      description: "Strengthen relationships through clubs, events, communities and shared experiences.",
      icon: <Users className="w-8 h-8" />,
      variant: "white"
    },
    {
      title: "Intellectual Wellbeing",
      description: "Stimulate growth with curated content, learning challenges, and skill-building prompts.",
      icon: <BookOpen className="w-8 h-8" />,
      variant: "white"
    },
    {
      title: "Environment Wellbeing",
      description: "Encourage healthier surroundings and sustainable choices at work and also beyond work.",
      icon: <Leaf className="w-8 h-8" />,
      variant: "white"
    },
    {
      title: "Spiritual Wellbeing",
      description: "Create a safe space for personal reflection, mindfulness, and also personal meaning.",
      icon: <Moon className="w-8 h-8" />,
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
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#solutions" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>
              Solutions
            </Link>
            <Link href="#why-wellstaq" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>Why Wellstaq</Link>
            <Link href="#faq" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>FAQ</Link>
            <Link href="#" className={`font-medium transition-colors ${scrolled ? 'text-grey-1 hover:text-primary-orange' : 'text-white hover:text-primary-orange'}`}>Pricing</Link>
            <Link href="#" className="text-primary-orange font-semibold">Contact Us</Link>
          </div>
          <div className="lg:hidden">
            <Menu className={`w-8 h-8 transition-colors ${scrolled ? 'text-grey-1' : 'text-white'}`} />
          </div>
          <Link href="/onboarding" className="hidden lg:block">
            <button className={`px-6 py-3 border rounded-[12px] font-semibold transition-all ${scrolled ? 'border-primary-orange bg-primary-light text-primary-orange hover:bg-primary-mid' : 'border-white bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}>
              Request a Demo
            </button>
          </Link>
        </div>
      </nav>

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
          <h1 className="text-white text-[32px] leading-[38px] lg:leading-normal lg:text-5xl max-w-[633px] mb-6 text-left lg:text-center">
            Enhance the well-being of your remote and hybrid teams!
          </h1>
          <p className="text-white text-sm lg:text-lg max-w-[556px] mb-10 opacity-90 text-left lg:text-center">
            Improve team wellness, discover inspiring spaces, and make informed HR decisions with privacy-focused insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-[551px]">
            <Link href="/onboarding" className="flex-1">
              <button className="w-full py-4 bg-primary-orange text-white rounded-[12px] font-bold text-lg hover:bg-[#D45F04] transition-all shadow-lg shadow-primary-orange/20">
                Get Started
              </button>
            </Link>
            <button className="flex-1 py-4 border border-white bg-white/10 backdrop-blur-md text-white rounded-[12px] font-bold text-lg hover:bg-white/20 transition-all">
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
      <section id="why-wellstaq" className="py-10 lg:py-[80px] px-4 lg:px-[60px] bg-white max-w-[1440px] mx-auto scroll-mt-20">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl lg:text-4xl mb-4">We handle the complexity. Your team sees clarity.</h3>
          <p className="text-grey-2 max-w-[655px] lg:mx-auto text-sm lg:text-lg">
            Wellbeing isn't just mental or physical. It's everything. Wellstaq helps individuals and organizations track and improve all dimensions in one unified system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wellbeingPillars.map((pillar, idx) => (
            <div 
              key={idx} 
              className={`h-[307px] p-5 rounded-[12px] lg:rounded-[20px] flex flex-col justify-between transition-all hover:scale-[1.02] ${
                pillar.variant === 'orange' ? 'bg-primary-orange text-white border-2 border-primary-border' :
                pillar.variant === 'green' ? 'bg-secondary-green text-white border-2 border-secondary-green' :
                'bg-white text-grey-1 border-2 border-grey-4'
              }`}
            >
              <div className={`${pillar.variant === 'white' ? 'text-primary-orange' : 'text-white'}`}>
                {pillar.icon}
              </div>
              <div>
                <h4 className="mb-3">{pillar.title}</h4>
                <p className={`text-sm ${pillar.variant === 'white' ? 'text-grey-2' : 'text-white/90'}`}>
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. UNLOCK THE POWER DARK FEATURE SECTION */}
      <section className="px-4 lg:px-[60px] py-10 lg:pb-[80px]">
        <div className="relative w-full h-[765px] rounded-[12px] lg:rounded-[32px] overflow-hidden bg-black">
          <Image 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop" 
            alt="Happy African professional woman talking with coworkers" 
            fill 
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Content */}
          <div className="absolute left-4 lg:left-[59px] top-[197px] w-[321px] z-10">
            <div className="w-[50px] h-[50px] border-2 border-white rounded-lg flex items-center justify-center mb-6">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <h3 className="text-white text-2xl lg:text-4xl mb-4">Unlock the power of a healthier workforce</h3>
            <p className="text-grey-4 text-sm lg:text-lg">
              Bring together productivity, community, and compliance in one unified wellbeing platform.
            </p>
          </div>

          {/* Floating Badges */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gold Badge */}
            <div className="absolute left-[45%] top-[60%] p-[25px] rounded-full bg-[#DE9300]/20 backdrop-blur-[6px] border border-white/20 animate-bounce-slow">
              <Heart className="w-12 h-12 text-[#DE9300]" />
            </div>
            {/* Blue Badge */}
            <div className="absolute left-[40%] top-[30%] p-[25px] rounded-full bg-[#318AFF]/20 backdrop-blur-[6px] border border-white/20 animate-pulse">
              <Heart className="w-12 h-12 text-[#318AFF]" />
            </div>
            {/* Purple Badge */}
            <div className="absolute left-[60%] top-[20%] p-[25px] rounded-full bg-[#AE22FF]/20 backdrop-blur-[6px] border border-white/20 animate-bounce-slow">
              <Sparkles className="w-12 h-12 text-[#AE22FF]" />
            </div>
            {/* Cyan Badge */}
            <div className="absolute left-[80%] top-[35%] p-[25px] rounded-full bg-[#00CEFD]/20 backdrop-blur-[6px] border border-white/20 animate-pulse">
              <Heart className="w-12 h-12 text-[#00CEFD]" />
            </div>
            {/* Olive Badge */}
            <div className="absolute left-[85%] top-[65%] p-[25px] rounded-full bg-[#86A400]/20 backdrop-blur-[6px] border border-white/20 animate-bounce-slow">
              <Palette className="w-12 h-12 text-[#86A400]" />
            </div>
            
            {/* Purple Glow */}
            <div className="absolute top-[10%] right-[10%] w-[400px] h-[300px] bg-purple-600/30 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* 6. GO WELLSTAQ FEATURE TABS SECTION - STICKY SCROLL REVEAL */}
      <section id="solutions" className="py-10 lg:py-[80px] px-4 lg:px-[60px] bg-primary-light scroll-mt-20">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl lg:text-4xl mb-4">Enjoy solution that drives real results. Go Wellstaq.</h3>
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
                    <h3 className="text-grey-1 mb-4 text-[20px] leading-[28px] lg:leading-normal lg:text-3xl font-bold">{tab.title}</h3>
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
      <section className="pt-10 pb-0 lg:py-[80px] px-4 lg:px-[60px] bg-white">
        <div className="text-left lg:text-center mb-[60px]">
          <h3 className="text-grey-1 text-2xl leading-[30px] lg:leading-normal lg:text-4xl mb-4">Built on the science of habit formation</h3>
          <p className="text-grey-2 max-w-[655px] lg:mx-auto text-sm lg:text-lg">
            Wellstaq is transforming wellbeing into a sustainable practice for everyone. By using a simple behavioral loop, it helps people incorporate healthy habits into their daily routines, making the path to wellness both achievable and enjoyable.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 h-0 w-[324.4px] lg:h-[520px] lg:w-auto overflow-hidden lg:overflow-visible">
          {/* Left Card */}
          <div className="w-full lg:w-[607px] relative rounded-[12px] lg:rounded-[20px] overflow-hidden bg-grey-1">
            <Image 
              src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377095/1_y5hopw.png" 
              alt="Gym space" 
              fill 
              className="object-cover opacity-50 blur-[2px]"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-white/80 backdrop-blur-md border border-grey-4 rounded-[12px] lg:rounded-[41px] w-full max-w-[550px] h-full max-h-[413px] p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="text-primary-orange" />
                  <h5 className="font-semibold text-grey-1">Upcoming Schedule</h5>
                </div>
                
                <div className="flex gap-3 mb-8">
                  <div className="px-6 py-2 bg-primary-light border border-primary-orange text-primary-orange rounded-full text-sm font-medium">Now</div>
                  <div className="px-6 py-2 bg-grey-5 border border-grey-4 text-grey-3 rounded-full text-sm font-medium">12:45am</div>
                  <div className="px-6 py-2 bg-grey-5 border border-grey-4 text-grey-3 rounded-full text-sm font-medium">3:00pm</div>
                </div>

                <div className="space-y-6">
                  {[
                    { title: "Lunch Meditation 🧘", sub: "Mindfulness session with Dr. Aisha.", color: "bg-purple-500" },
                    { title: "Hydration Challenge", sub: "Remember to drink water.", color: "bg-blue-500" },
                    { title: "Stretching Break", sub: "Time for a quick stretch.", color: "bg-blue-400" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white`}>
                        <Bell size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-grey-1">{item.title}</div>
                        <div className="text-xs text-grey-2">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="flex-1 relative rounded-[12px] lg:rounded-[20px] overflow-hidden bg-grey-5">
            <Image 
              src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1775377105/2_xghqdi.png" 
              alt="Joyful woman" 
              fill 
              className="object-cover opacity-80"
            />
            <div className="absolute bottom-10 right-10 flex flex-col items-end gap-[-20px]">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`bg-white border border-grey-4 rounded-2xl p-4 flex items-center gap-4 shadow-xl transition-all duration-500 hover:translate-y-[-10px] ${
                    i === 1 ? 'w-[320px] z-30' : i === 2 ? 'w-[280px] z-20 opacity-80 translate-x-4 translate-y-4' : 'w-[240px] z-10 opacity-60 translate-x-8 translate-y-8'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-mid flex items-center justify-center text-primary-orange">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-grey-1">Congratulations 🥳</div>
                    <div className="text-[10px] text-grey-3 leading-tight">You finished the noSoda challenge and came out as number 1 player 💯</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-10 lg:py-[80px] px-4 lg:px-[60px] bg-white scroll-mt-20">
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
                <h5 className="text-grey-1 text-base leading-[24px] font-bold lg:font-medium lg:text-lg lg:leading-normal">{faq.question}</h5>
              </div>
              <p className="text-grey-3 text-sm leading-relaxed pl-0 lg:pl-[72px]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CTA BANNER */}
      <section className="py-10 lg:py-[80px] px-4 lg:px-[60px] bg-grey-5">
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
              <button className="flex-1 py-4 border-[3px] border-white text-white rounded-[12px] font-bold text-lg hover:bg-white/10 transition-all">
                Book a demo
              </button>
              <Link href="/onboarding" className="flex-1">
                <button className="w-full py-4 bg-primary-orange text-white rounded-[12px] font-bold text-lg hover:bg-[#D45F04] transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-grey-5 pt-10 pb-20 px-4 lg:px-[60px] border-t border-grey-4">
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

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const IMAGES = [
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773334436/sports-men-standing-white-wall_mz07zp.jpg",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773336671/freepik__wellness-africannigeria__84223_ia4f7l.png",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773336642/freepik__wellness-africannigeria-team__84224_kdkiow.png",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773336646/freepik__wellness__84222_popnho.png"
];

export function SplitLayout({ children, lockContentScroll = false }: { children: React.ReactNode; lockContentScroll?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [paused, reducedMotion]);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.src = IMAGES[(currentIndex + 1) % IMAGES.length];
  }, [currentIndex]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white">
      {/* Left Pane - Animated Carousel */}
      <div className="hidden xl:flex xl:w-[60%] relative overflow-hidden items-center justify-center" suppressHydrationWarning>
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
            suppressHydrationWarning
          >
            <Image
              src={IMAGES[currentIndex]}
              alt="Wellness and Community"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              priority={currentIndex === 0}
              sizes="60vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30 z-10" suppressHydrationWarning />
        {!reducedMotion && <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} className="absolute bottom-6 right-6 z-20 rounded-lg border border-white/50 bg-black/40 px-3 py-2 text-sm text-white hover:bg-black/60">{paused ? "Resume slideshow" : "Pause slideshow"}</button>}
      </div>
      {/* Right Pane - Content */}
      <div className={`relative z-20 flex min-h-0 w-full flex-col overflow-y-auto overscroll-contain xl:w-[40%] ${lockContentScroll ? "md:overflow-y-hidden [@media(max-height:640px)]:overflow-y-auto" : ""}`}>
        {children}
      </div>
    </div>
  );
}

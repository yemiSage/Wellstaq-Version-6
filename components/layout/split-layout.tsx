"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

const IMAGES = [
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773334436/sports-men-standing-white-wall_mz07zp.jpg",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773336671/freepik__wellness-africannigeria__84223_ia4f7l.png",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773336642/freepik__wellness-africannigeria-team__84224_kdkiow.png",
  "https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto:eco,w_1200,dpr_auto/v1773336646/freepik__wellness__84222_popnho.png"
];

export function SplitLayout({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.src = IMAGES[(currentIndex + 1) % IMAGES.length];
  }, [currentIndex]);

  return (
    <div className="flex min-h-screen min-h-dvh w-full bg-white">
      {/* Left Pane - Animated Carousel */}
      <div className="hidden xl:flex xl:w-[60%] relative overflow-hidden items-center justify-center" suppressHydrationWarning>
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
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
      </div>
      {/* Right Pane - Content */}
      <div className="w-full xl:w-[40%] relative flex flex-col z-20">
        {children}
      </div>
    </div>
  );
}

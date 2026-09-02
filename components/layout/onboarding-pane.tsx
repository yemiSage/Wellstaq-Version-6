import Image from "next/image";

export function OnboardingPane({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden">
      {/* Subtle Background Shape */}
      <svg 
        className="absolute top-1/3 -right-32 w-[800px] h-[800px] text-grey-4/5 -z-10 pointer-events-none" 
        viewBox="0 0 200 200" 
        fill="currentColor"
      >
        <path 
          d="M45.7,-76.3C58.9,-69.3,69.1,-55.3,77.4,-40.5C85.7,-25.7,92.1,-10.1,90.4,4.7C88.7,19.5,78.9,33.5,68.2,45.8C57.5,58.1,45.9,68.7,32.1,75.4C18.3,82.1,2.3,84.9,-12.8,82.5C-27.9,80.1,-42.1,72.5,-54.6,62.2C-67.1,51.9,-77.9,38.9,-83.4,23.8C-88.9,8.7,-89.1,-8.5,-83.5,-23.4C-77.9,-38.3,-66.5,-50.9,-53,-58.5C-39.5,-66.1,-23.9,-68.7,-8.4,-69.1C7.1,-69.5,22.2,-67.7,32.5,-71.4C42.8,-75.1,45.7,-76.3,45.7,-76.3Z" 
          transform="translate(100 100) scale(1.2)" 
        />
      </svg>
      
      {/* Header with Logo */}
      <header className="w-full flex justify-center pt-8 pb-8 sm:pt-10 sm:pb-10 xl:pt-12 xl:pb-[52px]">
        <Image
          src="https://res.cloudinary.com/dv7yvatu2/image/upload/f_auto,q_auto,w_320/v1772170704/wellstaq_logo_raxmmg.png"
          alt="Wellstaq Logo"
          width={160}
          height={40}
          className="object-contain"
          referrerPolicy="no-referrer"
        />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-[640px] mx-auto px-5 sm:px-8 md:px-10 xl:max-w-none xl:px-8 2xl:px-10 justify-start">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-5 sm:py-8 sm:px-8 text-center mt-auto">
        <p className="max-w-[560px] mx-auto text-[12px] leading-5 text-grey-3">
          By continuing you are confirming to have read and agree to Wellstaq <a href="#" className="text-primary-1 font-medium hover:underline">terms and condition</a> and <a href="#" className="text-primary-1 font-medium hover:underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}

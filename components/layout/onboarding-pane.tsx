import Image from "next/image";

export function OnboardingPane({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Subtle Background Shape */}
      <svg 
        className="absolute top-1/3 -right-32 w-[800px] h-[800px] text-secondary-4/20 -z-10 pointer-events-none" 
        viewBox="0 0 200 200" 
        fill="currentColor"
      >
        <path 
          d="M45.7,-76.3C58.9,-69.3,69.1,-55.3,77.4,-40.5C85.7,-25.7,92.1,-10.1,90.4,4.7C88.7,19.5,78.9,33.5,68.2,45.8C57.5,58.1,45.9,68.7,32.1,75.4C18.3,82.1,2.3,84.9,-12.8,82.5C-27.9,80.1,-42.1,72.5,-54.6,62.2C-67.1,51.9,-77.9,38.9,-83.4,23.8C-88.9,8.7,-89.1,-8.5,-83.5,-23.4C-77.9,-38.3,-66.5,-50.9,-53,-58.5C-39.5,-66.1,-23.9,-68.7,-8.4,-69.1C7.1,-69.5,22.2,-67.7,32.5,-71.4C42.8,-75.1,45.7,-76.3,45.7,-76.3Z" 
          transform="translate(100 100) scale(1.2)" 
        />
      </svg>
      
      {/* Header with Logo */}
      <header className="w-full flex justify-center pt-12 pb-[52px]">
        <Image
          src="https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170704/wellstaq_logo_raxmmg.png"
          alt="Wellstaq Logo"
          width={160}
          height={40}
          className="object-contain"
          referrerPolicy="no-referrer"
        />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-8 w-full justify-start">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-8 text-center mt-auto">
        <p className="text-[12px] text-grey-3">
          By continuing you are confirming to have read and agree <br />
          to Wellstaq <a href="#" className="text-primary-1 font-medium hover:underline">terms and condition</a> and <a href="#" className="text-primary-1 font-medium hover:underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}

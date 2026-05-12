import OptionalModulesTabs from '@/components/OptionalModulesTabs';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="mb-6 sm:mb-8 mt-6 sm:mt-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50 tracking-tight">
          Vedic Astra
        </h1>
        <p className="text-lg md:text-xl text-white/50 mt-2 font-light">
          Ancient Vedic Wisdom
        </p>
      </div>

      <div className="w-full space-y-8 pb-16">
        <OptionalModulesTabs />
      </div>

      <footer className="text-center text-white/20 text-xs pb-4">
        <p>Powered by Precise Astronomy</p>
      </footer>
    </main>
  );
}

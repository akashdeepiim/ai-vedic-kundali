import OptionalModulesTabs from '@/components/OptionalModulesTabs';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-3 sm:p-6 md:p-8 relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="mb-4 mt-4 text-center sm:mb-8 sm:mt-8">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50 tracking-tight">
          Vedic Astra
        </h1>
        <p className="mx-auto max-w-xs text-sm text-white/50 sm:max-w-none sm:text-lg md:text-xl mt-1 sm:mt-2 font-light">
          Birth charts, matching, timing, and focused Vedic readings
        </p>
      </div>

      <div className="w-full space-y-4 pb-12 sm:space-y-8 sm:pb-16">
        <OptionalModulesTabs />
      </div>

      <footer className="text-center text-white/20 text-xs pb-4">
        <p>Powered by Precise Astronomy</p>
      </footer>
    </main>
  );
}

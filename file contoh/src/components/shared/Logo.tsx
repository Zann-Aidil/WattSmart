import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Container untuk mengontrol ukuran agar sesuai dengan navbar (height max 80px) */}
      <div className="relative w-48 h-16 sm:w-56 overflow-hidden flex items-center justify-start">
        <Image
          src="/logo.png"
          alt="WattSmart Predictor Logo"
          width={400}
          height={300}
          className="absolute top-1/2 -translate-y-[42%] max-w-none w-[140%] -ml-[20%] object-contain scale-125"
          priority
        />
      </div>
    </div>
  );
}

import Image from "next/image"

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Full screen background image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/nous-background.png" alt="Nous Background" fill priority className="object-cover" />
      </div>

      {/* Maintenance text at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 p-4 text-center backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white">Under Maintenance</h1>
        <p className="mt-2 text-sm text-white/80">&copy; {new Date().getFullYear()} Nous. All rights reserved.</p>
      </div>
    </div>
  )
}

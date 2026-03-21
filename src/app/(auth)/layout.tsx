// (auth) route group — shared layout for all auth screens
// No nav. Full-screen centred card on the brand background.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12">
      {children}
    </div>
  )
}

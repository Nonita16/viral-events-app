import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-pink-50 via-yellow-50 to-pink-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-pink-300 to-yellow-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-yellow-300 to-pink-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>

      <LoginForm />
    </div>
  );
}

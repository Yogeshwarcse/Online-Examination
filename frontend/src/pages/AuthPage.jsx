import { useState } from "react";
import LoginForm from "../components/Auth/LoginForm.jsx";
import SignupForm from "../components/Auth/SignupForm.jsx";
import { GraduationCap } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-black to-gold/5 animate-pulse"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <div className="glass-card p-4 animate-glow">
              <GraduationCap className="w-16 h-16 text-gold" />
            </div>
          </div>
          <h1 className="text-5xl font-bold gold-gradient-text mb-3">
            Online Examination System
          </h1>
          <p className="text-gray-300 text-lg">
            Secure, efficient, and easy-to-use exam platform
          </p>
        </div>

        <div className="animate-scale-in">
          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

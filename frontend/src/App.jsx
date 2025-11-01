import { useAuth } from "./contexts/AuthContext.jsx";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while auth state is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gold/20 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-gold absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gold font-semibold text-lg animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show AuthPage
  if (!user) {
    return <AuthPage />;
  }

  // If user exists and has a role
  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  // Otherwise, student dashboard
  return <StudentDashboard />;
}

export default App;

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedProfile = localStorage.getItem("profile");

    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { signIn, getMe } = await import("./../api/auth.js");
      // signIn already stores the token in localStorage
      const userData = await signIn({ email, password });

      // Get profile after token is stored
      const profileData = await getMe().catch(() => null);

      setUser(userData);
      setProfile(profileData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem("profile", JSON.stringify(profileData));
      }
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const signUp = async (email, password, name, role) => {
    try {
      const { signUp: apiSignUp, signIn, getMe } = await import("./../api/auth.js");
      
      // Validate input before sending
      if (!name || name.trim().length === 0) {
        throw new Error('Full name is required');
      }
      if (!email || email.trim().length === 0) {
        throw new Error('Email is required');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Call signup API
      await apiSignUp({ name: name.trim(), email: email.trim(), password, role: role || 'student' });
      
      // Automatically sign in after successful signup
      const userData = await signIn({ email: email.trim(), password });

      // Get profile after token is stored
      const profileData = await getMe().catch(() => null);

      setUser(userData);
      setProfile(profileData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem("profile", JSON.stringify(profileData));
      }
    } catch (err) {
      console.error("Sign up failed:", err);
      // Provide more user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("token");
  };

  const signOut = async () => {
    try {
      const { signOut: apiSignOut } = await import("./../api/auth.js");
      apiSignOut();
    } catch (err) {
      console.error("Failed to sign out from API:", err);
    }
    logout();
  };

  const refreshProfile = async () => {
    try {
      const { getMe } = await import("./../api/auth.js");
      const profileData = await getMe();
      if (profileData) {
        setProfile(profileData);
        localStorage.setItem("profile", JSON.stringify(profileData));
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, signUp, logout, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

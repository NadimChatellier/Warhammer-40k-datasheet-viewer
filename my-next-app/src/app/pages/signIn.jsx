import { useState } from 'react';
import { useRouter } from 'next/router';  // Import useRouter
import { Lock, Mail } from 'lucide-react';
import 'tailwindcss/tailwind.css';
import supabase from "../../lib/supabase.js";

export default function SignIn() {
  const router = useRouter();  // Initialize useRouter
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match!');
        setLoading(false);
        return;
      }
  
      const { user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        console.log("Sign Up Error:", signUpError);
        return;
      }
  
      if (user) {
        console.log("Sign Up Success - User:", user);
        const { error: insertError } = await supabase.from('users').insert([
          { username, email },
        ]);
  
        if (insertError) {
          setError(insertError.message);
        } else {
          router.push("/");  // Redirect to base URL after sign-up
        }
      }
    } else {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Sign In Data:", signInData); // Log the full response object
      console.log("Sign In Error:", signInError); // Log any errors
      
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      
      const { user } = signInData; // Assuming the structure contains user like this
      console.log("User after sign-in:", user);
      
      if (user) {
        console.log("Sign In Success - User:", user);
        router.push("/");  // Redirect to home page after successful sign-in
      } else {
        setError("User authentication failed.");
      }
    }
  
    setLoading(false);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        </div>
        <div className="p-6">
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium">Username</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 bg-gray-700 border border-gray-600 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-gray-700 border border-gray-600 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-700 border border-gray-600 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 bg-gray-700 border border-gray-600 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 border-gray-500"
                />
                Remember me
              </label>
              <a href="#" className="text-blue-400 text-sm hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 mt-2 rounded-lg text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

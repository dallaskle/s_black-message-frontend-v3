import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function EmailLoginPage() {
  const navigate = useNavigate();

  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    // Get the hash fragment from the URL
    const hash = window.location.hash.substring(1); // Remove the # character
    setParams(new URLSearchParams(hash));
    
    const accessToken = params?.get('access_token');
    const refreshToken = params?.get('refresh_token');
    
    // Check for additional parameters if needed
    const expiresAt = params?.get('expires_at');
    const expiresIn = params?.get('expires_in');
    const tokenType = params?.get('token_type');
    const type = params?.get('type');
    
    // Optionally log or handle these parameters as needed
    console.log({ accessToken, refreshToken, expiresAt, expiresIn, tokenType, type });

    console.log(hash);

    if (accessToken && refreshToken) {
      // Store the tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // If no tokens found, redirect to login
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="text-text-primary">
        Verifying your email...
      </div>
    </div>
  );
} 
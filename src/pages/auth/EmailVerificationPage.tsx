import { Link } from 'react-router-dom';

export function EmailVerificationPage() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-background-secondary p-8 rounded-xl text-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-text-primary">Check your email</h2>
          <div className="text-text-secondary space-y-4">
            <p>
              We've sent you a verification email. Please check your inbox and click
              the verification link to activate your account.
            </p>
            <p>
              If you don't see the email, please check your spam folder.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Link 
            to="/login" 
            className="text-accent-primary hover:text-accent-primary/90"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
} 
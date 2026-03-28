'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Home, RefreshCw, Instagram } from 'lucide-react';

export default function AuthError() {
  const [errorType, setErrorType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get error details from URL parameters
    const error = searchParams.get('error') || 'unknown_error';
    const message = searchParams.get('message') || 'An unexpected error occurred';
    
    setErrorType(error);
    setErrorMessage(message);
  }, [searchParams]);

  const getErrorTitle = (errorType) => {
    switch (errorType) {
      case 'missing_code':
      case 'missing_state':
      case 'invalid_state':
        return 'Authentication Failed';
      case 'instagram_token_error':
        return 'Instagram Connection Failed';
      case 'instagram_longlived_token_error':
        return 'Instagram Token Exchange Failed';
      case 'instagram_user_info_error':
        return 'Instagram User Info Failed';
      case 'instagram_already_linked':
        return 'Instagram Account Already Connected';
      case 'internal_server_error':
        return 'Server Error';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorDescription = (errorType) => {
    switch (errorType) {
      case 'missing_code':
        return 'The authorization code from Instagram is missing. This usually happens when the authentication process is interrupted.';
      case 'missing_state':
        return 'The security state parameter is missing. This is required for secure authentication.';
      case 'invalid_state':
        return 'The authentication state is invalid or corrupted. Please try connecting your Instagram account again.';
      case 'instagram_token_error':
        return 'We couldn\'t get an access token from Instagram. This might be due to a temporary issue with Instagram\'s servers.';
      case 'instagram_longlived_token_error':
        return 'Failed to exchange for a long-lived Instagram token. This is needed for ongoing access to your Instagram account.';
      case 'instagram_user_info_error':
        return 'We couldn\'t retrieve your Instagram profile information. Please check your Instagram account permissions.';
      case 'instagram_already_linked':
        return 'This Instagram account is already connected to another user account. Each Instagram account can only be linked to one user.';
      case 'internal_server_error':
        return 'An unexpected error occurred on our servers. Our team has been notified and is working to fix this issue.';
      default:
        return 'An unexpected error occurred during the authentication process. Please try again.';
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate retry delay
    setTimeout(() => {
      // Redirect to Instagram connection page
      router.push('/instagram');
    }, 1000);
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const canRetry = ['instagram_token_error', 'instagram_longlived_token_error', 'instagram_user_info_error', 'internal_server_error'].includes(errorType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getErrorTitle(errorType)}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-2 font-medium">
          {errorMessage}
        </p>

        {/* Error Description */}
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          {getErrorDescription(errorType)}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {canRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Instagram className="w-4 h-4" />
                  Try Instagram Connection Again
                </>
              )}
            </button>
          )}

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Back to Instagram connection 
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Still having trouble?{' '}
            <a href="/contact" className="text-pink-500 hover:text-pink-600 underline">
              Contact Support
            </a>
          </p>
        </div>

        {/* Error Code (for debugging) */}
        {errorType && (
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-400 font-mono">
            Error Code: {errorType}
          </div>
        )}
      </div>
    </div>
  );
}
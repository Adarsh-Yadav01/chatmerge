'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Logs data with a label, redacting sensitive fields (e.g., tokens).
 * @param {string} label - Log message label
 * @param {object} data - Data to log
 */
const logWithRedaction = (label, data) => {
  const redactedData = { ...data };
  if (redactedData.whatsappToken) redactedData.whatsappToken = '[REDACTED]';
  console.log(`${label}:`, JSON.stringify(redactedData, null, 2));
};

// Status indicator component
const StatusIndicator = ({ status }) => {
  const getStatusColor = () => {
    if (status === 'CONNECTED' || status === 'VERIFIED' || status === 'APPROVED') return 'bg-emerald-500 text-emerald-100';
    if (status === 'PENDING') return 'bg-amber-500 text-amber-100';
    if (status === 'DISCONNECTED' || status === 'ERROR' || status === 'UNVERIFIED') return 'bg-red-500 text-red-100';
    return 'bg-gray-400 text-gray-100';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${getStatusColor()} text-xs font-medium`}>
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
      {status || 'Unknown'}
    </div>
  );
};

// Enhanced info card component
const InfoCard = ({ icon, title, children, status, className = "" }) => (
  <Card className={`border-l-4 ${
    status === 'CONNECTED' || status === 'VERIFIED' || status === 'APPROVED' ? 'border-l-emerald-500 bg-emerald-50/20' :
    status === 'PENDING' ? 'border-l-amber-500 bg-amber-50/20' :
    status === 'ERROR' || status === 'DISCONNECTED' || status === 'UNVERIFIED' ? 'border-l-red-500 bg-red-50/20' :
    'border-l-gray-300'
  } shadow-sm hover:shadow-lg transition-all duration-200 ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            status === 'CONNECTED' || status === 'VERIFIED' || status === 'APPROVED' ? 'bg-emerald-500' :
            status === 'PENDING' ? 'bg-amber-500' :
            status === 'ERROR' || status === 'DISCONNECTED' || status === 'UNVERIFIED' ? 'bg-red-500' :
            'bg-gray-500'
          } text-white shadow-sm`}>
            {icon}
          </div>
          <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
        </div>
        {status && <StatusIndicator status={status} />}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);

// Detail row component
const DetailRow = ({ label, value, type = 'text' }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">{label}:</span>
    <span className={`text-sm ml-3 ${
      type === 'token' ? 'text-blue-600 font-mono' : 'text-gray-900'
    } text-right break-all`}>
      {value || 'Not available'}
    </span>
  </div>
);

/**
 * WhatsApp Automation page displays setup details, WABA info, phone number info,
 * business verification status, payment method status, and allows sending test messages.
 */
export default function WhatsAppAutomation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wabaDetails, setWabaDetails] = useState(null);
  const [wabaError, setWabaError] = useState(null);
  const [phoneDetails, setPhoneDetails] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [businessVerification, setBusinessVerification] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Fetch all details on render
  useEffect(() => {
    logWithRedaction('WhatsAppAutomation rendered', { session, status });
    if (status === 'unauthenticated') {
      toast.error('Please log in to access WhatsApp automation');
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.whatsappToken && session?.user?.whatsappWabaId) {
      // Fetch WABA details
      const fetchWabaDetails = async () => {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v22.0/${session.user.whatsappWabaId}?fields=id,name,currency,owner_business_info`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${session.user.whatsappToken}`,
              },
            }
          );
          const data = await response.json();
          console.log('WABA API Response:', JSON.stringify(data, null, 2));
          
          if (response.ok && data.id) {
            setWabaDetails(data);
          } else {
            setWabaError(data.error?.message || 'Failed to fetch WABA details');
          }
        } catch (error) {
          console.error('WABA API Error:', error);
          setWabaError(error.message);
        }
      };

      // Fetch phone number details
      const fetchPhoneDetails = async () => {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v22.0/${session.user.whatsappWabaId}/phone_numbers?fields=id,cc,country_dial_code,display_phone_number,verified_name,status,quality_rating,search_visibility,platform_type,code_verification_status`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${session.user.whatsappToken}`,
              },
            }
          );
          const data = await response.json();
          console.log('Phone Numbers API Response:', JSON.stringify(data, null, 2));
          
          if (response.ok && data.data?.length > 0) {
            setPhoneDetails(data.data[0]);
          } else {
            setPhoneError(data.error?.message || 'Failed to fetch phone number details');
          }
        } catch (error) {
          console.error('Phone API Error:', error);
          setPhoneError(error.message);
        }
      };

      // Fetch business verification status
      const fetchBusinessVerification = async () => {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v22.0/${session.user.whatsappWabaId}?fields=verified_name_status,account_status`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${session.user.whatsappToken}`,
              },
            }
          );
          const data = await response.json();
          console.log('Business Verification API Response:', JSON.stringify(data, null, 2));
          
          if (response.ok) {
            setBusinessVerification(data);
          } else {
            setVerificationError(data.error?.message || 'Failed to fetch verification status');
          }
        } catch (error) {
          console.error('Verification API Error:', error);
          setVerificationError(error.message);
        }
      };

      // Fetch payment method status
      const fetchPaymentDetails = async () => {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v22.0/${session.user.whatsappWabaId}?fields=payment_methods`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${session.user.whatsappToken}`,
              },
            }
          );
          const data = await response.json();
          console.log('Payment Methods API Response:', JSON.stringify(data, null, 2));
          
          if (response.ok) {
            setPaymentDetails(data.payment_methods || []);
          } else {
            setPaymentError(data.error?.message || 'Failed to fetch payment details');
          }
        } catch (error) {
          console.error('Payment API Error:', error);
          setPaymentError(error.message);
        }
      };

      fetchWabaDetails();
      fetchPhoneDetails();
      fetchBusinessVerification();
      fetchPaymentDetails();
    }
  }, [session, status, router]);

  // Handle sending a test message
  const handleSendTestMessage = async () => {
    if (!session?.user?.whatsappToken || !session?.user?.whatsappPhoneId) {
      toast.error('WhatsApp setup incomplete. Please set up WhatsApp automation.');
      router.push('/whatsapp');
      return;
    }

    if (phoneDetails?.status === 'PENDING') {
      toast.error('Phone number registration is pending.');
      return;
    }

    if (!paymentDetails || paymentDetails.length === 0) {
      toast.error('Please add a payment method in Business Settings to send messages.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session.user.whatsappToken,
          phoneNumberId: session.user.whatsappPhoneId,
          recipientPhone: session.user.phone || process.env.NEXT_PUBLIC_TEST_PHONE_NUMBER || '+1234567890',
          message: 'Test message from WhatsApp Automation page!',
        }),
        credentials: 'include',
      });

      const data = await res.json();
      console.log('Test Message API Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        toast.success('Test message sent successfully!');
      } else {
        toast.error(`Failed to send test message: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test Message Error:', error);
      toast.error(`Error sending test message: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  // Rest of the component remains exactly the same...
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-lg font-medium text-gray-700">Loading your WhatsApp Business dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
                <p className="text-sm text-gray-600">Integration Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/whatsapp')}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                Setup
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {status === 'authenticated' && session?.user ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Information */}
            <InfoCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>}
              title="Account Information"
            >
              <div className="space-y-1">
                <DetailRow label="Name" value={session.user.name || 'Not provided'} />
                <DetailRow label="Email" value={session.user.email || 'Not provided'} />
                <DetailRow label="User ID" value={session.user.id} />
                <DetailRow label="Role" value={session.user.role || 'User'} />
              </div>
            </InfoCard>

            {/* Connection Status */}
            <InfoCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>}
              title="WhatsApp Setup"
              status={session.user.whatsappToken && session.user.whatsappWabaId ? 'CONNECTED' : 'DISCONNECTED'}
            >
              <div className="space-y-1">
                <DetailRow label="WABA ID" value={session.user.whatsappWabaId || 'Not set'} />
                <DetailRow label="Phone Number ID" value={session.user.whatsappPhoneId || 'Not set'} />
                <DetailRow 
                  label="Access Token" 
                  value={session.user.whatsappToken ? `${session.user.whatsappToken.slice(0, 10)}...[REDACTED]` : 'Not set'} 
                  type="token"
                />
              </div>
            </InfoCard>

            {/* Business Account Details */}
            <InfoCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>}
              title="WABA Details"
              status={wabaDetails ? 'VERIFIED' : wabaError ? 'ERROR' : 'PENDING'}
            >
              {wabaDetails ? (
                <div className="space-y-1">
                  <DetailRow label="WABA ID" value={wabaDetails.id} />
                  <DetailRow label="WABA Name" value={wabaDetails.name} />
                  <DetailRow label="Currency" value={wabaDetails.currency} />
                  <DetailRow label="Business Name" value={wabaDetails.owner_business_info?.name} />
                  <DetailRow label="Business ID" value={wabaDetails.owner_business_info?.id} />
                </div>
              ) : wabaError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">Error loading WABA details: {wabaError}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading WABA details...</span>
                </div>
              )}
            </InfoCard>

            {/* Phone Number Details */}
            <InfoCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>}
              title="Phone Number Details"
              status={phoneDetails?.status || 'UNKNOWN'}
            >
              {phoneDetails ? (
                <div className="space-y-1">
                  <DetailRow label="Phone Number ID" value={phoneDetails.id} />
                  <DetailRow label="Display Phone Number" value={phoneDetails.display_phone_number} />
                  <DetailRow label="Verified Name" value={phoneDetails.verified_name} />
                  <DetailRow label="Status" value={phoneDetails.status} />
                  <DetailRow label="Country Code" value={phoneDetails.cc} />
                  <DetailRow label="Country Dial Code" value={phoneDetails.country_dial_code} />
                  <DetailRow label="Quality Rating" value={phoneDetails.quality_rating} />
                  <DetailRow label="Search Visibility" value={phoneDetails.search_visibility} />
                  <DetailRow label="Platform Type" value={phoneDetails.platform_type} />
                  <DetailRow label="Code Verification Status" value={phoneDetails.code_verification_status} />
                  {phoneDetails.status === 'PENDING' && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Phone number registration is pending. Complete setup in{' '}
                        <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-yellow-900">
                          Meta Business Manager
                        </a>.
                      </p>
                    </div>
                  )}
                </div>
              ) : phoneError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">Error loading phone number details: {phoneError}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading phone number details...</span>
                </div>
              )}
            </InfoCard>

            {/* Business Verification Status */}
            <InfoCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              title="Business Verification"
              status={businessVerification?.verified_name_status || 'UNVERIFIED'}
            >
              {businessVerification ? (
                <div className="space-y-1">
                  <DetailRow label="Verified Name Status" value={businessVerification.verified_name_status} />
                  <DetailRow label="Account Status" value={businessVerification.account_status} />
                </div>
              ) : verificationError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">Error loading verification status: {verificationError}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading verification status...</span>
                </div>
              )}
              {businessVerification?.verified_name_status !== 'APPROVED' && (
                <Button
                  onClick={() => window.open('https://business.facebook.com/settings/security', '_blank')}
                  variant="outline"
                  className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Start Business Verification
                </Button>
              )}
            </InfoCard>

            {/* Payment Method Status */}
            <InfoCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>}
              title="Payment Methods"
              status={paymentDetails?.length > 0 ? 'CONNECTED' : 'DISCONNECTED'}
            >
              {paymentDetails ? (
                paymentDetails.length > 0 ? (
                  <div className="space-y-1">
                    {paymentDetails.map((method, index) => (
                      <DetailRow key={index} label={`Method ${index + 1}`} value={method.type || 'Card'} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">No payment methods found. Add one to enable messaging.</p>
                  </div>
                )
              ) : paymentError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">Error loading payment details: {paymentError}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading payment details...</span>
                </div>
              )}
              {(!paymentDetails || paymentDetails.length === 0) && (
                <Button
                  onClick={() => window.open('https://business.facebook.com/settings/payments', '_blank')}
                  variant="outline"
                  className="w-full mt-4 border-red-300 text-red-700 hover:bg-red-50"
                >
                  Add Payment Method
                </Button>
              )}
            </InfoCard>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/20 shadow-sm hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6" />
                      </svg>
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleSendTestMessage}
                      disabled={loading || !session.user.whatsappToken || !session.user.whatsappPhoneId || phoneDetails?.status === 'PENDING' || !paymentDetails?.length}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 font-medium shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Test Message
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => window.open('https://business.facebook.com', '_blank')}
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-50 h-11 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Meta Business Manager
                    </Button>
                  </div>
                  {phoneDetails?.status === 'PENDING' && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-yellow-800">
                          <strong>Action Required:</strong> Your phone number registration is pending. Test messaging is disabled until verification is complete.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to access your WhatsApp Business dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
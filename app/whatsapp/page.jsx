'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsappSetupButton from '../components/WhatsappSetupButton';

export default function WhatsappPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>WhatsApp Business Automation</CardTitle>
        </CardHeader>
        <CardContent>
          {session?.user?.whatsappToken ? (
            <div>
              <p>WhatsApp setup completed!</p>
              <p>WABA ID: {session.user.whatsappWabaId}</p>
              <p>Phone Number ID: {session.user.whatsappPhoneId}</p>
            </div>
          ) : (
            <>
              <p>Connect your WhatsApp Business Account to start automation.</p>
              <WhatsappSetupButton />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
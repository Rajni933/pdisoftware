import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthShell } from '@autoprime/ui';
import { SignInForm } from '../components/auth/SignInForm';

export const SignInPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('expired') === 'true';
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <AuthShell
      title="Autoprime Tata"
      subtitle="Pre-delivery inspection"
      orgName="Dhoot Group"
      error={authError}
    >
      <SignInForm
        sessionExpired={sessionExpired}
        fieldSize="sm"
        onErrorChange={setAuthError}
      />
    </AuthShell>
  );
};

import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthShell } from '@autoprime/ui';
import { SignInForm } from '../components/auth/SignInForm';

export const SignInPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('expired') === 'true';

  return (
    <AuthShell
      environment="Staging"
      version="v1.0.3 (412)"
      branchName="Basni Depot (Jodhpur)"
      supportPhone="1800 209 7979 · Ext. 4022"
      title="Autoprime PDI"
      subtitle="Pre-delivery inspection console"
      orgName="Tata Motors · Dhoot Group"
    >
      <SignInForm sessionExpired={sessionExpired} />
    </AuthShell>
  );
};

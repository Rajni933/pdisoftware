import React from 'react';
import { AuthShell } from '@autoprime/ui';
import { SignInForm } from '../components/auth/SignInForm';

export const VerifyOtpPage: React.FC = () => {
  return (
    <AuthShell
      environment="Staging"
      version="v1.0.3 (412)"
      branchName="Basni"
      supportPhone="1800 209 7979"
      title="Autoprime"
      subtitle="Pre-delivery inspection"
    >
      <SignInForm initialMode="verify" />
    </AuthShell>
  );
};

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';
import { MobileAuthShell } from '../components/MobileAuthShell';
import { MobileOtpInput } from '../components/MobileOtpInput';

export interface VerifyOtpScreenProps {
  phoneNumber?: string;
  employeeId?: string;
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
}

export const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({
  phoneNumber = '+91 ����� ��842',
  employeeId = 'EMP-1049',
  onSuccess,
  onBackToSignIn,
}) => {
  const [otp, setOtp] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Countdown ticker
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Mock verification
    setTimeout(() => {
      setIsLoading(false);
      if (code === '000000') {
        setErrorMsg('Invalid or expired verification code. Please try again.');
        setOtp('');
        return;
      }
      onSuccess?.();
    }, 600);
  };

  // Auto-advance when 6 digits are typed
  const handleOtpChange = (newCode: string) => {
    setOtp(newCode);
    if (errorMsg) setErrorMsg(null);
    if (newCode.length === 6) {
      handleVerify(newCode);
    }
  };

  const handleResend = () => {
    if (secondsRemaining > 0) return;
    setSecondsRemaining(60);
    setOtp('');
    setErrorMsg(null);
  };

  return (
    <MobileAuthShell
      title="Verify your identity"
      subtitle={`Enter the 6-digit code sent via SMS to ${phoneNumber} for employee ${employeeId}.`}
    >
      {/* Error alert */}
      {errorMsg && (
        <View style={styles.bannerDanger}>
          <AlertTriangle size={18} color={color.danger} strokeWidth={1.5} />
          <Text style={styles.bannerDangerText}>{errorMsg}</Text>
        </View>
      )}

      {/* 6-digit OTP component */}
      <MobileOtpInput
        value={otp}
        onChange={handleOtpChange}
        disabled={isLoading}
        isInvalid={!!errorMsg}
      />

      {/* Countdown and Resend */}
      <View style={styles.resendRow}>
        {secondsRemaining > 0 ? (
          <Text style={styles.timerText}>
            Resend code in{' '}
            <Text style={styles.timerMono}>{formatTimer(secondsRemaining)}</Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
            <Text style={styles.resendBtnText}>Resend verification code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={() => handleVerify()}
        disabled={isLoading || otp.length !== 6}
        style={[
          styles.primaryButton,
          (isLoading || otp.length !== 6) && styles.primaryButtonDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={color.textInverse} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Verify and sign in</Text>
        )}
      </TouchableOpacity>

      {/* Back button */}
      <TouchableOpacity
        onPress={onBackToSignIn}
        disabled={isLoading}
        style={styles.backButton}
      >
        <ArrowLeft size={18} color={color.textSecondary} strokeWidth={1.5} />
        <Text style={styles.backButtonText}>Back to sign in</Text>
      </TouchableOpacity>
    </MobileAuthShell>
  );
};

const styles = StyleSheet.create({
  bannerDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.dangerSoft,
    borderColor: color.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: space[3],
    marginBottom: space[3],
    gap: space[2],
  },
  bannerDangerText: {
    flex: 1,
    fontSize: type.bodySm.size,
    color: color.danger,
    lineHeight: type.bodySm.lh,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: space[4],
  },
  timerText: {
    fontSize: type.bodySm.size,
    color: color.textSecondary,
  },
  timerMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    color: color.textPrimary,
  },
  resendBtn: {
    paddingVertical: space[1],
    paddingHorizontal: space[2],
  },
  resendBtnText: {
    fontSize: type.bodySm.size,
    fontWeight: '600',
    color: color.action,
  },
  primaryButton: {
    height: size.controlXl, // 52px Yard touch target
    backgroundColor: color.action,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: color.actionDisabled,
  },
  primaryButtonText: {
    color: color.textInverse,
    fontSize: type.bodyLg.size,
    fontWeight: '600',
  },
  backButton: {
    height: size.controlXl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[3],
    gap: space[2],
  },
  backButtonText: {
    color: color.textSecondary,
    fontSize: type.body.size,
    fontWeight: '500',
  },
});

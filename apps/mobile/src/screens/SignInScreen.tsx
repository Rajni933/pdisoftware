import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Eye, EyeOff, Fingerprint, AlertTriangle, WifiOff, X } from 'lucide-react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';
import { MobileAuthShell } from '../components/MobileAuthShell';

export interface SignInScreenProps {
  onSignInSuccess?: (data: { employeeId: string }) => void;
  onRequireOtp?: (data: { employeeId: string; phone: string }) => void;
  onRequireDeviceCheck?: (data: { employeeId: string }) => void;
  onLockout?: (seconds: number) => void;
  onBiometricAuth?: () => void;
  isBiometricAvailable?: boolean;
  initialEmployeeId?: string;
  maxAttempts?: number;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignInSuccess,
  onRequireOtp,
  onRequireDeviceCheck,
  onLockout,
  onBiometricAuth,
  isBiometricAvailable = true,
  initialEmployeeId = '',
  maxAttempts = 5,
}) => {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const attemptsRemaining = maxAttempts - failedAttempts;

  const handleSignIn = async () => {
    if (!employeeId.trim() || !password.trim()) {
      setErrorMsg('Please enter your employee ID and password.');
      return;
    }

    if (isOffline) {
      setErrorMsg("You're offline. Sign in needs a connection.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Simulate auth API
    setTimeout(() => {
      setIsLoading(false);
      const cleanEmp = employeeId.trim().toUpperCase();

      // Demo/mock routing scenarios for verification
      if (cleanEmp.endsWith('2FA') || cleanEmp.includes('OTP')) {
        onRequireOtp?.({ employeeId: cleanEmp, phone: '+91 ����� ��842' });
        return;
      }

      if (cleanEmp.endsWith('NEW') || cleanEmp.includes('DEVICE')) {
        onRequireDeviceCheck?.({ employeeId: cleanEmp });
        return;
      }

      if (password === 'wrong') {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        if (nextFailed >= maxAttempts) {
          onLockout?.(300);
        } else {
          setErrorMsg(
            nextFailed >= 3
              ? `Incorrect password. ${maxAttempts - nextFailed} attempts remaining before account lockout.`
              : 'The employee ID or password is incorrect.'
          );
        }
        return;
      }

      // Successful sign in
      onSignInSuccess?.({ employeeId: cleanEmp });
    }, 600);
  };

  return (
    <MobileAuthShell
      title="Sign in to your yard"
      subtitle="Enter your employee ID and password issued by your depot administrator."
    >
      {/* Offline Alert */}
      {isOffline && (
        <View style={styles.bannerWarn}>
          <WifiOff size={18} color={color.warning} strokeWidth={1.5} />
          <Text style={styles.bannerWarnText}>
            You're offline. Sign in needs a connection. Cached yard records remain accessible once signed in.
          </Text>
        </View>
      )}

      {/* Error message */}
      {errorMsg && (
        <View style={styles.bannerDanger}>
          <AlertTriangle size={18} color={color.danger} strokeWidth={1.5} />
          <Text style={styles.bannerDangerText}>{errorMsg}</Text>
        </View>
      )}

      {/* Employee ID Field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>EMPLOYEE ID</Text>
        <TextInput
          value={employeeId}
          onChangeText={(val) => {
            setEmployeeId(val.toUpperCase());
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="e.g. EMP-1049"
          placeholderTextColor={color.textDisabled}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.textInputMono}
          editable={!isLoading}
        />
      </View>

      {/* Password Field */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TouchableOpacity
            onPress={() => setIsHelpOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotLink}>Forgot?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="������������"
            placeholderTextColor={color.textDisabled}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.passwordInput}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff size={20} color={color.textSecondary} strokeWidth={1.5} />
            ) : (
              <Eye size={20} color={color.textSecondary} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        onPress={handleSignIn}
        disabled={isLoading || !employeeId.trim() || !password.trim()}
        style={[
          styles.primaryButton,
          (isLoading || !employeeId.trim() || !password.trim()) && styles.primaryButtonDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={color.textInverse} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      {/* Biometric Quick Unlock (if enrolled on returning device) */}
      {isBiometricAvailable && (
        <TouchableOpacity
          onPress={onBiometricAuth}
          disabled={isLoading}
          style={styles.biometricButton}
        >
          <Fingerprint size={20} color={color.action} strokeWidth={1.5} />
          <Text style={styles.biometricButtonText}>Unlock with Biometrics</Text>
        </TouchableOpacity>
      )}

      {/* Admin Reset Instruction Modal */}
      <Modal visible={isHelpOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Password Reset</Text>
              <TouchableOpacity onPress={() => setIsHelpOpen(false)}>
                <X size={20} color={color.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              For security in vehicle yard operations, passwords cannot be reset self-serve.
              {'\n\n'}
              Please ask your Branch Administrator or Yard Manager to reset your credentials.
              {'\n\n'}
              <Text style={styles.modalMono}>Helpdesk: ext. 4022 � support@autoprime.dhoot.com</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setIsHelpOpen(false)}
              style={styles.modalDismissBtn}
            >
              <Text style={styles.modalDismissText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MobileAuthShell>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: space[4],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[1],
  },
  fieldLabel: {
    fontSize: type.micro.size,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: color.textSecondary,
    marginBottom: space[1],
  },
  forgotLink: {
    fontSize: type.caption.size,
    color: color.action,
    fontWeight: '500',
  },
  textInputMono: {
    height: size.controlXl, // 52px Yard mode touch target
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    paddingHorizontal: space[3],
    fontSize: type.bodyLg.size,
    color: color.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: size.controlXl,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: space[3],
    fontSize: type.bodyLg.size,
    color: color.textPrimary,
  },
  eyeButton: {
    width: size.controlXl,
    height: size.controlXl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    height: size.controlXl, // 52px Yard touch target
    backgroundColor: color.action,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[3],
  },
  primaryButtonDisabled: {
    backgroundColor: color.actionDisabled,
  },
  primaryButtonText: {
    color: color.textInverse,
    fontSize: type.bodyLg.size,
    fontWeight: '600',
  },
  biometricButton: {
    height: size.controlXl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    marginTop: space[3],
    gap: space[2],
  },
  biometricButtonText: {
    color: color.action,
    fontSize: type.body.size,
    fontWeight: '600',
  },
  bannerWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.warningSoft,
    borderColor: color.warningBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: space[3],
    marginBottom: space[4],
    gap: space[2],
  },
  bannerWarnText: {
    flex: 1,
    fontSize: type.bodySm.size,
    color: color.warning,
    lineHeight: type.bodySm.lh,
  },
  bannerDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.dangerSoft,
    borderColor: color.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: space[3],
    marginBottom: space[4],
    gap: space[2],
  },
  bannerDangerText: {
    flex: 1,
    fontSize: type.bodySm.size,
    color: color.danger,
    lineHeight: type.bodySm.lh,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: color.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[5],
  },
  modalCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderStrong,
    padding: space[5],
    width: '100%',
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[3],
  },
  modalTitle: {
    fontSize: type.h3.size,
    fontWeight: '600',
    color: color.textPrimary,
  },
  modalBody: {
    fontSize: type.body.size,
    color: color.textSecondary,
    lineHeight: type.body.lh,
    marginBottom: space[4],
  },
  modalMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: color.textPrimary,
    fontWeight: '500',
  },
  modalDismissBtn: {
    height: size.controlLg,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  modalDismissText: {
    color: color.textPrimary,
    fontWeight: '600',
    fontSize: type.body.size,
  },
});

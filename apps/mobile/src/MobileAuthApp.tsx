import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { ShieldAlert, RefreshCw } from 'lucide-react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';
import { MobileAuthShell } from './components/MobileAuthShell';
import { SignInScreen } from './screens/SignInScreen';
import { VerifyOtpScreen } from './screens/VerifyOtpScreen';
import { DeviceCheckScreen } from './screens/DeviceCheckScreen';
import { AppLockScreen } from './screens/AppLockScreen';

export type MobileAuthMode = 'signin' | 'verify' | 'locked' | 'device-check' | 'app-lock';

export const MobileAuthApp: React.FC = () => {
  const [mode, setMode] = useState<MobileAuthMode>('signin');
  const [employeeId, setEmployeeId] = useState('EMP-1049');
  const [lockoutSeconds, setLockoutSeconds] = useState(300);
  const [authedUser, setAuthedUser] = useState<string | null>(null);

  // Lockout countdown timer
  useEffect(() => {
    if (mode !== 'locked' || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setMode('signin');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, lockoutSeconds]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (mode === 'app-lock') {
    return (
      <AppLockScreen
        userName={authedUser || 'Ramesh Kumar'}
        employeeId={employeeId}
        depot="Basni Depot"
        onUnlockSuccess={() => Alert.alert('Success', 'Unlocked successfully!')}
        onUsePassword={() => setMode('signin')}
        onSwitchAccount={() => {
          setAuthedUser(null);
          setMode('signin');
        }}
      />
    );
  }

  if (mode === 'verify') {
    return (
      <VerifyOtpScreen
        phoneNumber="+91 ••••• ••842"
        employeeId={employeeId}
        onSuccess={() => {
          setAuthedUser(employeeId);
          setMode('app-lock');
        }}
        onBackToSignIn={() => setMode('signin')}
      />
    );
  }

  if (mode === 'device-check') {
    return (
      <DeviceCheckScreen
        employeeId={employeeId}
        employeeName="Ramesh Kumar"
        depot="Basni Depot · Yard Operations"
        onConfirmRegistration={() => {
          setAuthedUser(employeeId);
          setMode('app-lock');
        }}
        onCancel={() => setMode('signin')}
      />
    );
  }

  if (mode === 'locked') {
    return (
      <MobileAuthShell
        title="Account temporarily locked"
        subtitle="Security lockout initiated due to repeated incorrect password attempts."
      >
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconCircle}>
            <ShieldAlert size={36} color={color.danger} strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>Too many failed attempts</Text>
          <Text style={styles.lockedTimer}>{formatCountdown(lockoutSeconds)}</Text>
          <Text style={styles.lockedBody}>
            Sign in is paused to protect yard records. You may try again when the countdown expires.
            {'\n\n'}
            If you need immediate access, ask your branch administrator to reset your account.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setLockoutSeconds(300);
              setMode('signin');
            }}
            style={styles.demoResetBtn}
          >
            <RefreshCw size={16} color={color.textTertiary} strokeWidth={1.5} />
            <Text style={styles.demoResetText}>Reset timer (Dev Mode)</Text>
          </TouchableOpacity>
        </View>
      </MobileAuthShell>
    );
  }

  return (
    <SignInScreen
      initialEmployeeId={employeeId}
      onSignInSuccess={({ employeeId: emp }) => {
        setEmployeeId(emp);
        setAuthedUser(emp);
        setMode('app-lock');
      }}
      onRequireOtp={({ employeeId: emp }) => {
        setEmployeeId(emp);
        setMode('verify');
      }}
      onRequireDeviceCheck={({ employeeId: emp }) => {
        setEmployeeId(emp);
        setMode('device-check');
      }}
      onLockout={(secs) => {
        setLockoutSeconds(secs);
        setMode('locked');
      }}
      onBiometricAuth={() => {
        setAuthedUser(employeeId);
        setMode('app-lock');
      }}
    />
  );
};

const styles = StyleSheet.create({
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: space[4],
  },
  lockedIconCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: color.dangerSoft,
    borderColor: color.dangerBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[4],
  },
  lockedTitle: {
    fontSize: type.h2.size,
    fontWeight: '600',
    color: color.textPrimary,
    marginBottom: space[2],
  },
  lockedTimer: {
    fontSize: type.display.size,
    fontWeight: '600',
    color: color.danger,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginVertical: space[2],
  },
  lockedBody: {
    fontSize: type.body.size,
    color: color.textSecondary,
    textAlign: 'center',
    lineHeight: type.body.lh,
    marginBottom: space[6],
  },
  demoResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    padding: space[2],
  },
  demoResetText: {
    fontSize: type.caption.size,
    color: color.textTertiary,
  },
});
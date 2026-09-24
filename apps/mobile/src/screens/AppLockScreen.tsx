import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Lock, Fingerprint, KeyRound, LogOut } from 'lucide-react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';

export interface AppLockScreenProps {
  userName?: string;
  employeeId?: string;
  depot?: string;
  onUnlockSuccess?: () => void;
  onUsePassword?: () => void;
  onSwitchAccount?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  userName = 'Ramesh Kumar',
  employeeId = 'EMP-1049',
  depot = 'Basni Depot',
  onUnlockSuccess,
  onUsePassword,
  onSwitchAccount,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricUnlock = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onUnlockSuccess?.();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={color.bg} />
      <View style={styles.container}>
        {/* Top Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandSubtitle}>TATA MOTORS � DHOOT GROUP</Text>
          <Text style={styles.brandTitle}>Autoprime PDI</Text>
        </View>

        {/* Center Lock Status Block */}
        <View style={styles.centerBlock}>
          <View style={styles.iconCircle}>
            <Lock size={32} color={color.action} strokeWidth={1.5} />
          </View>
          <Text style={styles.lockTitle}>Autoprime Locked</Text>
          <Text style={styles.lockSubtitle}>
            Session paused to protect vehicle inspection records.
          </Text>

          {/* User badge */}
          <View style={styles.userCard}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userMeta}>
              {employeeId} � {depot}
            </Text>
          </View>
        </View>

        {/* Bottom Actions within thumb reach */}
        <View style={styles.actionsBlock}>
          <TouchableOpacity
            onPress={handleBiometricUnlock}
            disabled={isAuthenticating}
            style={styles.primaryButton}
          >
            {isAuthenticating ? (
              <ActivityIndicator color={color.textInverse} size="small" />
            ) : (
              <>
                <Fingerprint size={22} color={color.textInverse} strokeWidth={1.5} />
                <Text style={styles.primaryButtonText}>Unlock with Biometrics</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onUsePassword}
            disabled={isAuthenticating}
            style={styles.secondaryButton}
          >
            <KeyRound size={20} color={color.action} strokeWidth={1.5} />
            <Text style={styles.secondaryButtonText}>Use Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSwitchAccount}
            disabled={isAuthenticating}
            style={styles.switchButton}
          >
            <LogOut size={18} color={color.textTertiary} strokeWidth={1.5} />
            <Text style={styles.switchButtonText}>Switch account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[5],
    paddingBottom: space[6],
  },
  header: {
    alignItems: 'center',
    paddingTop: space[3],
  },
  brandSubtitle: {
    fontSize: type.micro.size,
    fontWeight: '600',
    letterSpacing: 1,
    color: color.textSecondary,
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: type.h2.size,
    fontWeight: '600',
    color: color.textPrimary,
    marginTop: space[1],
  },
  centerBlock: {
    alignItems: 'center',
    paddingHorizontal: space[3],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: color.actionSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[4],
  },
  lockTitle: {
    fontSize: type.h1.size,
    lineHeight: type.h1.lh,
    fontWeight: '600',
    color: color.textPrimary,
    marginBottom: space[2],
  },
  lockSubtitle: {
    fontSize: type.body.size,
    color: color.textSecondary,
    textAlign: 'center',
    lineHeight: type.body.lh,
    marginBottom: space[5],
  },
  userCard: {
    backgroundColor: color.surface,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space[3],
    paddingHorizontal: space[5],
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  userName: {
    fontSize: type.h3.size,
    fontWeight: '600',
    color: color.textPrimary,
  },
  userMeta: {
    fontSize: type.caption.size,
    color: color.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: space[1],
  },
  actionsBlock: {
    gap: space[3],
  },
  primaryButton: {
    height: size.controlXl, // 52px Yard touch target
    backgroundColor: color.action,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  primaryButtonText: {
    color: color.textInverse,
    fontSize: type.bodyLg.size,
    fontWeight: '600',
  },
  secondaryButton: {
    height: size.controlXl, // 52px Yard touch target
    backgroundColor: color.surface,
    borderColor: color.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  secondaryButtonText: {
    color: color.action,
    fontSize: type.body.size,
    fontWeight: '600',
  },
  switchButton: {
    height: size.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  switchButtonText: {
    color: color.textTertiary,
    fontSize: type.caption.size,
    fontWeight: '500',
  },
});

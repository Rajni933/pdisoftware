import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Smartphone, ShieldAlert } from 'lucide-react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';
import { MobileAuthShell } from '../components/MobileAuthShell';

export interface DeviceCheckScreenProps {
  employeeId?: string;
  employeeName?: string;
  deviceName?: string;
  deviceId?: string;
  depot?: string;
  onConfirmRegistration?: () => void;
  onCancel?: () => void;
}

export const DeviceCheckScreen: React.FC<DeviceCheckScreenProps> = ({
  employeeId = 'EMP-1049',
  employeeName = 'Ramesh Kumar',
  deviceName = 'Samsung Galaxy M14 5G (Yard Terminal)',
  deviceId = 'DEV-B42-9981-A',
  depot = 'Basni Depot � Yard Operations',
  onConfirmRegistration,
  onCancel,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      onConfirmRegistration?.();
    }, 700);
  };

  return (
    <MobileAuthShell
      title="New device registration"
      subtitle="This device has not been registered to your account yet."
    >
      {/* Device Info Panel */}
      <View style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <Smartphone size={22} color={color.action} strokeWidth={1.5} />
          <View style={styles.deviceHeaderDetails}>
            <Text style={styles.deviceName}>{deviceName}</Text>
            <Text style={styles.deviceIdMono}>{deviceId}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>EMPLOYEE</Text>
          <Text style={styles.metaValue}>{employeeName} ({employeeId})</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>ASSIGNED DEPOT</Text>
          <Text style={styles.metaValue}>{depot}</Text>
        </View>
      </View>

      {/* Policy compliance notice */}
      <View style={styles.policyNotice}>
        <ShieldAlert size={18} color={color.info} strokeWidth={1.5} />
        <Text style={styles.policyNoticeText}>
          Registering this handheld binds inspection sign-offs and checklist audit trails to your employee credentials. Only company-managed devices may be registered.
        </Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={isRegistering}
        style={styles.primaryButton}
      >
        {isRegistering ? (
          <ActivityIndicator color={color.textInverse} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Register and continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCancel}
        disabled={isRegistering}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelButtonText}>Cancel and sign out</Text>
      </TouchableOpacity>
    </MobileAuthShell>
  );
};

const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: color.surface,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space[4],
    marginBottom: space[4],
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  deviceHeaderDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: type.h3.size,
    fontWeight: '600',
    color: color.textPrimary,
  },
  deviceIdMono: {
    fontSize: type.caption.size,
    color: color.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: space[1],
  },
  divider: {
    height: 1,
    backgroundColor: color.borderSubtle,
    marginVertical: space[3],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  metaLabel: {
    fontSize: type.micro.size,
    fontWeight: '600',
    color: color.textSecondary,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: type.bodySm.size,
    color: color.textPrimary,
    fontWeight: '500',
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.infoSoft,
    borderColor: color.infoBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: space[3],
    marginBottom: space[5],
    gap: space[2],
  },
  policyNoticeText: {
    flex: 1,
    fontSize: type.caption.size,
    lineHeight: type.caption.lh,
    color: color.info,
  },
  primaryButton: {
    height: size.controlXl, // 52px Yard touch target
    backgroundColor: color.action,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  primaryButtonText: {
    color: color.textInverse,
    fontSize: type.bodyLg.size,
    fontWeight: '600',
  },
  cancelButton: {
    height: size.controlXl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: color.textSecondary,
    fontSize: type.body.size,
    fontWeight: '500',
  },
});

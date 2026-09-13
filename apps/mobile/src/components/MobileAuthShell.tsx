import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StatusBar,
} from 'react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';

export interface MobileAuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  environment?: 'staging' | 'production' | 'development';
  version?: string;
  depot?: string;
  supportText?: string;
}

export const MobileAuthShell: React.FC<MobileAuthShellProps> = ({
  children,
  title,
  subtitle,
  environment = 'staging',
  version = 'v1.0.3 (412)',
  depot = 'Basni Depot',
  supportText = 'Need help? Contact IT Helpdesk � ext. 4022',
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={color.bg} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header Brand Block � Collapses when keyboard is open */}
          <View style={[styles.brandBlock, isKeyboardVisible && styles.brandBlockCollapsed]}>
            <View style={styles.metaRow}>
              {environment !== 'production' && (
                <View style={styles.envBadge}>
                  <Text style={styles.envBadgeText}>
                    {environment.toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.versionText}>
                {depot} � {version}
              </Text>
            </View>

            {!isKeyboardVisible && (
              <View style={styles.brandTitleWrap}>
                <Text style={styles.brandSubtitle}>TATA MOTORS � DHOOT GROUP</Text>
                <Text style={styles.brandTitle}>Autoprime PDI</Text>
              </View>
            )}
          </View>

          {/* Screen Title Block */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
          </View>

          {/* Form Content (Bottom-weighted, within thumb reach) */}
          <View style={styles.formContainer}>
            {children}
          </View>

          {/* Support Line */}
          <View style={styles.footerWrap}>
            <Text style={styles.supportText}>{supportText}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.bg,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[6],
  },
  brandBlock: {
    marginBottom: space[4],
    paddingBottom: space[3],
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  brandBlockCollapsed: {
    marginBottom: space[2],
    paddingBottom: space[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  envBadge: {
    backgroundColor: color.warningSoft,
    borderColor: color.warningBorder,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: space[2],
    paddingVertical: space[0],
    height: 20,
    justifyContent: 'center',
  },
  envBadgeText: {
    color: color.warning,
    fontSize: type.micro.size,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: type.caption.size,
    color: color.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  brandTitleWrap: {
    marginTop: space[2],
  },
  brandSubtitle: {
    fontSize: type.micro.size,
    fontWeight: '600',
    letterSpacing: 1,
    color: color.textSecondary,
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: type.h1.size,
    lineHeight: type.h1.lh,
    fontWeight: '600',
    color: color.textPrimary,
    marginTop: space[1],
  },
  titleSection: {
    marginBottom: space[5],
  },
  screenTitle: {
    fontSize: type.h2.size,
    lineHeight: type.h2.lh,
    fontWeight: '600',
    color: color.textPrimary,
  },
  screenSubtitle: {
    fontSize: type.body.size,
    lineHeight: type.body.lh,
    color: color.textSecondary,
    marginTop: space[1],
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footerWrap: {
    marginTop: space[6],
    paddingTop: space[3],
    alignItems: 'center',
  },
  supportText: {
    fontSize: type.caption.size,
    color: color.textTertiary,
    textAlign: 'center',
  },
});

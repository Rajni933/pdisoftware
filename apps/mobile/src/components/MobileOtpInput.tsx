import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { color, space, radius, type, size } from '@autoprime/design-system';

export interface MobileOtpInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  isInvalid?: boolean;
}

export const MobileOtpInput: React.FC<MobileOtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  isInvalid = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const handlePress = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(cleaned);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
        caretHidden
      />

      <View style={styles.boxesRow}>
        {digits.map((digit, index) => {
          const isCellFocused = isFocused && (index === value.length || (index === length - 1 && value.length === length));
          return (
            <View
              key={index}
              style={[
                styles.cell,
                isCellFocused && styles.cellFocused,
                isInvalid && styles.cellInvalid,
                disabled && styles.cellDisabled,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  isInvalid && styles.cellTextInvalid,
                  disabled && styles.cellTextDisabled,
                ]}
              >
                {digit}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: space[4],
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[2],
  },
  cell: {
    flex: 1,
    height: size.controlXl, // 52px Yard touch min
    maxHeight: 56,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFocused: {
    borderColor: color.borderFocus,
    backgroundColor: color.surfaceSelected,
  },
  cellInvalid: {
    borderColor: color.danger,
    backgroundColor: color.dangerSoft,
  },
  cellDisabled: {
    backgroundColor: color.surfaceSunken,
    borderColor: color.borderSubtle,
  },
  cellText: {
    fontSize: type.h2.size,
    fontWeight: '600',
    color: color.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cellTextInvalid: {
    color: color.danger,
  },
  cellTextDisabled: {
    color: color.textDisabled,
  },
});

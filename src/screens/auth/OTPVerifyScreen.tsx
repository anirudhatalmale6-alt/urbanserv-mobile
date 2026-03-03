import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerify'>;
  route: RouteProp<AuthStackParamList, 'OTPVerify'>;
};

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 30;

export default function OTPVerifyScreen({ navigation, route }: Props) {
  const { phone, devOtp } = route.params;
  const { verifyOTP, selectedRole, sendOTP, login } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-verify when all digits are entered
  const otpString = otp.join('');
  useEffect(() => {
    if (otpString.length === OTP_LENGTH) {
      handleVerify(otpString);
    }
  }, [otpString]);

  const handleVerify = async (code: string) => {
    if (code.length !== OTP_LENGTH || !selectedRole) return;

    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP(phone, code, selectedRole);

      if (result.success) {
        if (result.isNewUser || !result.user?.name) {
          // New user — collect their name
          navigation.navigate('NameInput', {
            phone,
            role: selectedRole,
            userId: result.user?.id || '',
          });
        }
        // Existing user with name — AuthContext already logged them in
        // Navigation will automatically switch to the appropriate tabs
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
        clearOTP();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      clearOTP();
    } finally {
      setLoading(false);
    }
  };

  const clearOTP = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(COUNTDOWN_SECONDS);
    setError('');
    clearOTP();

    await sendOTP(phone);
  };

  const handleChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');

    if (digit.length === 0) {
      // Backspace / delete
      setOtp((prev) => {
        const newOtp = [...prev];
        newOtp[index] = '';
        return newOtp;
      });
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (digit.length === 1) {
      setOtp((prev) => {
        const newOtp = [...prev];
        newOtp[index] = digit;
        return newOtp;
      });
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Handle paste (multiple digits)
    if (digit.length > 1) {
      const digits = digit.slice(0, OTP_LENGTH).split('');
      setOtp((prev) => {
        const newOtp = [...prev];
        digits.forEach((d, i) => {
          if (index + i < OTP_LENGTH) {
            newOtp[index + i] = d;
          }
        });
        return newOtp;
      });
      const focusIdx = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      setOtp((prev) => {
        const newOtp = [...prev];
        newOtp[index - 1] = '';
        return newOtp;
      });
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const maskedPhone = phone.replace(/(\+91)(\d{3})(\d{4})(\d{3})/, '$1 $2****$4');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>{'<'}</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
            </Text>
          </View>

          {/* Dev OTP hint */}
          {devOtp && (
            <View style={styles.devHint}>
              <Text style={styles.devHintText}>Dev OTP: {devOtp}</Text>
            </View>
          )}

          {/* OTP Input Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Verifying...</Text>
            </View>
          )}

          {/* Resend */}
          <View style={styles.resendSection}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendBtn}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>
                Resend in {countdown}s
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
    ...SHADOWS.sm,
  },
  backBtnText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  header: {
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  phoneHighlight: {
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  devHint: {
    backgroundColor: '#FEF3C7',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xl,
    alignSelf: 'flex-start',
  },
  devHintText: {
    fontSize: FONT_SIZES.sm,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.medium,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    textAlign: 'center',
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  otpBoxError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  resendLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  resendBtn: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  countdownText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

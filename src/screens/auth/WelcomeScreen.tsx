import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, UserRole } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const { setSelectedRole } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selected) {
      setSelectedRole(selected);
      navigation.navigate('PhoneInput');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Logo / Branding */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>U</Text>
          </View>
          <Text style={styles.appName}>UrbanServ</Text>
          <Text style={styles.tagline}>Home services at your doorstep</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>How would you like to use UrbanServ?</Text>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selected === 'CONSUMER' && styles.roleCardSelected,
            ]}
            onPress={() => setSelected('CONSUMER')}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconCircle}>
              <Text style={styles.roleIcon}>🏠</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={[styles.roleTitle, selected === 'CONSUMER' && styles.roleTitleSelected]}>
                I need services
              </Text>
              <Text style={styles.roleDesc}>
                Book trusted professionals for your home
              </Text>
            </View>
            <View style={[styles.radioOuter, selected === 'CONSUMER' && styles.radioOuterSelected]}>
              {selected === 'CONSUMER' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selected === 'PROVIDER' && styles.roleCardSelected,
            ]}
            onPress={() => setSelected('PROVIDER')}
            activeOpacity={0.7}
          >
            <View style={[styles.roleIconCircle, { backgroundColor: '#FFF0F3' }]}>
              <Text style={styles.roleIcon}>🔧</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={[styles.roleTitle, selected === 'PROVIDER' && styles.roleTitleSelected]}>
                I provide services
              </Text>
              <Text style={styles.roleDesc}>
                Grow your business and find new customers
              </Text>
            </View>
            <View style={[styles.radioOuter, selected === 'PROVIDER' && styles.radioOuterSelected]}>
              {selected === 'PROVIDER' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={[styles.continueBtnText, !selected && styles.continueBtnTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: SPACING.huge,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  logoText: {
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textWhite,
  },
  appName: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.regular,
  },
  roleSection: {
    marginBottom: SPACING.xxxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  roleTitleSelected: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  continueBtnDisabled: {
    backgroundColor: COLORS.border,
    ...SHADOWS.sm,
  },
  continueBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  continueBtnTextDisabled: {
    color: COLORS.textLight,
  },
  footer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});

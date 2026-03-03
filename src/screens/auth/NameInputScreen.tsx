import React, { useState, useRef } from 'react';
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
import { useAuth, UserRole } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'NameInput'>;
  route: RouteProp<AuthStackParamList, 'NameInput'>;
};

export default function NameInputScreen({ navigation, route }: Props) {
  const { phone, role, userId } = route.params;
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isValidName = name.trim().length >= 2;

  const handleGetStarted = async () => {
    if (!isValidName) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login({
        id: userId,
        name: name.trim(),
        email: null,
        phone,
        role: role as UserRole,
      });
      // Navigation will automatically switch based on auth state
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>
              {role === 'PROVIDER'
                ? 'This will be shown to customers when they book your services'
                : 'Let us know how to address you'}
            </Text>
          </View>

          {/* Greeting Icon */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingCircle}>
              <Text style={styles.greetingEmoji}>
                {role === 'PROVIDER' ? '🛠' : '👋'}
              </Text>
            </View>
            <Text style={styles.greetingText}>
              {role === 'PROVIDER'
                ? 'Welcome aboard, professional!'
                : 'Welcome to UrbanServ!'}
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              ref={inputRef}
              style={[styles.nameInput, error ? styles.nameInputError : null]}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              autoFocus
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="done"
              onSubmitEditing={handleGetStarted}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={[styles.startBtn, !isValidName && styles.startBtnDisabled]}
            onPress={handleGetStarted}
            disabled={!isValidName || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.textWhite} />
            ) : (
              <Text style={[styles.startBtnText, !isValidName && styles.startBtnTextDisabled]}>
                Get Started
              </Text>
            )}
          </TouchableOpacity>
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
  greetingSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  greetingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  greetingEmoji: {
    fontSize: 32,
  },
  greetingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  inputSection: {
    marginBottom: SPACING.xxl,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  nameInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  startBtnDisabled: {
    backgroundColor: COLORS.border,
    ...SHADOWS.sm,
  },
  startBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  startBtnTextDisabled: {
    color: COLORS.textLight,
  },
});

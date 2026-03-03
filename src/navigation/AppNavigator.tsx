import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import PhoneInputScreen from '../screens/auth/PhoneInputScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import NameInputScreen from '../screens/auth/NameInputScreen';

// Consumer Screens
import HomeScreen from '../screens/consumer/HomeScreen';
import ServicesScreen from '../screens/consumer/ServicesScreen';
import BookingsScreen from '../screens/consumer/BookingsScreen';
import ProfileScreen from '../screens/consumer/ProfileScreen';

// Provider Screens
import DashboardScreen from '../screens/provider/DashboardScreen';
import ProviderBookingsScreen from '../screens/provider/ProviderBookingsScreen';
import EarningsScreen from '../screens/provider/EarningsScreen';
import ProviderProfileScreen from '../screens/provider/ProviderProfileScreen';

// ── Type Definitions ───────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  PhoneInput: undefined;
  OTPVerify: { phone: string; devOtp?: string };
  NameInput: { phone: string; role: string; userId: string };
};

export type ConsumerTabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type ProviderTabParamList = {
  Dashboard: undefined;
  ProviderBookings: undefined;
  Earnings: undefined;
  ProviderProfile: undefined;
};

// ── Navigators ─────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ConsumerTab = createBottomTabNavigator<ConsumerTabParamList>();
const ProviderTab = createBottomTabNavigator<ProviderTabParamList>();

// ── Tab Icon Component ─────────────────────────────────

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const iconMap: Record<string, string> = {
    Home: '🏠',
    Services: '🔧',
    Bookings: '📋',
    Profile: '👤',
    Dashboard: '📊',
    ProviderBookings: '📋',
    Earnings: '💰',
    ProviderProfile: '👤',
  };

  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.tabIconDot, focused && styles.tabIconDotActive]} />
    </View>
  );
}

// ── Auth Navigator ─────────────────────────────────────

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <AuthStack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <AuthStack.Screen name="NameInput" component={NameInputScreen} />
    </AuthStack.Navigator>
  );
}

// ── Consumer Tab Navigator ─────────────────────────────

function ConsumerNavigator() {
  return (
    <ConsumerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.semibold,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <ConsumerTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <ConsumerTab.Screen
        name="Services"
        component={ServicesScreen}
        options={{ tabBarLabel: 'Services' }}
      />
      <ConsumerTab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <ConsumerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </ConsumerTab.Navigator>
  );
}

// ── Provider Tab Navigator ─────────────────────────────

function ProviderNavigator() {
  return (
    <ProviderTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.semibold,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <ProviderTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <ProviderTab.Screen
        name="ProviderBookings"
        component={ProviderBookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <ProviderTab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <ProviderTab.Screen
        name="ProviderProfile"
        component={ProviderProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </ProviderTab.Navigator>
  );
}

// ── Main Navigator ─────────────────────────────────────

export default function AppNavigator() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'PROVIDER' ? (
        <ProviderNavigator />
      ) : (
        <ConsumerNavigator />
      )}
    </NavigationContainer>
  );
}

// ── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  tabIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  tabIconDotActive: {
    backgroundColor: COLORS.primary,
  },
});

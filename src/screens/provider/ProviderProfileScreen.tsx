import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// ── Menu Item Type ─────────────────────────────────────

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

export default function ProviderProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Mock provider-specific data
  const approvalStatus = 'APPROVED';
  const rating = 4.8;
  const reviewsCount = 156;
  const completedJobs = 234;
  const memberSince = 'Jan 2025';

  const menuItems: MenuItem[] = [
    { icon: '✏️', label: 'Edit Profile', subtitle: 'Update your personal information' },
    { icon: '📋', label: 'My Services', subtitle: 'Manage services you offer' },
    { icon: '📍', label: 'Service Areas', subtitle: 'Set your working locations' },
    { icon: '🕐', label: 'Availability', subtitle: 'Set your working hours' },
    { icon: '📄', label: 'Documents', subtitle: 'ID proof, certifications' },
    { icon: '🏦', label: 'Bank Details', subtitle: 'Manage payout information' },
    { icon: '💬', label: 'Help & Support', subtitle: 'Get help with your account' },
    { icon: 'ℹ️', label: 'About Suchiti', subtitle: 'Version 1.0.0' },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const statusConfig = {
    APPROVED: { label: 'Verified', bg: '#D1FAE5', text: '#065F46', icon: '✅' },
    PENDING: { label: 'Pending Approval', bg: '#FEF3C7', text: '#92400E', icon: '⏳' },
    REJECTED: { label: 'Not Approved', bg: '#FEE2E2', text: '#991B1B', icon: '❌' },
  };

  const status = statusConfig[approvalStatus as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Provider'}</Text>
          <Text style={styles.userPhone}>{user?.phone || ''}</Text>

          {/* Approval Status */}
          <View style={[styles.approvalBadge, { backgroundColor: status.bg }]}>
            <Text style={styles.approvalIcon}>{status.icon}</Text>
            <Text style={[styles.approvalText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.statValue}>{rating}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviewsCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedJobs}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValueSmall}>{memberSince}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.quickActionEmoji}>📊</Text>
            </View>
            <Text style={styles.quickActionLabel}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Text style={styles.quickActionEmoji}>⭐</Text>
            </View>
            <Text style={styles.quickActionLabel}>Reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.quickActionEmoji}>🏆</Text>
            </View>
            <Text style={styles.quickActionLabel}>Badges</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FCE4EC' }]}>
              <Text style={styles.quickActionEmoji}>📢</Text>
            </View>
            <Text style={styles.quickActionLabel}>Referral</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.surface,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userPhone: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  approvalIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  approvalText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginTop: 1,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: FONT_SIZES.lg,
    color: '#F59E0B',
    marginRight: 2,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statValueSmall: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
  },
  quickActionBtn: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.error,
  },
  bottomSpacer: {
    height: SPACING.huge,
  },
});

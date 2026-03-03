import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL, COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────

interface PendingRequest {
  id: string;
  serviceName: string;
  consumerName: string;
  date: string;
  time: string;
  address: string;
  total: number;
}

interface RecentBooking {
  id: string;
  serviceName: string;
  consumerName: string;
  date: string;
  status: string;
  total: number;
}

// ── Mock Data ──────────────────────────────────────────

const MOCK_PENDING: PendingRequest[] = [
  { id: 'P001', serviceName: 'Full Home Deep Cleaning', consumerName: 'Priya S.', date: '2026-03-05', time: '10:00 AM', address: 'Flat 302, Horizon Towers, Andheri West', total: 1499 },
  { id: 'P002', serviceName: 'Bathroom Cleaning', consumerName: 'Rahul M.', date: '2026-03-05', time: '2:00 PM', address: '15B, Green Park, Bandra', total: 599 },
  { id: 'P003', serviceName: 'Kitchen Cleaning', consumerName: 'Neha K.', date: '2026-03-06', time: '11:00 AM', address: 'Apt 4A, Sea View, Juhu', total: 799 },
];

const MOCK_RECENT: RecentBooking[] = [
  { id: 'R001', serviceName: 'AC Service', consumerName: 'Amit P.', date: '2026-03-02', status: 'COMPLETED', total: 499 },
  { id: 'R002', serviceName: 'Deep Cleaning', consumerName: 'Suman L.', date: '2026-03-01', status: 'COMPLETED', total: 1499 },
  { id: 'R003', serviceName: 'Bathroom Cleaning', consumerName: 'Vikram J.', date: '2026-02-28', status: 'COMPLETED', total: 599 },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingRequest[]>(MOCK_PENDING);
  const [recent, setRecent] = useState<RecentBooking[]>(MOCK_RECENT);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const todaysBookings = 5;
  const pendingCount = pending.length;
  const completedCount = 3;
  const todayEarnings = 2597;

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [pendingRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/api/provider/bookings?status=PENDING`, {
          headers: { 'x-user-id': user.id },
        }),
        fetch(`${API_URL}/api/provider/bookings?status=COMPLETED&limit=5`, {
          headers: { 'x-user-id': user.id },
        }),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        if (data.length > 0) setPending(data);
      }
      if (recentRes.ok) {
        const data = await recentRes.json();
        if (data.length > 0) setRecent(data);
      }
    } catch {
      // Use mock data
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAccept = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReject = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const firstName = user?.name?.split(' ')[0] || 'Provider';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
            <Text style={styles.statValue}>{todaysBookings}</Text>
            <Text style={styles.statLabel}>Today's Bookings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
            <Text style={styles.statValue}>₹{todayEarnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>

        {/* Pending Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pending.length}</Text>
            </View>
          </View>

          {pending.length === 0 ? (
            <View style={styles.emptyPending}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          ) : (
            pending.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestService}>{req.serviceName}</Text>
                    <Text style={styles.requestConsumer}>{req.consumerName}</Text>
                  </View>
                  <Text style={styles.requestPrice}>₹{req.total.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.requestMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text style={styles.metaText}>{formatDate(req.date)}, {req.time}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText} numberOfLines={1}>{req.address}</Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(req.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(req.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>

          {recent.map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.recentCard} activeOpacity={0.7}>
              <View style={styles.recentLeft}>
                <Text style={styles.recentService}>{booking.serviceName}</Text>
                <Text style={styles.recentConsumer}>{booking.consumerName}</Text>
                <Text style={styles.recentDate}>{formatDate(booking.date)}</Text>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.recentPrice}>₹{booking.total.toLocaleString('en-IN')}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>Done</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerContent: {},
  greeting: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT_WEIGHTS.medium,
  },
  name: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  onlineText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textWhite,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.xxl,
    marginTop: -SPACING.xl,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - SPACING.xxl * 2 - SPACING.md) / 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    paddingHorizontal: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  emptyPending: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  requestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  requestInfo: {
    flex: 1,
  },
  requestService: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  requestConsumer: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  requestPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  requestMeta: {
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  rejectBtn: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.error,
  },
  acceptBtn: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.success,
  },
  acceptBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textWhite,
  },
  recentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  recentLeft: {
    flex: 1,
  },
  recentService: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  recentConsumer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 4,
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  completedBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#065F46',
  },
  bottomSpacer: {
    height: SPACING.huge,
  },
});

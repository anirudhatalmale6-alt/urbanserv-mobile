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

interface EarningEntry {
  id: string;
  serviceName: string;
  consumerName: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING';
}

// ── Mock Data ──────────────────────────────────────────

const MOCK_EARNINGS: EarningEntry[] = [
  { id: 'E001', serviceName: 'Full Home Deep Cleaning', consumerName: 'Amit Patel', date: '2026-03-02', amount: 1499, status: 'PAID' },
  { id: 'E002', serviceName: 'AC Service & Repair', consumerName: 'Suman Lalani', date: '2026-03-01', amount: 499, status: 'PAID' },
  { id: 'E003', serviceName: 'Bathroom Cleaning', consumerName: 'Vikram Joshi', date: '2026-02-28', amount: 599, status: 'PAID' },
  { id: 'E004', serviceName: 'Kitchen Cleaning', consumerName: 'Priya Sharma', date: '2026-02-27', amount: 799, status: 'PAID' },
  { id: 'E005', serviceName: 'Deep Cleaning', consumerName: 'Rahul Mehta', date: '2026-02-25', amount: 1499, status: 'PAID' },
  { id: 'E006', serviceName: 'Bathroom Cleaning', consumerName: 'Neha Kapoor', date: '2026-02-23', amount: 599, status: 'PAID' },
  { id: 'E007', serviceName: 'AC Installation', consumerName: 'Rohan G.', date: '2026-02-20', amount: 1299, status: 'PAID' },
  { id: 'E008', serviceName: 'Full Home Cleaning', consumerName: 'Kavita D.', date: '2026-03-03', amount: 1499, status: 'PENDING' },
];

export default function EarningsScreen() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningEntry[]>(MOCK_EARNINGS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/provider/earnings`, {
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setEarnings(data);
      }
    } catch {
      // Use mock data
    }
  }, [user]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  // Calculate totals
  const totalEarnings = earnings.filter((e) => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings.filter((e) => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0);

  // Simple month calculation
  const thisMonth = earnings
    .filter((e) => e.date.startsWith('2026-03') && e.status === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  const lastMonth = earnings
    .filter((e) => e.date.startsWith('2026-02') && e.status === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  const monthChange = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalEarnings)}</Text>
          {pendingEarnings > 0 && (
            <View style={styles.pendingRow}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>
                {formatCurrency(pendingEarnings)} pending
              </Text>
            </View>
          )}
        </View>

        {/* Month Comparison */}
        <View style={styles.comparisonSection}>
          <View style={styles.comparisonCard}>
            <Text style={styles.compLabel}>This Month</Text>
            <Text style={styles.compAmount}>{formatCurrency(thisMonth)}</Text>
            {monthChange !== 0 && (
              <View style={[styles.changeBadge, monthChange > 0 ? styles.changeBadgeUp : styles.changeBadgeDown]}>
                <Text style={[styles.changeText, monthChange > 0 ? styles.changeTextUp : styles.changeTextDown]}>
                  {monthChange > 0 ? '+' : ''}{monthChange}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.comparisonCard}>
            <Text style={styles.compLabel}>Last Month</Text>
            <Text style={styles.compAmount}>{formatCurrency(lastMonth)}</Text>
            <View style={styles.changeBadgeNeutral}>
              <Text style={styles.changeTextNeutral}>Feb 2026</Text>
            </View>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.breakdownSection}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>
              Completed Jobs: {earnings.filter((e) => e.status === 'PAID').length}
            </Text>
          </View>

          {/* Simple bar visualization */}
          <View style={styles.barChart}>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>This Month</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.min((thisMonth / Math.max(thisMonth, lastMonth, 1)) * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{formatCurrency(thisMonth)}</Text>
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Last Month</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFillSecondary,
                    { width: `${Math.min((lastMonth / Math.max(thisMonth, lastMonth, 1)) * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{formatCurrency(lastMonth)}</Text>
            </View>
          </View>
        </View>

        {/* Earnings History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Earnings History</Text>

          {earnings.map((entry) => (
            <View key={entry.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyService}>{entry.serviceName}</Text>
                <Text style={styles.historyConsumer}>{entry.consumerName}</Text>
                <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>{formatCurrency(entry.amount)}</Text>
                <View
                  style={[
                    styles.historyStatusBadge,
                    entry.status === 'PAID' ? styles.paidBadge : styles.pendingBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyStatusText,
                      entry.status === 'PAID' ? styles.paidText : styles.pendingStatusText,
                    ]}
                  >
                    {entry.status === 'PAID' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
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
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.sm,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textWhite,
    marginBottom: SPACING.md,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
    marginRight: SPACING.sm,
  },
  pendingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textWhite,
    fontWeight: FONT_WEIGHTS.medium,
  },
  comparisonSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xxl,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  compLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.sm,
  },
  compAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  changeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  changeBadgeUp: {
    backgroundColor: '#D1FAE5',
  },
  changeBadgeDown: {
    backgroundColor: '#FEE2E2',
  },
  changeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  changeTextUp: {
    color: '#065F46',
  },
  changeTextDown: {
    color: '#991B1B',
  },
  changeBadgeNeutral: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  changeTextNeutral: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  breakdownSection: {
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  breakdownHeader: {
    marginBottom: SPACING.lg,
  },
  breakdownTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  barChart: {},
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  barLabel: {
    width: 80,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.divider,
    borderRadius: 6,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  barFillSecondary: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
  },
  barValue: {
    width: 70,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  historySection: {
    paddingHorizontal: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  historyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  historyLeft: {
    flex: 1,
  },
  historyService: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  historyConsumer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 4,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  historyStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  historyStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  paidText: {
    color: '#065F46',
  },
  pendingStatusText: {
    color: '#92400E',
  },
  bottomSpacer: {
    height: SPACING.huge,
  },
});

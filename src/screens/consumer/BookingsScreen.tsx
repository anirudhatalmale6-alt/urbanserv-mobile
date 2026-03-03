import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL, COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// ── Types ──────────────────────────────────────────────

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED';

interface BookingItem {
  id: string;
  serviceName: string;
  category: string;
  status: BookingStatus;
  date: string;
  time: string;
  total: number;
  providerName: string;
  address: string;
}

// ── Mock Data ──────────────────────────────────────────

const MOCK_BOOKINGS: BookingItem[] = [
  { id: 'B001', serviceName: 'Full Home Deep Cleaning', category: 'Cleaning', status: 'CONFIRMED', date: '2026-03-05', time: '10:00 AM', total: 1499, providerName: 'Rajesh K.', address: 'Flat 302, Horizon Towers, Andheri West' },
  { id: 'B002', serviceName: 'AC Service & Repair', category: 'AC Repair', status: 'IN_PROGRESS', date: '2026-03-03', time: '2:00 PM', total: 499, providerName: 'Sunil M.', address: 'Flat 302, Horizon Towers, Andheri West' },
  { id: 'B003', serviceName: 'Pipe Leak Repair', category: 'Plumbing', status: 'COMPLETED', date: '2026-02-28', time: '11:00 AM', total: 399, providerName: 'Vikram S.', address: 'Flat 302, Horizon Towers, Andheri West' },
  { id: 'B004', serviceName: 'Wiring & Switches', category: 'Electrical', status: 'COMPLETED', date: '2026-02-25', time: '4:00 PM', total: 349, providerName: 'Amit P.', address: 'Flat 302, Horizon Towers, Andheri West' },
  { id: 'B005', serviceName: 'Bathroom Cleaning', category: 'Cleaning', status: 'CANCELLED', date: '2026-02-20', time: '9:00 AM', total: 599, providerName: 'Ravi T.', address: 'Flat 302, Horizon Towers, Andheri West' },
  { id: 'B006', serviceName: 'Fan Installation', category: 'Electrical', status: 'PENDING', date: '2026-03-07', time: '3:00 PM', total: 249, providerName: 'Pending', address: 'Flat 302, Horizon Towers, Andheri West' },
];

// ── Status Badge Colors ────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { label: 'Confirmed', bg: '#DBEAFE', text: '#1E40AF' },
  IN_PROGRESS: { label: 'In Progress', bg: '#E0E7FF', text: '#3730A3' },
  COMPLETED: { label: 'Completed', bg: '#D1FAE5', text: '#065F46' },
  CANCELLED: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B' },
};

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>(MOCK_BOOKINGS);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings?userId=${user.id}`, {
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setBookings(data);
      }
    } catch {
      // Use mock data
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
    if (activeTab === 'COMPLETED') return ['COMPLETED', 'CANCELLED'].includes(b.status);
    return true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Cleaning: '🧹', Plumbing: '🔧', Electrical: '⚡',
      Painting: '🎨', 'AC Repair': '❄️', Carpentry: '🪚',
    };
    return icons[category] || '🔩';
  };

  const renderBookingCard = ({ item }: { item: BookingItem }) => {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <TouchableOpacity style={styles.bookingCard} activeOpacity={0.7}>
        {/* Top Row: Icon + Service Info + Status Badge */}
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{getCategoryIcon(item.category)}</Text>
          </View>
          <View style={styles.cardMain}>
            <Text style={styles.cardServiceName} numberOfLines={1}>{item.serviceName}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Details Row */}
        <View style={styles.cardDetails}>
          <View style={styles.cardDetailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{item.time}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValueBold}>₹{item.total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Provider */}
        <View style={styles.cardProvider}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerAvatarText}>
              {item.providerName.charAt(0)}
            </Text>
          </View>
          <Text style={styles.providerName}>{item.providerName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tab Filters */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyDesc}>
              Your bookings will appear here once you book a service
            </Text>
          </View>
        }
      />
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.divider,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textWhite,
  },
  listContent: {
    padding: SPACING.xxl,
    paddingTop: SPACING.lg,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardMain: {
    flex: 1,
  },
  cardServiceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  cardCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardDetailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  detailValueBold: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  cardProvider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  providerAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  providerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.huge * 2,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
});

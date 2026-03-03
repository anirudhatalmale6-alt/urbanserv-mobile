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
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL, COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// ── Types ──────────────────────────────────────────────

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type FilterTab = 'ALL' | 'PENDING' | 'ACTIVE' | 'DONE';

interface ProviderBooking {
  id: string;
  serviceName: string;
  category: string;
  consumerName: string;
  consumerPhone: string;
  status: BookingStatus;
  date: string;
  time: string;
  total: number;
  address: string;
  services: string[];
}

// ── Mock Data ──────────────────────────────────────────

const MOCK_BOOKINGS: ProviderBooking[] = [
  { id: 'PB001', serviceName: 'Full Home Deep Cleaning', category: 'Cleaning', consumerName: 'Priya Sharma', consumerPhone: '+91 98765 43210', status: 'PENDING', date: '2026-03-05', time: '10:00 AM', total: 1499, address: 'Flat 302, Horizon Towers, Andheri West, Mumbai 400053', services: ['Living Room', 'Kitchen', 'Bathroom x2', 'Bedroom x2'] },
  { id: 'PB002', serviceName: 'Bathroom Cleaning', category: 'Cleaning', consumerName: 'Rahul Mehta', consumerPhone: '+91 87654 32109', status: 'CONFIRMED', date: '2026-03-05', time: '2:00 PM', total: 599, address: '15B, Green Park Society, Bandra East, Mumbai 400051', services: ['Bathroom Deep Clean'] },
  { id: 'PB003', serviceName: 'Kitchen Cleaning', category: 'Cleaning', consumerName: 'Neha Kapoor', consumerPhone: '+91 76543 21098', status: 'IN_PROGRESS', date: '2026-03-03', time: '11:00 AM', total: 799, address: 'Apt 4A, Sea View Towers, Juhu, Mumbai 400049', services: ['Kitchen Deep Clean', 'Chimney Cleaning'] },
  { id: 'PB004', serviceName: 'AC Service & Repair', category: 'AC Repair', consumerName: 'Amit Patel', consumerPhone: '+91 65432 10987', status: 'COMPLETED', date: '2026-03-02', time: '4:00 PM', total: 499, address: '23, Shanti Nagar, Dadar, Mumbai 400028', services: ['AC Gas Top-up', 'Filter Cleaning'] },
  { id: 'PB005', serviceName: 'Deep Home Cleaning', category: 'Cleaning', consumerName: 'Suman Lalani', consumerPhone: '+91 54321 09876', status: 'COMPLETED', date: '2026-03-01', time: '9:00 AM', total: 1499, address: 'B-12, Paradise Apartments, Powai, Mumbai 400076', services: ['Full Home', '4 Rooms', '3 Bathrooms'] },
  { id: 'PB006', serviceName: 'Bathroom Cleaning', category: 'Cleaning', consumerName: 'Vikram Joshi', consumerPhone: '+91 43210 98765', status: 'CANCELLED', date: '2026-02-28', time: '3:00 PM', total: 599, address: '7th Floor, Crystal Tower, Goregaon, Mumbai 400063', services: ['Bathroom Clean'] },
];

// ── Status Config ──────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { label: 'Confirmed', bg: '#DBEAFE', text: '#1E40AF' },
  IN_PROGRESS: { label: 'In Progress', bg: '#E0E7FF', text: '#3730A3' },
  COMPLETED: { label: 'Completed', bg: '#D1FAE5', text: '#065F46' },
  CANCELLED: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B' },
};

export default function ProviderBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ProviderBooking[]>(MOCK_BOOKINGS);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/provider/bookings`, {
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
    if (activeTab === 'PENDING') return b.status === 'PENDING';
    if (activeTab === 'ACTIVE') return ['CONFIRMED', 'IN_PROGRESS'].includes(b.status);
    if (activeTab === 'DONE') return ['COMPLETED', 'CANCELLED'].includes(b.status);
    return true;
  });

  const updateBookingStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleAction = (id: string, action: string) => {
    const statusMap: Record<string, BookingStatus> = {
      accept: 'CONFIRMED',
      start: 'IN_PROGRESS',
      complete: 'COMPLETED',
      reject: 'CANCELLED',
    };

    if (action === 'reject') {
      Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => updateBookingStatus(id, 'CANCELLED') },
      ]);
      return;
    }

    updateBookingStatus(id, statusMap[action]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getActionButtons = (booking: ProviderBooking) => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectActionBtn}
              onPress={() => handleAction(booking.id, 'reject')}
              activeOpacity={0.7}
            >
              <Text style={styles.rejectActionText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptActionBtn}
              onPress={() => handleAction(booking.id, 'accept')}
              activeOpacity={0.7}
            >
              <Text style={styles.acceptActionText}>Accept</Text>
            </TouchableOpacity>
          </View>
        );
      case 'CONFIRMED':
        return (
          <TouchableOpacity
            style={styles.startActionBtn}
            onPress={() => handleAction(booking.id, 'start')}
            activeOpacity={0.7}
          >
            <Text style={styles.startActionText}>Start Service</Text>
          </TouchableOpacity>
        );
      case 'IN_PROGRESS':
        return (
          <TouchableOpacity
            style={styles.completeActionBtn}
            onPress={() => handleAction(booking.id, 'complete')}
            activeOpacity={0.7}
          >
            <Text style={styles.completeActionText}>Mark Complete</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderBookingCard = ({ item }: { item: ProviderBooking }) => {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <View style={styles.bookingCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardService}>{item.serviceName}</Text>
            <Text style={styles.cardId}>#{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Consumer Info */}
        <View style={styles.consumerRow}>
          <View style={styles.consumerAvatar}>
            <Text style={styles.consumerAvatarText}>
              {item.consumerName.charAt(0)}
            </Text>
          </View>
          <View style={styles.consumerInfo}>
            <Text style={styles.consumerName}>{item.consumerName}</Text>
            <Text style={styles.consumerPhone}>{item.consumerPhone}</Text>
          </View>
          <Text style={styles.cardPrice}>₹{item.total.toLocaleString('en-IN')}</Text>
        </View>

        {/* Services List */}
        <View style={styles.servicesList}>
          {item.services.map((svc, idx) => (
            <View key={idx} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{svc}</Text>
            </View>
          ))}
        </View>

        {/* Date & Address */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatDate(item.date)}, {item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText} numberOfLines={2}>{item.address}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {getActionButtons(item)}
      </View>
    );
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'DONE', label: 'Done' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <Text style={styles.headerSubtitle}>Manage your service requests</Text>
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
            <Text style={styles.emptyTitle}>No bookings</Text>
            <Text style={styles.emptyDesc}>
              Bookings matching this filter will appear here
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
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
    paddingHorizontal: SPACING.lg,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardService: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  cardId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
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
  consumerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  consumerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  consumerAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  consumerInfo: {
    flex: 1,
  },
  consumerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  consumerPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  serviceTag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  serviceTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  detailsRow: {
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  rejectActionBtn: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.error,
  },
  acceptActionBtn: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.success,
  },
  acceptActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textWhite,
  },
  startActionBtn: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  startActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textWhite,
  },
  completeActionBtn: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  completeActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textWhite,
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
  },
});

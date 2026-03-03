import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL, COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.xxl * 2 - SPACING.md) / 2;

// ── Mock Data (fallback when API unavailable) ──────────

const MOCK_CATEGORIES = [
  { id: '1', name: 'Cleaning', icon: '🧹', color: '#E8F5E9' },
  { id: '2', name: 'Plumbing', icon: '🔧', color: '#E3F2FD' },
  { id: '3', name: 'Electrical', icon: '⚡', color: '#FFF3E0' },
  { id: '4', name: 'Painting', icon: '🎨', color: '#FCE4EC' },
  { id: '5', name: 'Carpentry', icon: '🪚', color: '#F3E5F5' },
  { id: '6', name: 'AC Repair', icon: '❄️', color: '#E0F7FA' },
  { id: '7', name: 'Appliance', icon: '🔌', color: '#FFF8E1' },
  { id: '8', name: 'Pest Control', icon: '🐛', color: '#EFEBE9' },
];

const MOCK_POPULAR_SERVICES = [
  { id: '1', name: 'Deep Home Cleaning', category: 'Cleaning', price: 999, rating: 4.8, reviewCount: 2340, duration: '3 hrs' },
  { id: '2', name: 'AC Service & Repair', category: 'AC Repair', price: 499, rating: 4.7, reviewCount: 1890, duration: '1 hr' },
  { id: '3', name: 'Full Home Painting', category: 'Painting', price: 4999, rating: 4.9, reviewCount: 980, duration: '2 days' },
  { id: '4', name: 'Bathroom Cleaning', category: 'Cleaning', price: 599, rating: 4.6, reviewCount: 3200, duration: '1.5 hrs' },
  { id: '5', name: 'Electrician Visit', category: 'Electrical', price: 299, rating: 4.5, reviewCount: 1500, duration: '1 hr' },
];

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [popularServices, setPopularServices] = useState<Service[]>(MOCK_POPULAR_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/services?popular=true&limit=5`),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.length > 0) setCategories(catData);
      }

      if (svcRes.ok) {
        const svcData = await svcRes.json();
        if (svcData.length > 0) setPopularServices(svcData);
      }
    } catch {
      // Use mock data if API unavailable
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {firstName} !</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>Mumbai, Maharashtra</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Service Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Categories</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconBg, { backgroundColor: cat.color }]}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.popularList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.popularCard} activeOpacity={0.7}>
                <View style={styles.popularImagePlaceholder}>
                  <Text style={styles.popularImageText}>
                    {item.category === 'Cleaning' ? '🧹' :
                     item.category === 'AC Repair' ? '❄️' :
                     item.category === 'Painting' ? '🎨' :
                     item.category === 'Electrical' ? '⚡' : '🔧'}
                  </Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularCategory}>{item.category}</Text>
                  <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.popularMeta}>
                    <Text style={styles.popularRating}>★ {item.rating}</Text>
                    <Text style={styles.popularReviews}>({item.reviewCount})</Text>
                  </View>
                  <View style={styles.popularBottom}>
                    <Text style={styles.popularPrice}>₹{item.price}</Text>
                    <Text style={styles.popularDuration}>{item.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.howItWorks}>
            {[
              { step: '1', title: 'Choose a Service', desc: 'Browse categories and select what you need', icon: '📋' },
              { step: '2', title: 'Book a Slot', desc: 'Pick a convenient date and time', icon: '📅' },
              { step: '3', title: 'Get it Done', desc: 'Our verified professional arrives at your door', icon: '✅' },
            ].map((item, index) => (
              <View key={item.step} style={styles.howStep}>
                <View style={styles.howStepIcon}>
                  <Text style={styles.howStepEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.howStepContent}>
                  <Text style={styles.howStepTitle}>{item.title}</Text>
                  <Text style={styles.howStepDesc}>{item.desc}</Text>
                </View>
                {index < 2 && <View style={styles.howStepLine} />}
              </View>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  dropdownIcon: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xxl,
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  section: {
    paddingHorizontal: SPACING.xxl,
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - SPACING.xxl * 2 - SPACING.md * 3) / 4,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  categoryIconBg: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  popularList: {
    paddingRight: SPACING.xxl,
  },
  popularCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  popularImagePlaceholder: {
    height: 120,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularImageText: {
    fontSize: 40,
  },
  popularInfo: {
    padding: SPACING.md,
  },
  popularCategory: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  popularName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  popularRating: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#F59E0B',
    marginRight: SPACING.xs,
  },
  popularReviews: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  popularBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  popularDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  howItWorks: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  howStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  howStepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  howStepEmoji: {
    fontSize: 20,
  },
  howStepContent: {
    flex: 1,
  },
  howStepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  howStepDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  howStepLine: {
    position: 'absolute',
    left: 21,
    top: 44,
    width: 2,
    height: 24,
    backgroundColor: COLORS.primaryBg,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});

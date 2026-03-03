import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL, COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration: string;
  description: string;
}

interface CartItem {
  service: Service;
  quantity: number;
}

// ── Mock Data ──────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: '1', name: 'Cleaning' },
  { id: '2', name: 'Plumbing' },
  { id: '3', name: 'Electrical' },
  { id: '4', name: 'Painting' },
  { id: '5', name: 'AC Repair' },
  { id: '6', name: 'Carpentry' },
];

const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Full Home Deep Cleaning', categoryId: '1', category: 'Cleaning', price: 1499, rating: 4.8, reviewCount: 2340, duration: '3 hrs', description: 'Complete home deep cleaning including kitchen, bathrooms, and living areas.' },
  { id: '2', name: 'Bathroom Cleaning', categoryId: '1', category: 'Cleaning', price: 599, rating: 4.6, reviewCount: 3200, duration: '1.5 hrs', description: 'Thorough bathroom scrubbing and sanitization.' },
  { id: '3', name: 'Kitchen Cleaning', categoryId: '1', category: 'Cleaning', price: 799, rating: 4.7, reviewCount: 1800, duration: '2 hrs', description: 'Deep cleaning of kitchen surfaces, chimney, and appliances.' },
  { id: '4', name: 'Pipe Leak Repair', categoryId: '2', category: 'Plumbing', price: 399, rating: 4.5, reviewCount: 980, duration: '1 hr', description: 'Fix leaking pipes and faucets.' },
  { id: '5', name: 'Tap Installation', categoryId: '2', category: 'Plumbing', price: 299, rating: 4.4, reviewCount: 750, duration: '45 min', description: 'Install new taps or replace existing ones.' },
  { id: '6', name: 'Wiring & Switches', categoryId: '3', category: 'Electrical', price: 349, rating: 4.6, reviewCount: 1200, duration: '1 hr', description: 'Electrical wiring, switch repair, and installation.' },
  { id: '7', name: 'Fan Installation', categoryId: '3', category: 'Electrical', price: 249, rating: 4.5, reviewCount: 900, duration: '1 hr', description: 'Ceiling fan installation or repair.' },
  { id: '8', name: 'Full Home Painting', categoryId: '4', category: 'Painting', price: 4999, rating: 4.9, reviewCount: 580, duration: '2-3 days', description: 'Professional interior painting for your entire home.' },
  { id: '9', name: 'AC Service', categoryId: '5', category: 'AC Repair', price: 499, rating: 4.7, reviewCount: 2100, duration: '1 hr', description: 'AC gas top-up, cleaning, and general service.' },
  { id: '10', name: 'AC Installation', categoryId: '5', category: 'AC Repair', price: 1299, rating: 4.8, reviewCount: 650, duration: '2 hrs', description: 'New split AC installation with copper piping.' },
  { id: '11', name: 'Furniture Repair', categoryId: '6', category: 'Carpentry', price: 599, rating: 4.3, reviewCount: 420, duration: '1-2 hrs', description: 'Repair chairs, tables, beds, and other furniture.' },
  { id: '12', name: 'Door Repair', categoryId: '6', category: 'Carpentry', price: 449, rating: 4.4, reviewCount: 310, duration: '1 hr', description: 'Fix door hinges, locks, and alignment.' },
];

export default function ServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setServices(data);
      }
    } catch {
      // Use mock data
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.categoryId === selectedCategory);

  const addToCart = (service: Service) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(service.id);
      if (existing) {
        newCart.set(service.id, { service, quantity: existing.quantity + 1 });
      } else {
        newCart.set(service.id, { service, quantity: 1 });
      }
      return newCart;
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(serviceId);
      if (existing && existing.quantity > 1) {
        newCart.set(serviceId, { ...existing, quantity: existing.quantity - 1 });
      } else {
        newCart.delete(serviceId);
      }
      return newCart;
    });
  };

  const getCartQuantity = (serviceId: string) => {
    return cart.get(serviceId)?.quantity || 0;
  };

  const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Array.from(cart.values()).reduce(
    (sum, item) => sum + item.service.price * item.quantity,
    0
  );

  const renderServiceCard = ({ item }: { item: Service }) => {
    const qty = getCartQuantity(item.id);

    return (
      <View style={styles.serviceCard}>
        <View style={styles.serviceIconBg}>
          <Text style={styles.serviceIcon}>
            {item.category === 'Cleaning' ? '🧹' :
             item.category === 'Plumbing' ? '🔧' :
             item.category === 'Electrical' ? '⚡' :
             item.category === 'Painting' ? '🎨' :
             item.category === 'AC Repair' ? '❄️' :
             item.category === 'Carpentry' ? '🪚' : '🔩'}
          </Text>
        </View>

        <View style={styles.serviceInfo}>
          <Text style={styles.serviceCategory}>{item.category}</Text>
          <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.serviceDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.serviceMeta}>
            <Text style={styles.serviceRating}>★ {item.rating}</Text>
            <Text style={styles.serviceReviews}>({item.reviewCount})</Text>
            <Text style={styles.serviceDuration}>{item.duration}</Text>
          </View>

          <View style={styles.serviceBottom}>
            <Text style={styles.servicePrice}>₹{item.price.toLocaleString('en-IN')}</Text>

            {qty === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addToCart(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityStepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => removeFromCart(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => addToCart(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <Text style={styles.headerSubtitle}>Browse and book home services</Text>
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              selectedCategory === cat.id && styles.chipSelected,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.id && styles.chipTextSelected,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceCard}
        contentContainerStyle={[
          styles.listContent,
          totalItems > 0 && { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartCount}>{totalItems} item{totalItems > 1 ? 's' : ''}</Text>
            <Text style={styles.cartPrice}>₹{totalPrice.toLocaleString('en-IN')}</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} activeOpacity={0.8}>
            <Text style={styles.cartBtnText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
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
  chipScroll: {
    maxHeight: 56,
    backgroundColor: COLORS.surface,
  },
  chipContainer: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.divider,
    marginRight: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.textWhite,
  },
  listContent: {
    padding: SPACING.xxl,
    paddingTop: SPACING.lg,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  serviceIconBg: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  serviceIcon: {
    fontSize: 26,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceCategory: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceRating: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#F59E0B',
    marginRight: SPACING.xs,
  },
  serviceReviews: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginRight: SPACING.md,
  },
  serviceDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  serviceBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  addBtn: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  stepperBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  stepperCount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
    paddingHorizontal: SPACING.sm,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  cartInfo: {
    flex: 1,
  },
  cartCount: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT_WEIGHTS.medium,
  },
  cartPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  cartBtn: {
    backgroundColor: COLORS.textWhite,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  cartBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
});

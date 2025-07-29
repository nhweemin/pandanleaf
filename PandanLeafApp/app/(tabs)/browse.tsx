import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Product, Category } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useFocusEffect } from '@react-navigation/native';

// Types for API responses
interface ProductData {
  _id: string;
  name: string;
  description: string;
  category: string;
  cuisine: string;
  images: string[];
  price: number;
  servings: number;
  cookTime: number;
  prepTime: number;
  difficulty: string;
  rating: {
    average: number;
    count: number;
  };
  chefId: {
    _id: string;
    businessName: string;
  };
  isActive: boolean;
}

interface ChefData {
  _id: string;
  businessName: string;
  specialties: string[];
  rating: {
    average: number;
    count: number;
  };
}

const API_BASE_URL = 'https://pandanleaf-production.up.railway.app';

const categories: Category[] = ['All', 'Main Course', 'Desserts', 'Snacks', 'Soups', 'Salads', 'Beverages', 'Breakfast', 'Lunch', 'Dinner'];

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedChef, setSelectedChef] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'cookTime' | 'newest'>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Pasta', 'Korean BBQ', 'Desserts']);
  const [searchFocused, setSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [chefs, setChefs] = useState<ChefData[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  
  // Cart functionality
  const { addToCart, isInCart } = useCart();

  // Refresh data when tab comes into focus to show latest photos
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // Also fetch data on initial mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching data:', new Date().toISOString());

      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }

      const productsData = await productsResponse.json();
      console.log('📦 Products fetched:', productsData.data.products.length);
      
      // Log product details for debugging
      productsData.data.products.forEach((product: any, index: number) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          vendorId: product.vendorId,
          imageType: product.images[0]?.startsWith('data:') ? 'Data URI' : 'URL',
          imageLength: product.images[0]?.length || 0
        });
      });

      setProducts(productsData.data.products || []);

      // Fetch vendors
      const vendorsResponse = await fetch(`${API_BASE_URL}/api/vendors`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0',
        }
      });

      if (!vendorsResponse.ok) {
        throw new Error(`Failed to fetch vendors: ${vendorsResponse.status}`);
      }

      const vendorsData = await vendorsResponse.json();
      console.log('🏪 Vendors fetched:', vendorsData.data.vendors.length);
      setVendors(vendorsData.data.vendors || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.chefId.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesChef = selectedChef === 'All' || product.chefId.businessName === selectedChef;
      const matchesPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating.average >= minRating;
      return matchesSearch && matchesCategory && matchesChef && matchesPriceRange && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating.average - a.rating.average;
        case 'cookTime':
          return a.cookTime - b.cookTime;
        case 'newest':
          return 0; // Could use createdAt if available
        default:
          return 0;
      }
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getProductImage = (item: ProductData) => {
    // Check if images array exists and has at least one valid image URL
    if (item.images && item.images.length > 0 && item.images[0] && 
        typeof item.images[0] === 'string' && item.images[0].trim() !== '') {
      return item.images[0];
    }
    
    // Return a food-specific placeholder based on category
    const category = item.category?.toLowerCase() || 'other';
    switch (category) {
      case 'main course':
        return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      case 'desserts':
      case 'dessert':
        return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      case 'snacks':
        return 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      case 'soups':
        return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      case 'salads':
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      case 'beverages':
        return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      case 'breakfast':
        return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
      default:
        return 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
    }
  };

  const renderProductCard: ListRenderItem<ProductData> = ({ item }) => (
    <TouchableOpacity style={[styles.productCard, viewMode === 'list' && styles.listProductCard]}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getProductImage(item) }} 
          style={[styles.productImage, viewMode === 'list' && styles.listProductImage]}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=300&fit=crop&crop=center' }}
          onError={(error) => {
            console.log('Failed to load image for product:', item.name, error);
            // Force fallback to default image
          }}
          onLoadStart={() => {
            // Image loading started
          }}
          onLoadEnd={() => {
            // Image loading completed
          }}
          resizeMode="cover"
          fadeDuration={200}
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item._id)}
        >
          <Ionicons 
            name={favorites.includes(item._id) ? "heart" : "heart-outline"} 
            size={20} 
            color={favorites.includes(item._id) ? "#FF3B30" : "#fff"} 
          />
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        <View style={styles.cuisineBadge}>
          <Text style={styles.cuisineBadgeText}>{item.cuisine}</Text>
        </View>
      </View>
      <View style={[styles.productInfo, viewMode === 'list' && styles.listProductInfo]}>
        <Text style={styles.productName} numberOfLines={viewMode === 'list' ? 1 : 2}>{item.name}</Text>
        <TouchableOpacity style={styles.chefNameContainer}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.chefName}>by {item.chefId.businessName}</Text>
        </TouchableOpacity>
        <View style={styles.productMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>
              {item.rating.average > 0 ? item.rating.average.toFixed(1) : 'New'}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.cookTime}>{item.cookTime}min</Text>
          </View>
        </View>
        <View style={styles.servingsContainer}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.servings}>{item.servings} serving{item.servings > 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity 
            style={[styles.addToCartButton, isInCart(item._id) && styles.inCartButton]}
            onPress={() => addToCart(item._id, item.name, item.chefId.businessName, item.price, getProductImage(item))}
          >
            <Ionicons 
              name={isInCart(item._id) ? "checkmark" : "add"} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: Category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => {
        setSelectedCategory(category);
        setSearchFocused(false);
      }}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.selectedCategoryButtonText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderChefButton = (chef: ChefData | { _id: string; businessName: string }) => (
    <TouchableOpacity
      key={chef._id || 'all'}
      style={[
        styles.chefButton,
        selectedChef === chef.businessName && styles.selectedChefButton
      ]}
      onPress={() => {
        setSelectedChef(chef.businessName);
        setSearchFocused(false);
      }}
    >
      <Text style={[
        styles.chefButtonText,
        selectedChef === chef.businessName && styles.selectedChefButtonText
      ]}>
        {chef.businessName}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading delicious dishes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Discover Local Chefs</ThemedText>
        <View style={styles.searchAndFilter}>
          <View style={styles.searchInputContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search dishes, chefs, or cuisine..."
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={() => {
                  setShowFilters(false);
                  setSearchFocused(true);
                }}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            {/* Search Suggestions */}
            {searchFocused && searchQuery.length === 0 && recentSearches.length > 0 && (
              <View style={styles.searchSuggestions}>
                <Text style={styles.suggestionHeader}>Recent Searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSearchQuery(search);
                      setSearchFocused(false);
                    }}
                  >
                    <View style={styles.suggestionRow}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.suggestionText}>{search}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.activeFilterButton]}
            onPress={() => {
              setShowFilters(!showFilters);
              setSearchFocused(false);
            }}
          >
            <Ionicons name="options" size={20} color={showFilters ? "#fff" : "#666"} />
          </TouchableOpacity>
          
          {/* Refresh Button */}
          <TouchableOpacity 
            style={[styles.refreshButton, loading && styles.refreshButtonLoading]}
            onPress={fetchData}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "hourglass" : "refresh"} 
              size={20} 
              color={loading ? "#ccc" : "#007AFF"} 
            />
          </TouchableOpacity>
        </View>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Sort by:</Text>
              <View style={styles.sortOptions}>
                {(['rating', 'price', 'cookTime', 'newest'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.sortOption, sortBy === option && styles.activeSortOption]}
                    onPress={() => setSortBy(option)}
                  >
                    <Text style={[styles.sortOptionText, sortBy === option && styles.activeSortOptionText]}>
                      {option === 'rating' ? 'Rating' :
                       option === 'price' ? 'Price' :
                       option === 'cookTime' ? 'Cook Time' : 'Newest'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Price Range: ${priceRange[0]} - ${priceRange[1]}</Text>
              <View style={styles.priceSliderContainer}>
                <TouchableOpacity 
                  style={[styles.priceButton, priceRange[0] === 0 && priceRange[1] === 15 && styles.activePriceButton]}
                  onPress={() => setPriceRange([0, 15])}
                >
                  <Text style={[styles.priceButtonText, priceRange[0] === 0 && priceRange[1] === 15 && styles.activePriceButtonText]}>$0-15</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.priceButton, priceRange[0] === 15 && priceRange[1] === 30 && styles.activePriceButton]}
                  onPress={() => setPriceRange([15, 30])}
                >
                  <Text style={[styles.priceButtonText, priceRange[0] === 15 && priceRange[1] === 30 && styles.activePriceButtonText]}>$15-30</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.priceButton, priceRange[0] === 30 && priceRange[1] === 50 && styles.activePriceButton]}
                  onPress={() => setPriceRange([30, 50])}
                >
                  <Text style={[styles.priceButtonText, priceRange[0] === 30 && priceRange[1] === 50 && styles.activePriceButtonText]}>$30+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Minimum Rating:</Text>
              <View style={styles.ratingFilter}>
                {[0, 3, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingOption, minRating === rating && styles.activeRatingOption]}
                    onPress={() => setMinRating(rating)}
                  >
                    <Ionicons name="star" size={16} color={minRating === rating ? "#FFD700" : "#ccc"} />
                    <Text style={styles.ratingOptionText}>{rating === 0 ? 'Any' : rating}+</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ThemedView>

      {/* Controls Bar */}
      <View style={styles.controlsContainer}>
        <Text style={styles.resultsInfo}>
          {filteredAndSortedProducts.length} dishes found
        </Text>
        <View style={styles.viewControls}>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => {
              setShowFilters(!showFilters);
              setSearchFocused(false);
            }}
          >
            <Ionicons name="filter" size={16} color="#666" />
            <Text style={styles.sortText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={20} color={viewMode === 'grid' ? "#fff" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? "#fff" : "#666"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        onTouchStart={() => {
          if (searchFocused) {
            setSearchFocused(false);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            colors={['#007AFF']}
            tintColor="#007AFF"
            title="Pull to refresh products..."
            titleColor="#666"
          />
        }
      >
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* Chef Filter Section */}
        <View style={styles.chefsContainer}>
          <Text style={styles.sectionTitle}>Filter by Chef:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chefsScroll}>
            {renderChefButton({ _id: 'all', businessName: 'All' })}
            {chefs.map(renderChefButton)}
          </ScrollView>
        </View>

        <View style={styles.productsContainer}>
          {filteredAndSortedProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No dishes found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your filters or search terms
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedChef('All');
                  setPriceRange([0, 50]);
                  setMinRating(0);
                }}
              >
                <Text style={styles.refreshButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredAndSortedProducts}
              renderItem={renderProductCard}
              keyExtractor={item => item._id}
              numColumns={viewMode === 'grid' ? 2 : 1}
              columnWrapperStyle={viewMode === 'grid' ? styles.row : null}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  productsContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chefName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  // Enhanced Product Card Styles
  listProductCard: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  listProductImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cuisineBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cuisineBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  listProductInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  chefNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  servings: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inCartButton: {
    backgroundColor: '#34C759',
  },
  // Search and Filter Styles
  searchAndFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  searchSuggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionHeader: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    padding: 8,
    backgroundColor: '#f8f9fa',
  },
  suggestionItem: {
    padding: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  filterButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filtersPanel: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeSortOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSortOptionText: {
    color: '#fff',
  },
  priceSliderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activePriceButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  activePriceButtonText: {
    color: '#fff',
  },
  ratingFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeRatingOption: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD700',
  },
  ratingOptionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  chefsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chefsScroll: {
    paddingHorizontal: 20,
  },
  chefButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedChefButton: {
    backgroundColor: '#007AFF',
  },
  chefButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedChefButtonText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  viewControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginRight: 8,
  },
  sortText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  viewModeButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  activeViewMode: {
    backgroundColor: '#007AFF',
  },
  refreshButtonLoading: {
    backgroundColor: '#f5f5f5',
  },
}); 
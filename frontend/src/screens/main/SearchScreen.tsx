import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useSearch from '../../hooks/useSearch';

type SearchType = 'all' | 'users' | 'posts' | 'restaurants';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchType>('all');

  const {
    results,
    suggestions,
    loading,
    error,
    search,
    loadMore,
    getSuggestions,
    clearResults,
    hasMore,
    setSearchType,
  } = useSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      search(query, activeFilter);
    } else {
      clearResults();
    }
  };

  const handleFilterChange = (filter: SearchType) => {
    setActiveFilter(filter);
    setSearchType(filter);
    if (searchQuery.length >= 2) {
      search(searchQuery, filter);
    }
  };

  const handleResultPress = (item: any) => {
    switch (item.type) {
      case 'user':
        navigation.navigate('Profile', { userId: item.id });
        break;
      case 'post':
        navigation.navigate('Comments', { postId: item.id });
        break;
      case 'restaurant':
        navigation.navigate('RestaurantDetail', { restaurantId: item.id });
        break;
    }
  };

  const renderSearchResult = ({ item }: any) => {
    switch (item.type) {
      case 'user':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item)}
          >
            <Image
              source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View style={styles.resultContent}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultSubtitle}>@{item.username}</Text>
              {item.followersCount > 0 && (
                <Text style={styles.resultStats}>
                  {item.followersCount} seguidores
                </Text>
              )}
            </View>
            <Text style={styles.resultType}>👤</Text>
          </TouchableOpacity>
        );

      case 'post':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item)}
          >
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
              />
            )}
            <View style={styles.resultContent}>
              <Text style={styles.resultName} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.resultSubtitle}>
                por @{item.user?.username}
              </Text>
              <Text style={styles.resultStats}>
                ❤️ {item.likesCount} 💬 {item.commentsCount}
              </Text>
            </View>
            <Text style={styles.resultType}>📝</Text>
          </TouchableOpacity>
        );

      case 'restaurant':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item)}
          >
            <Image
              source={{ uri: item.imageUrl || 'https://via.placeholder.com/50' }}
              style={styles.restaurantImage}
            />
            <View style={styles.resultContent}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultSubtitle}>
                {item.cuisine} • {item.city}
              </Text>
              {item.rating > 0 && (
                <Text style={styles.resultStats}>⭐ {item.rating.toFixed(1)}</Text>
              )}
            </View>
            <Text style={styles.resultType}>🍽️</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSearch(item)}
    >
      <Text style={styles.suggestionIcon}>🔍</Text>
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const filters: { key: SearchType; label: string; icon: string }[] = [
    { key: 'all', label: 'Tudo', icon: '🔍' },
    { key: 'users', label: 'Pessoas', icon: '👤' },
    { key: 'posts', label: 'Posts', icon: '📝' },
    { key: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuários, posts, restaurantes..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                clearResults();
              }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.icon} {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : searchQuery.length < 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Comece a buscar</Text>
          <Text style={styles.emptySubtext}>
            Digite pelo menos 2 caracteres para buscar
          </Text>
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Sugestões:</Text>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      ) : results.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>😔</Text>
          <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
          <Text style={styles.emptySubtext}>
            Tente buscar com outros termos
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasMore && !loading) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && results.length > 0 ? (
              <ActivityIndicator
                size="small"
                color="#E63946"
                style={styles.loader}
              />
            ) : null
          }
        />
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#E63946',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginTop: 24,
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  listContent: {
    flexGrow: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  postImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultStats: {
    fontSize: 12,
    color: '#999',
  },
  resultType: {
    fontSize: 24,
    marginLeft: 12,
  },
  loader: {
    paddingVertical: 20,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFE5E5',
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#E63946',
    textAlign: 'center',
  },
});

export default SearchScreen;

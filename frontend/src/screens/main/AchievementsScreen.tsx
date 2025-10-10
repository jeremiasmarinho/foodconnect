import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock hook - você precisará criar este hook baseado no service
const useAchievements = () => {
  const [progress, setProgress] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<{
    postsCount: number;
    followersCount: number;
    favoritesCount: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // TODO: Implement actual hook
  return {
    progress,
    stats,
    loading,
    error,
    refresh: () => {},
    checkAchievements: () => {},
  };
};

const AchievementsScreen = () => {
  const { progress, stats, loading, error, refresh, checkAchievements } =
    useAchievements();

  useEffect(() => {
    // Check for new achievements on mount
    checkAchievements();
  }, []);

  const renderAchievement = ({ item }: any) => {
    const { achievement, earned, progress: currentProgress, maxProgress, progressPercentage } = item;
    
    return (
      <View style={styles.achievementCard}>
        <LinearGradient
          colors={earned ? ['#FFD700', '#FFA500'] : ['#f5f5f5', '#e0e0e0']}
          style={styles.achievementGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Icon and Status */}
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            {earned && (
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedText}>✓ Conquistado</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementName,
              earned && styles.achievementNameEarned
            ]}>
              {achievement.name}
            </Text>
            <Text style={[
              styles.achievementDescription,
              earned && styles.achievementDescriptionEarned
            ]}>
              {achievement.description}
            </Text>

            {/* Progress Bar */}
            {!earned && maxProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentProgress}/{maxProgress} ({progressPercentage}%)
                </Text>
              </View>
            )}

            {/* Points and Category */}
            <View style={styles.achievementFooter}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{getCategoryLabel(achievement.category)}</Text>
              </View>
              <Text style={[
                styles.pointsText,
                earned && styles.pointsTextEarned
              ]}>
                {achievement.points} pontos
              </Text>
            </View>

            {/* Earned Date */}
            {earned && item.earnedAt && (
              <Text style={styles.earnedDate}>
                Conquistado em {formatDate(item.earnedAt)}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      creator: '🎨 Criador',
      social: '👥 Social',
      explorer: '🗺️ Explorador',
      foodie: '🍽️ Foodie',
    };
    return labels[category] || category;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading && !progress.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error.message || 'Erro ao carregar conquistas'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const earnedCount = progress.filter((p: any) => p.earned).length;
  const totalPoints = progress
    .filter((p: any) => p.earned)
    .reduce((sum: number, p: any) => sum + p.achievement.points, 0);

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <LinearGradient
        colors={['#E63946', '#FF6B6B']}
        style={styles.statsContainer}
      >
        <Text style={styles.statsTitle}>Suas Conquistas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{earnedCount}/{progress.length}</Text>
            <Text style={styles.statLabel}>Conquistadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((earnedCount / progress.length) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Completo</Text>
          </View>
        </View>
      </LinearGradient>

      {/* User Stats */}
      {stats && (
        <View style={styles.userStatsContainer}>
          <Text style={styles.userStatsTitle}>Suas Estatísticas</Text>
          <View style={styles.userStatsGrid}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatIcon}>📝</Text>
              <Text style={styles.userStatValue}>{stats.postsCount}</Text>
              <Text style={styles.userStatLabel}>Posts</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatIcon}>👥</Text>
              <Text style={styles.userStatValue}>{stats.followersCount}</Text>
              <Text style={styles.userStatLabel}>Seguidores</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatIcon}>❤️</Text>
              <Text style={styles.userStatValue}>{stats.favoritesCount}</Text>
              <Text style={styles.userStatLabel}>Favoritos</Text>
            </View>
          </View>
        </View>
      )}

      {/* Achievements List */}
      <FlatList
        data={progress}
        renderItem={renderAchievement}
        keyExtractor={(item: any) => item.achievement.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={['#E63946']}
          />
        }
      />

      {/* Check Button */}
      <TouchableOpacity
        style={styles.checkButton}
        onPress={checkAchievements}
      >
        <Text style={styles.checkButtonText}>🔍 Verificar Novas Conquistas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 40,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  userStatsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  userStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStatItem: {
    alignItems: 'center',
  },
  userStatIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  userStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  achievementCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementGradient: {
    padding: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 48,
  },
  earnedBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  earnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
  },
  achievementInfo: {
    gap: 8,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  achievementNameEarned: {
    color: '#fff',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  achievementDescriptionEarned: {
    color: 'rgba(255,255,255,0.9)',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E63946',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E63946',
  },
  pointsTextEarned: {
    color: '#fff',
  },
  earnedDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  checkButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#E63946',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#E63946',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AchievementsScreen;

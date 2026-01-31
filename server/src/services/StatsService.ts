import { PlayerStatsModel } from '../models/PlayerStats';
import { UserProfileModel } from '../models/UserProfile';

export class StatsService {
  private static leaderboardCache: Map<string, { data: any[]; timestamp: number }> = new Map();
  private static cacheTTL = 5 * 60 * 1000;

  static async getPlayerStats(userId: string): Promise<any> {
    const [userProfile, playerStats] = await Promise.all([
      UserProfileModel.getFullProfile(userId),
      PlayerStatsModel.findByUserId(userId),
    ]);

    if (!userProfile || !playerStats) {
      throw new Error('Player profile not found');
    }

    const killDeathRatio = await PlayerStatsModel.getKillDeathRatio(userId);

    return {
      userProfile: {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        avatarUrl: userProfile.avatar_url,
        displayName: userProfile.display_name,
        bio: userProfile.bio,
      },
      stats: {
        matchesPlayed: playerStats.matches_played,
        wins: playerStats.wins,
        losses: playerStats.losses,
        winRate: playerStats.win_rate,
        killDeathRatio,
        currentMMR: playerStats.current_mmr,
        mostPlayedCharacterId: playerStats.most_played_character_id,
      },
    };
  }

  static async getLeaderboard(season?: string): Promise<any[]> {
    const cacheKey = season || 'global';
    const cachedData = this.leaderboardCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTTL) {
      return cachedData.data;
    }

    const leaderboardData = await PlayerStatsModel.getLeaderboard(season);

    const leaderboardWithDetailedInfo = await Promise.all(
      leaderboardData.map(async (playerData) => {
        const userProfile = await UserProfileModel.getFullProfile(playerData.id);
        const killDeathRatio = await PlayerStatsModel.getKillDeathRatio(playerData.id);

        return {
          userId: playerData.id,
          username: userProfile?.username || 'Unknown',
          avatarUrl: userProfile?.avatar_url || null,
          mmr: playerData.current_mmr,
          winRate: playerData.win_rate,
          matchesPlayed: playerData.matches_played,
          killDeathRatio,
          rank: 0,
        };
      })
    );

    const leaderboard = leaderboardWithDetailedInfo
      .filter(player => player.mmr > 0)
      .sort((a, b) => b.mmr - a.mmr)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

    this.leaderboardCache.set(cacheKey, {
      data: leaderboard,
      timestamp: Date.now(),
    });

    return leaderboard;
  }

  static async getTopPlayersByMetric(metric: 'wins' | 'winRate' | 'matchesPlayed'): Promise<any[]> {
    const players = await PlayerStatsModel.getTopPlayers();

    const playersWithDetails = await Promise.all(
      players.map(async (playerData) => {
        return {
          ...playerData,
          rank: 0,
        };
      })
    );

    playersWithDetails.sort((a, b) => {
      switch (metric) {
        case 'wins':
          return b.wins - a.wins;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'matchesPlayed':
          return b.matchesPlayed - a.matchesPlayed;
        default:
          return 0;
      }
    });

    return playersWithDetails.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
  }

  static async updateSeasonalStats(userId: string, seasonData: any): Promise<void> {
  }

  static resetCache(): void {
    this.leaderboardCache.clear();
  }
}
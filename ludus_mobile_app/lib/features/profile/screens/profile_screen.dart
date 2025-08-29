import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    // TODO: Get actual user ID from auth provider
    const userId = 'mock-user-id';
    _loadProfileData(userId);
  }

  void _loadProfileData(String userId) {
    ref.read(profileProvider.notifier).refreshProfileData(userId);
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final userProfile = profileState.userProfile;
    final userStatistics = profileState.userStatistics;
    final isLoading = profileState.isLoading;
    final error = profileState.error;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Profile'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () => context.push('/profile/settings'),
          ),
        ],
      ),
      body: Stack(
        children: [
          if (isLoading)
            const Center(child: CircularProgressIndicator())
          else if (error != null)
            _buildErrorWidget(error)
          else if (userProfile == null)
            _buildEmptyProfileWidget()
          else
            _buildProfileContent(userProfile, userStatistics),
        ],
      ),
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading profile',
            style: AppTextStyles.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              const userId = 'mock-user-id';
              _loadProfileData(userId);
            },
            child: Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyProfileWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.person_outline,
            size: 64,
            color: AppColors.onSurface.withOpacity(0.6),
          ),
          const SizedBox(height: 16),
          Text(
            'No profile found',
            style: AppTextStyles.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Please complete your profile setup',
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.push('/profile/edit'),
            child: Text('Setup Profile'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileContent(userProfile, userStatistics) {
    return Column(
      children: [
        // Profile Header
        _buildProfileHeader(userProfile),
        
        // Tab Bar
        _buildTabBar(),
        
        // Tab Content
        Expanded(
          child: _buildTabContent(userProfile, userStatistics),
        ),
      ],
    );
  }

  Widget _buildProfileHeader(userProfile) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          // Profile Image
          CircleAvatar(
            radius: 50,
            backgroundColor: AppColors.onPrimary.withOpacity(0.2),
            backgroundImage: userProfile.hasProfileImage 
                ? NetworkImage(userProfile.profileImage!)
                : null,
            child: userProfile.hasProfileImage 
                ? null 
                : Text(
                    userProfile.initials,
                    style: AppTextStyles.titleLarge.copyWith(
                      color: AppColors.onPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
          
          const SizedBox(height: 16),
          
          // Name
          Text(
            userProfile.fullName,
            style: AppTextStyles.titleLarge.copyWith(
              color: AppColors.onPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          if (userProfile.email != null) ...[
            const SizedBox(height: 4),
            Text(
              userProfile.email!,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.onPrimary.withOpacity(0.8),
              ),
            ),
          ],
          
          const SizedBox(height: 16),
          
          // Profile Completion
          _buildProfileCompletionIndicator(),
        ],
      ),
    );
  }

  Widget _buildProfileCompletionIndicator() {
    final completionRate = ref.watch(profileCompletionProvider);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.onPrimary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.check_circle,
            color: AppColors.onPrimary,
            size: 16,
          ),
          const SizedBox(width: 8),
          Text(
            '${(completionRate * 100).toInt()}% Complete',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.onPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildTabButton('Overview', 0, Icons.dashboard),
          _buildTabButton('Bookings', 1, Icons.book),
          _buildTabButton('Favorites', 2, Icons.favorite),
          _buildTabButton('Reviews', 3, Icons.star),
        ],
      ),
    );
  }

  Widget _buildTabButton(String title, int index, IconData icon) {
    final isSelected = _currentIndex == index;
    
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: isSelected ? AppColors.onPrimary : AppColors.onSurface.withOpacity(0.6),
                size: 20,
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: AppTextStyles.bodySmall.copyWith(
                  color: isSelected ? AppColors.onPrimary : AppColors.onSurface.withOpacity(0.6),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent(userProfile, userStatistics) {
    switch (_currentIndex) {
      case 0:
        return _buildOverviewTab(userProfile, userStatistics);
      case 1:
        return _buildBookingsTab();
      case 2:
        return _buildFavoritesTab();
      case 3:
        return _buildReviewsTab();
      default:
        return _buildOverviewTab(userProfile, userStatistics);
    }
  }

  Widget _buildOverviewTab(userProfile, userStatistics) {
    final statsSummary = ref.watch(profileStatsSummaryProvider);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Statistics Cards
          _buildStatisticsCards(statsSummary),
          
          const SizedBox(height: 24),
          
          // Profile Information
          _buildProfileInfoSection(userProfile),
          
          const SizedBox(height: 24),
          
          // Quick Actions
          _buildQuickActionsSection(),
        ],
      ),
    );
  }

  Widget _buildStatisticsCards(Map<String, dynamic> stats) {
    return GridView.count(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'Total Bookings',
          stats['totalBookings'].toString(),
          Icons.book,
          AppColors.primary,
        ),
        _buildStatCard(
          'Total Spent',
          stats['totalSpent'].toStringAsFixed(2),
          Icons.attach_money,
          AppColors.success,
        ),
        _buildStatCard(
          'Completion Rate',
          '${(stats['completionRate'] * 100).toInt()}%',
          Icons.check_circle,
          AppColors.info,
        ),
        _buildStatCard(
          'Average Rating',
          stats['averageRating'].toStringAsFixed(1),
          Icons.star,
          AppColors.warning,
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const Spacer(),
          Text(
            value,
            style: AppTextStyles.titleLarge.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.onSurface.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileInfoSection(userProfile) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Profile Information',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow('Name', userProfile.fullName),
            if (userProfile.email != null)
              _buildInfoRow('Email', userProfile.email!),
            if (userProfile.phoneNumber != null)
              _buildInfoRow('Phone', userProfile.phoneNumber!),
            if (userProfile.age != null)
              _buildInfoRow('Age', '${userProfile.age} years'),
            if (userProfile.gender != null)
              _buildInfoRow('Gender', userProfile.gender!),
            if (userProfile.nationality != null)
              _buildInfoRow('Nationality', userProfile.nationality!),
            _buildInfoRow('Member Since', _formatDate(userProfile.createdAt)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.onSurface.withOpacity(0.6),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildActionButton(
              'Edit Profile',
              Icons.edit,
              () => context.push('/profile/edit'),
            ),
            _buildActionButton(
              'Payment Methods',
              Icons.payment,
              () => context.push('/profile/payment-methods'),
            ),
            _buildActionButton(
              'Notification Settings',
              Icons.notifications,
              () => context.push('/profile/notifications'),
            ),
            _buildActionButton(
              'Privacy Settings',
              Icons.privacy_tip,
              () => context.push('/profile/privacy'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      trailing: Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  Widget _buildBookingsTab() {
    final bookingHistory = ref.watch(bookingHistoryProvider);
    
    if (bookingHistory.isEmpty) {
      return _buildEmptyState(
        'No bookings yet',
        'Start exploring activities to see your booking history here',
        Icons.book_outlined,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: bookingHistory.length,
      itemBuilder: (context, index) {
        final booking = bookingHistory[index];
        return _buildBookingCard(booking);
      },
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary,
          child: Icon(Icons.book, color: AppColors.onPrimary),
        ),
        title: Text(booking['activityName'] ?? 'Unknown Activity'),
        subtitle: Text(booking['date'] ?? 'No date'),
        trailing: Chip(
          label: Text(booking['status'] ?? 'Unknown'),
          backgroundColor: _getStatusColor(booking['status']),
        ),
        onTap: () => context.push('/booking/${booking['id']}'),
      ),
    );
  }

  Widget _buildFavoritesTab() {
    final favorites = ref.watch(favoritesProvider);
    
    if (favorites.isEmpty) {
      return _buildEmptyState(
        'No favorites yet',
        'Save activities you love to see them here',
        Icons.favorite_outline,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: favorites.length,
      itemBuilder: (context, index) {
        final favorite = favorites[index];
        return _buildFavoriteCard(favorite);
      },
    );
  }

  Widget _buildFavoriteCard(Map<String, dynamic> favorite) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.error,
          child: Icon(Icons.favorite, color: AppColors.onPrimary),
        ),
        title: Text(favorite['name'] ?? 'Unknown Activity'),
        subtitle: Text(favorite['location'] ?? 'No location'),
        trailing: IconButton(
          icon: Icon(Icons.favorite, color: AppColors.error),
          onPressed: () {
            // TODO: Remove from favorites
          },
        ),
        onTap: () => context.push('/activity/${favorite['id']}'),
      ),
    );
  }

  Widget _buildReviewsTab() {
    final reviews = ref.watch(reviewsProvider);
    
    if (reviews.isEmpty) {
      return _buildEmptyState(
        'No reviews yet',
        'Share your experiences by leaving reviews',
        Icons.star_outline,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: reviews.length,
      itemBuilder: (context, index) {
        final review = reviews[index];
        return _buildReviewCard(review);
      },
    );
  }

  Widget _buildReviewCard(Map<String, dynamic> review) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.star, color: AppColors.warning, size: 20),
                const SizedBox(width: 8),
                Text(
                  '${review['rating'] ?? 0}/5',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  _formatDate(DateTime.parse(review['createdAt'] ?? DateTime.now().toIso8601String())),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              review['activityName'] ?? 'Unknown Activity',
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              review['comment'] ?? 'No comment',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: AppColors.onSurface.withOpacity(0.3),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTextStyles.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.onSurface.withOpacity(0.6),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.onSurface.withOpacity(0.2);
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

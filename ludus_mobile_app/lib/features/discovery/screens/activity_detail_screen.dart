import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../providers/activity_provider.dart';
import '../models/activity_model.dart';
import '../widgets/activity_card.dart';

class ActivityDetailScreen extends ConsumerStatefulWidget {
  final String activityId;

  const ActivityDetailScreen({
    super.key,
    required this.activityId,
  });

  @override
  ConsumerState<ActivityDetailScreen> createState() => _ActivityDetailScreenState();
}

class _ActivityDetailScreenState extends ConsumerState<ActivityDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _currentImageIndex = 0;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _onImageChanged(int index) {
    setState(() {
      _currentImageIndex = index;
    });
  }

  void _onFavoritePressed() {
    setState(() {
      _isFavorite = !_isFavorite;
    });
    // TODO: Implement favorite functionality
  }

  void _onBookNowPressed(ActivityModel activity) {
    context.push('/booking/${activity.id}');
  }

  void _onSharePressed(ActivityModel activity) {
    // TODO: Implement share functionality
  }

  @override
  Widget build(BuildContext context) {
    final activityAsync = ref.watch(activityByIdProvider(widget.activityId));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: activityAsync.when(
        data: (activity) {
          if (activity == null) {
            return _buildErrorScreen('Activity not found');
          }
          return _buildActivityDetail(activity);
        },
        loading: () => _buildLoadingScreen(),
        error: (error, stack) => _buildErrorScreen(error.toString()),
      ),
    );
  }

  Widget _buildActivityDetail(ActivityModel activity) {
    return CustomScrollView(
      slivers: [
        // App Bar with Image
        SliverAppBar(
          expandedHeight: 300,
          pinned: true,
          backgroundColor: AppColors.primary,
          flexibleSpace: FlexibleSpaceBar(
            background: _buildImageCarousel(activity),
          ),
          leading: IconButton(
            onPressed: () => context.pop(),
            icon: Icon(
              Icons.arrow_back,
              color: AppColors.onPrimary,
            ),
            style: IconButton.styleFrom(
              backgroundColor: AppColors.onPrimary.withOpacity(0.2),
            ),
          ),
          actions: [
            IconButton(
              onPressed: _onFavoritePressed,
              icon: Icon(
                _isFavorite ? Icons.favorite : Icons.favorite_border,
                color: _isFavorite ? AppColors.error : AppColors.onPrimary,
              ),
              style: IconButton.styleFrom(
                backgroundColor: AppColors.onPrimary.withOpacity(0.2),
              ),
            ),
            IconButton(
              onPressed: () => _onSharePressed(activity),
              icon: Icon(
                Icons.share,
                color: AppColors.onPrimary,
              ),
              style: IconButton.styleFrom(
                backgroundColor: AppColors.onPrimary.withOpacity(0.2),
              ),
            ),
          ],
        ),

        // Activity Info
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Rating
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        activity.title,
                        style: AppTextStyles.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.star,
                            size: 18,
                            color: AppColors.onPrimary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            activity.formattedRating,
                            style: AppTextStyles.labelMedium.copyWith(
                              color: AppColors.onPrimary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${activity.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.onPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Location
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 18,
                      color: AppColors.onSurface.withOpacity(0.6),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        activity.location,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Quick Info Cards
                Row(
                  children: [
                    Expanded(
                      child: _buildInfoCard(
                        icon: Icons.access_time,
                        title: 'Duration',
                        value: activity.formattedDuration,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildInfoCard(
                        icon: Icons.people,
                        title: 'Max Group',
                        value: '${activity.maxParticipants} people',
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildInfoCard(
                        icon: Icons.category,
                        title: 'Category',
                        value: activity.category,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Price
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.attach_money,
                        color: AppColors.primary,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Price',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        activity.formattedPrice,
                        style: AppTextStyles.headlineSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Tabs
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primary,
                    unselectedLabelColor: AppColors.onSurface.withOpacity(0.6),
                    indicatorColor: AppColors.primary,
                    tabs: const [
                      Tab(text: 'Overview'),
                      Tab(text: 'Details'),
                      Tab(text: 'Reviews'),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Tab Content
                SizedBox(
                  height: 400,
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildOverviewTab(activity),
                      _buildDetailsTab(activity),
                      _buildReviewsTab(activity),
                    ],
                  ),
                ),

                const SizedBox(height: 100), // Bottom padding for FAB
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildImageCarousel(ActivityModel activity) {
    if (activity.images.isEmpty) {
      return Container(
        color: AppColors.surface,
        child: Center(
          child: Icon(
            Icons.image_not_supported,
            size: 64,
            color: AppColors.onSurface.withOpacity(0.5),
          ),
        ),
      );
    }

    return Stack(
      children: [
        PageView.builder(
          onPageChanged: _onImageChanged,
          itemCount: activity.images.length,
          itemBuilder: (context, index) {
            return CachedNetworkImage(
              imageUrl: activity.images[index],
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: AppColors.surface,
                child: const Center(
                  child: CircularProgressIndicator(),
                ),
              ),
              errorWidget: (context, url, error) => Container(
                color: AppColors.surface,
                child: Icon(
                  Icons.image_not_supported,
                  color: AppColors.onSurface.withOpacity(0.5),
                  size: 64,
                ),
              ),
            );
          },
        ),
        // Image Indicators
        if (activity.images.length > 1)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                activity.images.length,
                (index) => Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _currentImageIndex == index
                        ? AppColors.onPrimary
                        : AppColors.onPrimary.withOpacity(0.3),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.onSurface.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 20,
            color: AppColors.primary,
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.onSurface.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppTextStyles.labelMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab(ActivityModel activity) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'About this activity',
            style: AppTextStyles.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            activity.description,
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 24),
          Text(
            'What\'s included',
            style: AppTextStyles.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          _buildIncludedItem(Icons.check_circle, 'Professional guide'),
          _buildIncludedItem(Icons.check_circle, 'All equipment provided'),
          _buildIncludedItem(Icons.check_circle, 'Safety briefing'),
          _buildIncludedItem(Icons.check_circle, 'Photos included'),
        ],
      ),
    );
  }

  Widget _buildDetailsTab(ActivityModel activity) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Activity Details',
            style: AppTextStyles.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildDetailRow('Vendor', activity.vendorName),
          _buildDetailRow('Category', activity.category),
          _buildDetailRow('Duration', activity.formattedDuration),
          _buildDetailRow('Max Participants', '${activity.maxParticipants} people'),
          _buildDetailRow('Location', activity.location),
          if (activity.latitude != null && activity.longitude != null)
            _buildDetailRow('Coordinates', '${activity.latitude}, ${activity.longitude}'),
          const SizedBox(height: 24),
          Text(
            'Important Information',
            style: AppTextStyles.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          _buildIncludedItem(Icons.info, 'Minimum age: 12 years'),
          _buildIncludedItem(Icons.info, 'Physical fitness required'),
          _buildIncludedItem(Icons.info, 'Weather dependent'),
          _buildIncludedItem(Icons.info, 'Cancellation policy applies'),
        ],
      ),
    );
  }

  Widget _buildReviewsTab(ActivityModel activity) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Reviews',
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              Text(
                '${activity.reviewCount} reviews',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.onSurface.withOpacity(0.6),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // TODO: Implement actual reviews
          Center(
            child: Column(
              children: [
                Icon(
                  Icons.rate_review,
                  size: 64,
                  color: AppColors.onSurface.withOpacity(0.3),
                ),
                const SizedBox(height: 16),
                Text(
                  'No reviews yet',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: AppColors.onSurface.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Be the first to review this activity!',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.onSurface.withOpacity(0.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncludedItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: AppColors.primary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w500,
                color: AppColors.onSurface.withOpacity(0.7),
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

  Widget _buildLoadingScreen() {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  Widget _buildErrorScreen(String error) {
    return Scaffold(
      body: Center(
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
              'Error',
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.pop(),
              child: Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}

// Floating Action Button for Booking
class ActivityDetailFAB extends ConsumerWidget {
  final ActivityModel activity;

  const ActivityDetailFAB({
    super.key,
    required this.activity,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FloatingActionButton.extended(
      onPressed: () {
        context.push('/booking/${activity.id}');
      },
      backgroundColor: AppColors.primary,
      foregroundColor: AppColors.onPrimary,
      icon: Icon(Icons.book_online),
      label: Text('Book Now - ${activity.formattedPrice}'),
    );
  }
}

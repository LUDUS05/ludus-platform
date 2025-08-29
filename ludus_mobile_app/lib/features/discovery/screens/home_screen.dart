import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../providers/activity_provider.dart';
import '../widgets/activity_card.dart';
import '../models/activity_model.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  final List<String> categories = [
    'All',
    'Adventure',
    'Culture',
    'Food',
    'Nature',
    'Sports',
    'Entertainment',
    'Education',
  ];

  @override
  void initState() {
    super.initState();
    // Load activities when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(activityProvider.notifier).loadActivities();
      ref.read(activityProvider.notifier).loadFeaturedActivities();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onActivityTap(ActivityModel activity) {
    // Navigate to activity details
    context.push('/activity/${activity.id}');
  }

  void _onSearchChanged(String query) {
    if (query.isEmpty) {
      ref.read(activityProvider.notifier).loadActivities();
    } else {
      ref.read(activityProvider.notifier).searchActivities(query);
    }
  }

  void _onCategorySelected(String category) {
    if (category == 'All') {
      ref.read(activityProvider.notifier).loadActivities();
    } else {
      ref.read(activityProvider.notifier).getActivitiesByCategory(category);
    }
  }

  @override
  Widget build(BuildContext context) {
    final activityState = ref.watch(activityProvider);
    final activities = activityState.activities;
    final featuredActivities = activityState.featuredActivities;
    final isLoading = activityState.isLoading;
    final error = activityState.error;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 120,
            floating: true,
            pinned: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'LUDUS',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: AppColors.onPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              centerTitle: true,
            ),
            actions: [
              IconButton(
                icon: Icon(
                  Icons.notifications_outlined,
                  color: AppColors.onPrimary,
                ),
                onPressed: () {
                  // Navigate to notifications
                },
              ),
              IconButton(
                icon: Icon(
                  Icons.person_outline,
                  color: AppColors.onPrimary,
                ),
                onPressed: () {
                  context.push('/profile');
                },
              ),
            ],
          ),

          // Search Bar
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                decoration: InputDecoration(
                  hintText: 'Search activities...',
                  prefixIcon: Icon(Icons.search, color: AppColors.onSurface.withOpacity(0.6)),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear, color: AppColors.onSurface.withOpacity(0.6)),
                          onPressed: () {
                            _searchController.clear();
                            _onSearchChanged('');
                          },
                        )
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                ),
              ),
            ),
          ),

          // Categories
          SliverToBoxAdapter(
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final category = categories[index];
                  final isSelected = activityState.selectedCategory == category || 
                                   (category == 'All' && activityState.selectedCategory == null);
                  
                  return Container(
                    margin: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(category),
                      selected: isSelected,
                      onSelected: (_) => _onCategorySelected(category),
                      backgroundColor: AppColors.surface,
                      selectedColor: AppColors.primary,
                      labelStyle: AppTextStyles.labelMedium.copyWith(
                        color: isSelected ? AppColors.onPrimary : AppColors.onSurface,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Error Message
          if (error != null)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: AppColors.error),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        error,
                        style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        ref.read(activityProvider.notifier).clearError();
                        ref.read(activityProvider.notifier).loadActivities();
                      },
                      child: Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),

          // Featured Activities
          if (featuredActivities.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Featured Activities',
                  style: AppTextStyles.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 320,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: featuredActivities.length,
                  itemBuilder: (context, index) {
                    final activity = featuredActivities[index];
                    return SizedBox(
                      width: 300,
                      child: FeaturedActivityCard(
                        activity: activity,
                        onTap: () => _onActivityTap(activity),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],

          // All Activities Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'All Activities',
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (activities.isNotEmpty)
                    Text(
                      '${activities.length} activities',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.onSurface.withOpacity(0.6),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Activities List
          if (isLoading && activities.isEmpty)
            SliverToBoxAdapter(
              child: Container(
                height: 200,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text(
                        'Loading activities...',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else if (activities.isEmpty && !isLoading)
            SliverToBoxAdapter(
              child: Container(
                height: 200,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.search_off,
                        size: 64,
                        color: AppColors.onSurface.withOpacity(0.3),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'No activities found',
                        style: AppTextStyles.titleMedium.copyWith(
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Try adjusting your search or filters',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.onSurface.withOpacity(0.4),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final activity = activities[index];
                  return ActivityCard(
                    activity: activity,
                    onTap: () => _onActivityTap(activity),
                  );
                },
                childCount: activities.length,
              ),
            ),

          // Bottom padding
          SliverToBoxAdapter(
            child: SizedBox(height: 100),
          ),
        ],
      ),
      
      // Floating Action Button
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to map view
          context.push('/map');
        },
        backgroundColor: AppColors.primary,
        child: Icon(
          Icons.map,
          color: AppColors.onPrimary,
        ),
      ),
    );
  }
}

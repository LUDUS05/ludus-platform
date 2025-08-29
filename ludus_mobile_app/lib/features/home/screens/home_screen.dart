import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../auth/providers/mock_auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(mockCurrentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('LUDUS'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Navigate to notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              // TODO: Navigate to profile
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back!',
                      style: AppTextStyles.headlineMedium.copyWith(
                        color: AppColors.onPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      user?.displayName ?? 'User',
                      style: AppTextStyles.headlineLarge.copyWith(
                        color: AppColors.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Ready to discover amazing activities?',
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.onPrimary.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Quick Actions
              Text(
                'Quick Actions',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: AppColors.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Action Cards
              Row(
                children: [
                  Expanded(
                    child: _ActionCard(
                      icon: Icons.explore,
                      title: 'Discover',
                      subtitle: 'Find activities',
                      color: AppColors.primary,
                      onTap: () {
                        // TODO: Navigate to discover
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _ActionCard(
                      icon: Icons.calendar_today,
                      title: 'My Bookings',
                      subtitle: 'View bookings',
                      color: AppColors.secondary,
                      onTap: () {
                        // TODO: Navigate to bookings
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _ActionCard(
                      icon: Icons.favorite,
                      title: 'Favorites',
                      subtitle: 'Saved activities',
                      color: AppColors.accent,
                      onTap: () {
                        // TODO: Navigate to favorites
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _ActionCard(
                      icon: Icons.location_on,
                      title: 'Nearby',
                      subtitle: 'Local activities',
                      color: AppColors.info,
                      onTap: () {
                        // TODO: Navigate to nearby
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Featured Activities
              Text(
                'Featured Activities',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: AppColors.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Featured Activity Cards
              _FeaturedActivityCard(
                title: 'Desert Safari Adventure',
                subtitle: 'Experience the thrill of dune bashing',
                image: 'assets/images/desert_safari.jpg',
                price: 'SAR 299',
                rating: 4.8,
                onTap: () {
                  // TODO: Navigate to activity details
                },
              ),
              
              const SizedBox(height: 16),
              
              _FeaturedActivityCard(
                title: 'Red Sea Diving',
                subtitle: 'Explore underwater wonders',
                image: 'assets/images/diving.jpg',
                price: 'SAR 450',
                rating: 4.9,
                onTap: () {
                  // TODO: Navigate to activity details
                },
              ),
              
              const SizedBox(height: 32),
              
              // Sign Out Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () async {
                    await ref.read(mockAuthProvider.notifier).signOut();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    side: BorderSide(color: AppColors.error),
                  ),
                  child: Text(
                    'Sign Out',
                    style: AppTextStyles.labelLarge.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppTextStyles.labelLarge.copyWith(
                color: AppColors.onSurface,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _FeaturedActivityCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String image;
  final String price;
  final double rating;
  final VoidCallback onTap;

  const _FeaturedActivityCard({
    required this.title,
    required this.subtitle,
    required this.image,
    required this.price,
    required this.rating,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Placeholder for image
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
              ),
              child: Icon(
                Icons.image,
                color: AppColors.primary,
                size: 32,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.onSurface,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          subtitle,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.onSurfaceVariant,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.star,
                              size: 16,
                              color: AppColors.ratingStar,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              rating.toString(),
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.onSurfaceVariant,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          price,
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

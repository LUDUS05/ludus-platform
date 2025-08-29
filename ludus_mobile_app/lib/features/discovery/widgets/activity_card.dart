import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/activity_model.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';

class ActivityCard extends StatelessWidget {
  final ActivityModel activity;
  final VoidCallback? onTap;
  final bool showVendor;

  const ActivityCard({
    super.key,
    required this.activity,
    this.onTap,
    this.showVendor = true,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Activity Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: activity.mainImage.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: activity.mainImage,
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
                            size: 48,
                          ),
                        ),
                      )
                    : Container(
                        color: AppColors.surface,
                        child: Icon(
                          Icons.image_not_supported,
                          color: AppColors.onSurface.withOpacity(0.5),
                          size: 48,
                        ),
                      ),
              ),
            ),
            
            // Activity Details
            Padding(
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
                          style: AppTextStyles.titleMedium.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.star,
                              size: 16,
                              color: AppColors.onPrimary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              activity.formattedRating,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.onPrimary,
                                fontWeight: FontWeight.bold,
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
                        size: 16,
                        color: AppColors.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          activity.location,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.onSurface.withOpacity(0.6),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Category and Duration
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.secondary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          activity.category,
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.secondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: AppColors.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        activity.formattedDuration,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Vendor and Price
                  Row(
                    children: [
                      if (showVendor) ...[
                        Expanded(
                          child: Text(
                            'by ${activity.vendorName}',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.onSurface.withOpacity(0.7),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        activity.formattedPrice,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Featured Activity Card (larger version)
class FeaturedActivityCard extends StatelessWidget {
  final ActivityModel activity;
  final VoidCallback? onTap;

  const FeaturedActivityCard({
    super.key,
    required this.activity,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Featured Badge
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Featured',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.onPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            
            // Activity Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: AspectRatio(
                aspectRatio: 16 / 10,
                child: activity.mainImage.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: activity.mainImage,
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
                      )
                    : Container(
                        color: AppColors.surface,
                        child: Icon(
                          Icons.image_not_supported,
                          color: AppColors.onSurface.withOpacity(0.5),
                          size: 64,
                        ),
                      ),
              ),
            ),
            
            // Activity Details
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    activity.title,
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Description
                  Text(
                    activity.description,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.onSurface.withOpacity(0.7),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Location and Rating
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(16),
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
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Price and Duration
                  Row(
                    children: [
                      Text(
                        activity.formattedPrice,
                        style: AppTextStyles.headlineSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      Icon(
                        Icons.access_time,
                        size: 18,
                        color: AppColors.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        activity.formattedDuration,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

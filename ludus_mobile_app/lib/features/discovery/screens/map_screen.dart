import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../providers/activity_provider.dart';
import '../models/activity_model.dart';
import '../widgets/activity_card.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  Position? _currentPosition;
  bool _isLoadingLocation = true;
  ActivityModel? _selectedActivity;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
    _loadActivities();
  }

  Future<void> _getCurrentLocation() async {
    try {
      // Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _isLoadingLocation = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() => _isLoadingLocation = false);
        return;
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _currentPosition = position;
        _isLoadingLocation = false;
      });

      // Load nearby activities
      ref.read(activityProvider.notifier).getNearbyActivities(
        latitude: position.latitude,
        longitude: position.longitude,
        radius: 10.0,
      );
    } catch (e) {
      setState(() => _isLoadingLocation = false);
      print('Error getting location: $e');
    }
  }

  void _loadActivities() {
    ref.read(activityProvider.notifier).loadActivities();
  }

  void _createMarkers(List<ActivityModel> activities) {
    final markers = <Marker>{};
    
    for (final activity in activities) {
      if (activity.latitude != null && activity.longitude != null) {
        markers.add(
          Marker(
            markerId: MarkerId(activity.id),
            position: LatLng(activity.latitude!, activity.longitude!),
            infoWindow: InfoWindow(
              title: activity.title,
              snippet: '${activity.formattedPrice} • ${activity.formattedDuration}',
              onTap: () => _onMarkerTapped(activity),
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          ),
        );
      }
    }

    setState(() {
      _markers = markers;
    });
  }

  void _onMarkerTapped(ActivityModel activity) {
    setState(() {
      _selectedActivity = activity;
    });
  }

  void _onActivityCardTap(ActivityModel activity) {
    context.push('/activity/${activity.id}');
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    
    if (_currentPosition != null) {
      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
            zoom: 12,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final activityState = ref.watch(activityProvider);
    final activities = activityState.activities;
    final isLoading = activityState.isLoading;

    // Create markers when activities change
    if (activities.isNotEmpty && _markers.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _createMarkers(activities);
      });
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _currentPosition != null
                  ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                  : const LatLng(24.7136, 46.6753), // Riyadh default
              zoom: 12,
            ),
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
            compassEnabled: true,
            onTap: (_) => setState(() => _selectedActivity = null),
          ),

          // App Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                left: 16,
                right: 16,
                bottom: 16,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primary.withOpacity(0.9),
                    AppColors.primary.withOpacity(0.7),
                    Colors.transparent,
                  ],
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: Icon(
                      Icons.arrow_back,
                      color: AppColors.onPrimary,
                    ),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.onPrimary.withOpacity(0.2),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.onPrimary.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.search,
                            color: AppColors.onPrimary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Search activities on map...',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.onPrimary.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    onPressed: _getCurrentLocation,
                    icon: Icon(
                      Icons.my_location,
                      color: AppColors.onPrimary,
                    ),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.onPrimary.withOpacity(0.2),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Loading Overlay
          if (_isLoadingLocation || isLoading)
            Positioned.fill(
              child: Container(
                color: Colors.black.withOpacity(0.3),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text(
                          _isLoadingLocation ? 'Getting your location...' : 'Loading activities...',
                          style: AppTextStyles.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // Selected Activity Card
          if (_selectedActivity != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Drag Handle
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.onSurface.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    SizedBox(height: 16),
                    // Activity Card
                    ActivityCard(
                      activity: _selectedActivity!,
                      onTap: () => _onActivityCardTap(_selectedActivity!),
                      showVendor: false,
                    ),
                    SizedBox(height: 16),
                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _onActivityCardTap(_selectedActivity!),
                            icon: Icon(Icons.info_outline),
                            label: Text('View Details'),
                            style: OutlinedButton.styleFrom(
                              padding: EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              // Navigate to booking
                              context.push('/booking/${_selectedActivity!.id}');
                            },
                            icon: Icon(Icons.book_online),
                            label: Text('Book Now'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: AppColors.onPrimary,
                              padding: EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

          // Activities Count Badge
          if (activities.isNotEmpty)
            Positioned(
              top: MediaQuery.of(context).padding.top + 80,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  '${activities.length} activities',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.onPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

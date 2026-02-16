// Neumorphic UI utilities

// Maps logical page names to neo routes
const PAGE_ROUTE_MAP = {
  Home: 'home',
  Search: 'search',
  Dashboard: 'dashboard',
  Profile: 'profile',
  ActivityDetails: 'activity-details',
};

export function createPageUrl(pageWithOptionalQuery) {
  if (!pageWithOptionalQuery) return '/neo/home';
  const [page, query] = pageWithOptionalQuery.split('?');
  const route = PAGE_ROUTE_MAP[page] || page.toLowerCase();
  return `/neo/${route}${query ? `?${query}` : ''}`;
}


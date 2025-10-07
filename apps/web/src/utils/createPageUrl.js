// Simple utility function to create page URLs
export const createPageUrl = (pageName) => {
  const pageUrls = {
    'Welcome': '/',
    'Registration': '/register',
    'Profile': '/profile',
    'Interests': '/interests',
    'Referral': '/referrals',
    'Dashboard': '/dashboard'
  };
  
  return pageUrls[pageName] || '/';
};

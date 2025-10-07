// Mock user for Neumorphic UI demo

let MOCK_USER = {
  email: 'demo@ludus.app',
  full_name: 'Demo User',
  interests: [],
  bio: '',
  location: '',
  followers_count: 12,
  following_count: 5,
  avatar_url: ''
};

export const User = {
  async me() {
    return { ...MOCK_USER };
  },

  async updateMyUserData(updates) {
    MOCK_USER = { ...MOCK_USER, ...updates };
    return { ...MOCK_USER };
  }
};


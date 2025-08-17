// Helper functions for secure cookie management

const setCookieOptions = (maxAge = 30 * 24 * 60 * 60 * 1000) => ({ // 30 days default
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection
  maxAge,
  path: '/'
});

const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = setCookieOptions(30 * 24 * 60 * 60 * 1000); // 30 days
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    expires: new Date(0),
    path: '/'
  });
};

const getRefreshTokenFromCookie = (req) => {
  return req.cookies.refreshToken;
};

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
  setCookieOptions
};
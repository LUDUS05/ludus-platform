// Social authentication service for verifying tokens from various providers

// Verify Google OAuth token
const verifyGoogleToken = async (token) => {
  try {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    return null;
  }
};

// Verify Facebook access token
const verifyFacebookToken = async (accessToken) => {
  try {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Facebook token verification failed:', data.error);
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.picture?.data?.url,
      emailVerified: true // Facebook email is always verified
    };
  } catch (error) {
    console.error('Facebook token verification failed:', error);
    return null;
  }
};

// Verify Apple ID token (placeholder for future implementation)
const verifyAppleToken = async (identityToken) => {
  try {
    // Apple Sign In implementation would go here
    // This would involve verifying the JWT with Apple's public keys
    console.log('Apple Sign In verification not yet implemented');
    return null;
  } catch (error) {
    console.error('Apple token verification failed:', error);
    return null;
  }
};

// Main social authentication function
const verifySocialToken = async (provider, token) => {
  switch (provider.toLowerCase()) {
    case 'google':
      return await verifyGoogleToken(token);
    case 'facebook':
      return await verifyFacebookToken(token);
    case 'apple':
      return await verifyAppleToken(token);
    default:
      throw new Error(`Unsupported social provider: ${provider}`);
  }
};

module.exports = {
  verifyGoogleToken,
  verifyFacebookToken,
  verifyAppleToken,
  verifySocialToken
};
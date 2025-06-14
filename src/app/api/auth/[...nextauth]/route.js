import NextAuth from "next-auth/next";
import SpotifyProvider from 'next-auth/providers/spotify';

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      authorization:
        'https://accounts.spotify.com/authorize?scope=user-read-email,user-read-currently-playing,user-read-playback-state,user-top-read,user-read-recently-played',
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.expires_at * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
          method: "POST",
        });

        const tokens = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token,
          access_token: tokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
          refresh_token: tokens.refresh_token ?? token.refresh_token,
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.expires_at = token.expires_at;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
});

export { handler as GET, handler as POST }; 
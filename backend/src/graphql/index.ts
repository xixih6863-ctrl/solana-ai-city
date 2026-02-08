import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { authMiddleware } from '../middleware/auth.js';

const app = express();
const httpServer = http.createServer(app);

// ============================================
// GraphQL Server Setup
// ============================================

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true,
});

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      // Get token from header
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      
      if (token) {
        try {
          const user = await authMiddleware.verifyToken(token);
          return { user };
        } catch (error) {
          return { user: null };
        }
      }
      return { user: null };
    },
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`
🏙️ Solana AI City GraphQL API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 GraphQL Server: http://localhost:4000/graphql
📍 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

export default app;

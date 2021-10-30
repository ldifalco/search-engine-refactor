const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const {authMiddleware} = require('./utils/auth.js');

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

async function runApolloServer() {
  const PORT = process.env.PORT || 3001;
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());


  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }


  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}



runApolloServer();
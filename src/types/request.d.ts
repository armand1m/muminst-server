declare namespace Express {
  interface Request {
    config: import('../config').ConfigInterface;
    clients: {
      mumble?: import('../services/chatClient').ChatClient;
      discord?: import('../services/chatClient').ChatClient;
    };
  }
}

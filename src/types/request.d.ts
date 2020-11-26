declare namespace Express {
  interface Request {
    config: import('../config').ConfigInterface;
    lockStore: import('../stores/LockStore').LockStore;
    clients: {
      mumble?: import('../services/chatClient').ChatClient;
      discord?: import('../services/chatClient').ChatClient;
      telegram?: import('../services/chatClient').ChatClient;
    };
  }
}

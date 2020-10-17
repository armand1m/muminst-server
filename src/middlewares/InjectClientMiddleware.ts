import { Request, Response, NextFunction } from 'express';
import { SupportedChatClient } from '../config';
import { ChatClient } from '../services/chatClient';

export const InjectClientMiddleware = (
  clients: Record<SupportedChatClient, ChatClient | undefined>
) => {
  const ClientMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    req.clients = clients;
    next();
  };

  return ClientMiddleware;
};

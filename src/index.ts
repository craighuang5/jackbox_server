import { Server } from "socket.io";
import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import { print } from "./utils/common";
import 'dotenv/config'
import * as IClient from "./types/IClient";
import * as IServer from "./types/IServer";
import { clientEvents } from './types/events';
import EventHandler from "./utils/eventHandler";
import { generatePrompt } from './utils/promptGenerator';

const app: Express = express(); // create express app
const httpServer = createServer(app); // create http server
const port = process.env.PORT || 3000; // port to listen on

const io = new Server(httpServer, { // create socket server
  cors: {
    origin: process.env.CLIENT_ORIGIN
  }
});

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Route to handle prompt generation
app.post('/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const responseText = await generatePrompt(prompt);
    res.send({ response: responseText });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).send({ error: errorMessage });
  }
});

io.on("connection", (socket) => {
  print('New Connection')

  // Create new game
  socket.on(clientEvents.createGame, (request: IClient.ICreateGame) => EventHandler.createGame(io, socket, request))

  // Join game
  socket.on(clientEvents.joinGame, (request: IClient.IJoinGame) => EventHandler.joinGame(io, socket, request))

  // Start game
  socket.on(clientEvents.startGame, (request: IClient.IStartGame) => EventHandler.startGame(io, socket, request))

  // Leave game
  socket.on(clientEvents.leaveGame, (request: IClient.ILeaveGame) => EventHandler.leaveGame(io, socket, request))

  // Start word select
  socket.on(clientEvents.startWordSelect, (request: IClient.IStartWordSelect) => EventHandler.startWordSelect(io, socket, request))

  // Handle submit words
  socket.on(clientEvents.submitWords, (request: IClient.ISubmitWords) => EventHandler.handleSubmitWords(io, socket, request))
});

httpServer.listen(port);
console.log(`listening on port ${port}`)
# Jackbox Server

## About

This server handles WebSocket connections using [Socket.io](https://socket.io/). Clients are able to create, join, and leave *rooms* based on provided *game IDs*. The server can then send game data to clients based on their room.

Using this approach, we can provide a "Jackbox-like" game experience to connected clients.

## Installation

1) Clone this repository from Github:

```git clone git@github.com:craighuang5/jackbox_server.git```

2) Install dependencies:

```npm install```

3) Create a file named ```.env``` by duplicating ```.env_defaults```. Please generate a personal Gemini API key for development servers, and add it to the .env file. For more information, read *Environment Variables* below.

4) Go to the following file: ```jackbox_server/src/utils/originConfig.ts``` and edit the file to the following: ```export const serverUrl = 'http://localhost:3000'```. This will host the server on your local machine on port 3000. ```https://jackbox-server.onrender.com``` is our remote server deployed on the Render service.

5) Run the server by reading *Development* or *Production* below.

## Development

For development purposes, nodemon is used for hot reloading. To start the development server:

``` npm run dev```

## Production

For a production server:

```npm run build```

```npm run start```

## Environment Variables

There are several environment variables defined in this project.

- DEBUG_LEVEL: Simplified debug level. For now, 0 will not print any debug statements, and any number greater than 0 will print them (see ```print``` function from ```/utils/common.ts```)
- CLIENT_ORIGIN: The origin we expect the client to run on.
- PORT: The port for the server to run on.
- GEMINI_API_KEY: Before running the development server, please go to https://aistudio.google.com/app/apikey, generate a personal API key, and place it here'. The deployed version of the code uses our personal Gemini API key, which is hidden.

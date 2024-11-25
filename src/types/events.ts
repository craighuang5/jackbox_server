// events emitted by the server that the client listens for
let serverEvents = {
  "roomUpdate": "roomUpdate",
  "usernameTaken": "usernameTaken",
  "connected": "connected",
  "tutorialStart": "tutorialStart",
  "error": "error",
  "wordSelectStart": "wordSelectStart",
  "drawStart": "drawStart",
  "captionStart": "captionStart",
  "voteStart": "voteStart",
  "scoreStart": "scoreStart",
  "winnerStart": "winnerStart",
  "timerUpdate": "timerUpdate",
}

// events emitted by the client that the server listens for
let clientEvents = {
  "createGame": "createGame",
  "joinGame": "joinGame",
  "startTutorial": "startTutorial",
  "leaveGame": "leaveGame",
  "startRound": "startRound",
  "submitWordSelection": "submitWordSelection",
}

export {
  serverEvents,
  clientEvents
}
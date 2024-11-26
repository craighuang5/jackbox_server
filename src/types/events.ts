// events emitted by the server that the client listens for
let serverEvents = {
  "roomUpdate": "roomUpdate",
  "usernameTaken": "usernameTaken",
  "connected": "connected",
  "error": "error",
  // Emits that notify game state change
  "tutorialStart": "tutorialStart",
  "wordSelectStart": "wordSelectStart",
  "drawStart": "drawStart",
  "captionStart": "captionStart",
  "voteStart": "voteStart",
  "scoreStart": "scoreStart",
  "winnerStart": "winnerStart",
  // Emits that notify transition state change
  "promptRevealStart": "promptRevealStart",
  // Emits that send player information
  "sendPrompt": "sendPrompt",
  // Emit that updates the timer
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
import dgram from 'dgram'; // UDP: Import the 'dgram' module instead of 'net'
import { createInterface } from 'readline';
import { processUserInput } from './commandHandler.js';
import { handleError } from './errorHandler.js';
import { showWelcomeMessage, showCommandTutorial, showGoodbyeScreen } from './messages.js';

// --- Configuration ---
// UDP: These are now the destination address for datagrams, not for a persistent connection
const HOST = '127.0.0.1';
const PORT = 3000;
const TIMEOUT_SECONDS = 5; // Waiting time for server response

// --- Initialization ---
// UDP: Create a UDP4 socket (datagram socket)
const client = dgram.createSocket('udp4');
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('\n> ');

let timeoutId = null;

// --- Stats Timeout ---
let commandsSent = 0;
let responsesReceived = 0;
let timeoutsOccurred = 0;

// --- Client Event Handlers ---
// UDP: Listen for the 'message' event, which is the equivalent of the TCP 'data' event
client.on('message', (data, rinfo) => {
  clearTimeout(timeoutId);
  responsesReceived++;

  // rinfo (remote info) contains the sender's address and port
  const serverResponse = data.toString();
  console.log(`\nResponse received from ${rinfo.address}:${rinfo.port}:`);
  try {
    const jsonResponse = JSON.parse(serverResponse);
    // Note: Checking for 'SUCCESS', assuming server sends the English version
    if (jsonResponse.status === 'SUCCESS' && Array.isArray(jsonResponse.dados)) {
      console.table(jsonResponse.dados);
    } else {
      console.log(jsonResponse);
    }
  // eslint-disable-next-line no-unused-vars
  } catch (_err) {
    console.log(serverResponse);
  }
  rl.prompt();
});

// UDP: The 'close' event fires when the socket is closed locally
client.on('close', () => {
  console.log('🔌 Client socket closed.');
  process.exit();
});

client.on('error', (err) => {
  handleError('SOCKET_ERROR', err);
  client.close();
});

// --- Readline Event Handler ---
rl.on('line', (line) => {
  const input = line.trim();
  const commandUpper = input.split(' ')[0].toUpperCase();

  if (['HELP', 'CLEAR', 'EXIT'].includes(commandUpper)) {
    if (commandUpper === 'HELP') { showCommandTutorial(); rl.prompt(); }
    if (commandUpper === 'CLEAR') { console.clear(); showWelcomeMessage(); rl.prompt(); }
    if (commandUpper === 'EXIT') {
      console.clear();
      console.log("\n---------- UDP Session Report ----------");
      console.log(`| Commands Sent:      ${commandsSent}`);
      console.log(`| Responses Received: ${responsesReceived}`);
      console.log(`| Timeouts Occurred:  ${timeoutsOccurred}`);
      console.log("--------------------------------------");
      showGoodbyeScreen();
      setTimeout(() => { client.close(); rl.close(); }, 500);
    }
    return;
  }

  const result = processUserInput(input);

  if (result.success) {
    // Using client.send() with the server address.
    const command = result.commandToSend;
    client.send(command, PORT, HOST, (err) => {
      if (err) {
        handleError('SEND_ERROR', err);
        rl.prompt();
      } else {
        commandsSent++;
        console.log(`[INFO] Command sent... awaiting response for up to ${TIMEOUT_SECONDS} seconds...`);

        timeoutId = setTimeout(() => {
          timeoutsOccurred++;
          handleError('TIMEOUT_ERROR');
          rl.prompt(); // Allows the user to try another command
        }, TIMEOUT_SECONDS * 1000);
      }
    });
  } else if (result.errorCode) {
    handleError(result.errorCode);
    rl.prompt();
  } else {
    rl.prompt();
  }
});

// --- Initial "Connection" ---
// UDP: No connection is needed. Start the prompt directly.
console.clear();
showWelcomeMessage();
rl.prompt();
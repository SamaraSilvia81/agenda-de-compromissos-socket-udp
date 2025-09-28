import dgram from 'dgram'; // UDP: Import the 'dgram' module instead of 'net'
import { createInterface } from 'readline';
import { processUserInput } from './commandHandler.js';
import { handleError } from './errorHandler.js';
import { showWelcomeMessage, showCommandTutorial, showGoodbyeScreen } from './messages.js';

// --- Configuration ---
// UDP: These are now the destination address for datagrams, not for a persistent connection
const HOST = '127.0.0.1';
const PORT = 3000;

// --- Initialization ---
// UDP: Create a UDP4 socket (datagram socket)
const client = dgram.createSocket('udp4');
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('\n> ');

// --- Client Event Handlers ---
// UDP: Listen for the 'message' event, which is the equivalent of the TCP 'data' event
client.on('message', (data, rinfo) => {
  // rinfo (remote info) contains the sender's address and port
  const serverResponse = data.toString();
  console.log(`\nResposta recebida de ${rinfo.address}:${rinfo.port}:`);
  try {
    const jsonResponse = JSON.parse(serverResponse);
    if (jsonResponse.status === 'SUCESSO' && Array.isArray(jsonResponse.dados)) {
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
  console.log('🔌 Socket do cliente fechado.');
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

  if (commandUpper === 'HELP') {
    showCommandTutorial();
    rl.prompt();
    return;
  }
  if (commandUpper === 'CLEAR') {
    showWelcomeMessage();
    rl.prompt();
    return;
  }
 if (commandUpper === 'EXIT') {
    showGoodbyeScreen();
    setTimeout(() => {
        client.close();
        rl.close();
    }, 500);
    return;
  }

  const result = processUserInput(input);

  if (result.success) {
    console.log(`[DEBUG] Command formatted: "${result.commandToSend.trim()}"`);
    client.write(result.commandToSend);
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
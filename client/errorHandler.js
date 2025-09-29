import { playTimeoutAnimationInBox } from './messages.js';

/**
 * Handles displaying standardized error messages to the user.
 * @param {string} errorCode A unique code for the error type.
 * @param {Error} [originalError=null] The original error object for debugging.
*/

export function handleError(errorCode, originalError = null, rl = null) {
  let userMessage = `❌ Unexpected error.`; // Default message

  switch (errorCode) {
    case 'INVALID_COMMAND':
      userMessage = `❌ Invalid command. Please use one of the recognized commands.`;
      break;
    case 'INVALID_ADD_FORMAT':
      userMessage = '❌ Incorrect format. Use: ADD <date> <time> <duration> "<title>" "[description]"';
      break;
    case 'INVALID_LIST_FORMAT':
      userMessage = '❌ Incorrect format. Use: LIST, LIST <date>, or LIST ALL';
      break;
    case 'INVALID_UPDATE_FORMAT':
      userMessage = '❌ Incorrect format. Use: UPDATE <id> <field> "<new_value>"';
      break;
    case 'INVALID_DELETE_FORMAT':
      userMessage = '❌ Incorrect format. Use: DELETE <id>';
      break;
    // --- ADD TO UDP ---
    case 'SEND_ERROR':
        userMessage = `❌ Error sending message to server. Check your connection.`;
        break;
    case 'TIMEOUT_ERROR': {
      const finalErrorLines = [
        'TIMEOUT: The server did not respond.',
        'Your message may have been lost.'
      ];
      playTimeoutAnimationInBox(finalErrorLines, () => {
        console.log(''); 
        console.log('[INFO] You can try another command now.'); 
        console.log(''); 
        if (rl) {
          rl.prompt();
        }
      });
       return;
    }
    case 'SOCKET_ERROR':
      userMessage = `❌ An error occurred in the client socket.`;
      break;
  }

  console.error(userMessage);
  
  if (originalError) {
    console.error(`[Debug Info]: ${originalError.message}`);
  }

  if (rl) {
    rl.prompt();
  }
}
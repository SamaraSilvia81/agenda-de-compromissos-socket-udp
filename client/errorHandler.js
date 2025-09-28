/**
 * Handles displaying standardized error messages to the user.
 * @param {string} errorCode A unique code for the error type.
 * @param {Error} [originalError=null] The original error object for debugging.
 */
export function handleError(errorCode, originalError = null) {
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
    case 'TIMEOUT_ERROR':
        userMessage = `😥 O servidor não respondeu a tempo. A mensagem pode ter se perdido.`;
        break;
    case 'SOCKET_ERROR':
        userMessage = `❌ An error occurred in the client socket.`;
        break;
  }

  console.error(userMessage);
  if (originalError) {
      console.error(`[Debug Info]: ${originalError.message}`);
  }
}
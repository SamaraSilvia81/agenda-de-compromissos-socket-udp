const validCommands = ['ADD', 'LIST', 'UPDATE', 'DELETE'];

export function processUserInput(line) {
  const input = line.trim();
  if (!input) {
    return { success: false };
  }

  const [command] = input.split(' ');
  const commandUpper = command.toUpperCase();

   if (!validCommands.includes(commandUpper)) {
    // Agora retorna um CÓDIGO de erro, não a mensagem
    return { success: false, errorCode: 'INVALID_COMMAND' };
  }

  // --- Command-specific validation ---
  switch (commandUpper) {
    case 'ADD': {
      // Regex to capture arguments, allowing for quoted title and optional quoted description.
      // Groups: 1:date, 2:time, 3:duration, 4:title, 5:description(optional)
      const addRegex = /^ADD\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+"([^"]+)"(?:\s+"([^"]+)")?$/i;
      if (!input.match(addRegex)) {
        return { success: false, errorCode: 'INVALID_ADD_FORMAT' };
      }
      break;
    }

    case 'LIST': {
      // Allows LIST, LIST <date>, or LIST ALL
      const listRegex = /^LIST(\s+[^\s]+)?$/i;
      if (!input.match(listRegex)) {
        return { success: false, errorCode: 'INVALID_LIST_FORMAT' };
      }
      break;
    }

     case 'UPDATE': {
      // Expects UPDATE <id> <field> "<new_value>"
      const updateRegex = /^UPDATE\s+(\d+)\s+([^\s"]+)\s+"([^"]+)"$/i;
      if (!input.match(updateRegex)) {
        return { success: false, errorCode: 'INVALID_UPDATE_FORMAT' };
      }
      break;
    }

   case 'DELETE': {
      // Expects DELETE followed by a number (the ID)
      const deleteRegex = /^DELETE\s+\d+$/i;
      if (!input.match(deleteRegex)) {
      return { success: false, errorCode: 'INVALID_DELETE_FORMAT' };
      }
      break;
    }
  }

  // If all checks pass, the command is valid.
  return { success: true, commandToSend: input + '\n' };
}
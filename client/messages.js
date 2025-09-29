export function showStartupAnimation(onComplete) {
  console.clear();
  const artLines = [
    '+--------------------------------------------------+',
    '|                                                   |',
    '|           [~] Initializing SOCKET-UDP...          |', 
    '|           [V] Client is ready.                    |', 
    '|           [>] Waiting for commands...             |', 
    '|                                                   |',
    '+--------------------------------------------------+',
    ''
  ];

  console.log(artLines[0]);
  console.log(artLines[1]);

  let delay = 500; 

  setTimeout(() => console.log(artLines[2]), delay);
  setTimeout(() => console.log(artLines[3]), delay += 600); 
  setTimeout(() => console.log(artLines[4]), delay += 600); 

  setTimeout(() => {
    console.log(artLines[5]);
    console.log(artLines[6]);
    console.log(artLines[7]);
    onComplete();
  }, delay += 400);
}

export function showWelcomeMessage() {
  console.log(" Course: Plataforma de Distribuição - UFPE (2025.2)");
  console.log(" Teacher: Nelson Souto (nsr@cin.ufpe.br)");
  console.log(" Authors: Samara Silvia (sssc@cin.ufpe.br)");
  console.log("          Rodolfo Marinho (armc2@cin.ufpe.br)");
  console.log("\n Title: TCP Socket Appointment Scheduler v1.0");
  console.log("\n Description:");
  console.log("   This is a command-line interface (CLI) application that acts as a");
  console.log("   client for a shared scheduling system. It communicates with a");
  console.log("   server via TCP Sockets to manage real-time events.");
  console.log("\n Available commands:");
  console.log("   - HELP         (See the full list of commands and their formats)");
  console.log("   - CLEAR        (Clear the terminal screen)");
  console.log("   - EXIT         (Exit the application)");
}

export function showCommandTutorial() {
  console.log("\n---------- Scheduler Command Guide ----------");
  console.log('\n➡️  ADD <date> <time> <duration> "<title>" "[description]"');
  console.log('    Ex: add 2025-09-26 10:00 60min "Project Meeting"');
  console.log('\n➡️  LIST <date | ALL>');
  console.log('    Ex: list 2025-09-26');
  console.log('\n➡️  UPDATE <id> <field> "<new_value>"');
  console.log('    Ex: update 42 title "Updated Meeting Title"');
  console.log('\n➡️  DELETE <id>');
  console.log('    Ex: delete 42');
  console.log("------------------------------------------------");
}

export function playTimeoutAnimationInBox(finalLines, onComplete) {

  const targetMessage = 'SERVER NOT RESPONDING';
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$*!?<>+';
  const animationDuration = 2000;
  const revealSpeed = 80;

  let intervalId;

  const drawBoxWithContent = (contentLines) => {
    const terminalWidth = process.stdout.columns || 70;
    const boxWidth = Math.min(70, terminalWidth - 4);
    const topBorder = '+' + '-'.repeat(boxWidth - 2) + '+';
    const bottomBorder = topBorder;
    const emptyLine = '|' + ' '.repeat(boxWidth - 2) + '|';
    const centerText = (text) => {
      const padding = Math.floor((boxWidth - 2 - text.length) / 2);
      const remainder = (boxWidth - 2 - text.length) % 2;
      return '|' + ' '.repeat(padding) + text + ' '.repeat(padding + remainder) + '|';
    };

    console.clear(); 
    
    const frame = [
      '\n',
      topBorder,
      emptyLine,
      ...contentLines.map(line => centerText(line)),
      emptyLine,
      bottomBorder
    ];
    
    process.stdout.write(frame.join('\n'));
  };

  const reveal = (index = 0) => {
    if (index > targetMessage.length) {
      setTimeout(() => {
        // A lógica final para desenhar a mensagem estática não muda.
        drawBoxWithContent(finalLines);
        console.log('');
        onComplete();
      }, 2000);
      return;
    }

    const revealedPart = targetMessage.substring(0, index);
    const scrambledPart = Array(targetMessage.length - index).fill(null).map(() => 
        charSet[Math.floor(Math.random() * charSet.length)]
    ).join('');
    
    drawBoxWithContent([revealedPart + scrambledPart]);
    setTimeout(() => reveal(index + 1), revealSpeed);
  };

  // REMOVIDO: O console.log inicial com vários '\n' não é mais necessário.
  // A animação começa imediatamente.
  intervalId = setInterval(() => drawBoxWithContent([' ']), 50);

  setTimeout(() => {
    clearInterval(intervalId);
    reveal();
  }, animationDuration);
}

export function showGoodbyeScreen() {
  console.log("+--------------------------------------------------+");
  console.log("|                                                  |");
  console.log("|             [!] Disconnecting...                 |");
  console.log("|           [V] Session Terminated.                |");
  console.log("|                 See you soon!                    |");
  console.log("|                                                  |");
  console.log("+--------------------------------------------------+");
}
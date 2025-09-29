const dgram = require('dgram');

class TestServer {
  constructor(port = 8080) {
    this.port = port;
    this.server = dgram.createSocket('udp4');
    this.events = [];
    this.nextId = 1;
    this.shouldCrash = false;
    this.crashAfterCommands = 0;
    this.commandCount = 0;
  }

  start() {
    this.server.on('message', (msg, rinfo) => {
      this.commandCount++;
      console.log(`[SERVER] Command ${this.commandCount} received: ${msg.toString()}`);
      
      if (this.shouldCrash && this.commandCount >= this.crashAfterCommands) {
        console.log('💥 SERVER: Simulating crash (exiting process)...');
        setTimeout(() => {
          console.log('🛑 SERVER: Server crashed!');
          process.exit(0);
        }, 100);
        return;
      }

      this.processCommand(msg.toString(), rinfo);
    });

    this.server.on('listening', () => {
      console.log(`🎯 TEST SERVER running on port ${this.port}`);
    });

    this.server.bind(this.port);
  }

  processCommand(command, rinfo) {
    const parts = command.split(' ');
    const action = parts[0].toUpperCase();
    
    let response;
    
    try {
      switch(action) {
        case 'ADD':
          response = this.addEvent(parts);
          break;
        case 'LIST':
          response = this.listEvents(parts);
          break;
        case 'UPDATE':
          response = this.updateEvent(parts);
          break;
        case 'DELETE':
          response = this.deleteEvent(parts);
          break;
        default:
          response = 'ERROR: Unknown command';
      }
    } catch (error) {
      response = `ERROR: ${error.message}`;
    }

    this.sendResponse(response, rinfo);
  }

  addEvent(parts) {
    if (parts.length < 5) return 'ERROR: Format: ADD <date> <time> <title> <duration> [description]';
    
    const event = {
      id: this.nextId++,
      date: parts[1],
      time: parts[2],
      title: parts[3],
      duration: parts[4],
      description: parts.slice(5).join(' ') || 'No description'
    };
    
    this.events.push(event);
    return `OK: Event ${event.id} added - ${event.title}`;
  }

  listEvents(parts) {
    if (parts.length < 2) return 'ERROR: Format: LIST <date>';
    
    const date = parts[1];
    const eventsOnDate = this.events.filter(e => e.date === date);
    
    if (eventsOnDate.length === 0) return 'OK: No events found for this date';
    
    return `OK: Found ${eventsOnDate.length} event(s)\n` + 
           eventsOnDate.map(e => `${e.id}: ${e.title} at ${e.time} (${e.duration}min)`).join('\n');
  }

  updateEvent(parts) {
    if (parts.length < 3) return 'ERROR: Format: UPDATE <id> <new_time>';
    
    const id = parseInt(parts[1], 10);
    const event = this.events.find(e => e.id === id);
    
    if (!event) return `ERROR: Event with ID ${id} not found`;
    
    event.time = parts[2];
    return `OK: Event ${id} updated with new time: ${parts[2]}`;
  }

  deleteEvent(parts) {
    if (parts.length < 2) return 'ERROR: Format: DELETE <id>';
    
    const id = parseInt(parts[1], 10);
    const index = this.events.findIndex(e => e.id === id);
    
    if (index === -1) return `ERROR: Event with ID ${id} not found`;
    
    this.events.splice(index, 1);
    return `OK: Event ${id} has been removed`;
  }

  sendResponse(response, rinfo) {
    this.server.send(response, rinfo.port, rinfo.address, (err) => {
      if (err) console.log('[SERVER] Error sending response:', err);
    });
  }

  setCrashAfter(commands) {
    this.shouldCrash = true;
    this.crashAfterCommands = commands;
    console.log(`⚠️  SERVER: Configured to crash after ${commands} commands.`);
  }
}

const args = process.argv.slice(2);
const server = new TestServer();

if (args.includes('--crash-after')) {
  const crashValueIndex = args.indexOf('--crash-after') + 1;
  const crashAfter = parseInt(args[crashValueIndex], 10) || 2;
  server.setCrashAfter(crashAfter);
}

server.start();
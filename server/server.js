// server/server.js

import dgram from 'dgram'; // Import the dgram module for UDP communication
import fs from 'fs';      // Import the File System module
import path from 'path';    // Import the Path module for reliable file paths

// --- Configuration ---
const PORT = 3000;
const HOST = '127.0.0.1';
const DATA_FILE = path.join(process.cwd(), 'server', 'appointments.json');

// --- In-Memory Data Store (will be loaded from file) ---
let appointments = [];
let nextAppointmentId = 1;

// --- Data Persistence Functions ---

/**
 * Loads appointments from the JSON file into memory.
 * This is called once when the server starts.
 */
function loadAppointmentsFromFile() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                appointments = parsedData;
                // Ensure nextAppointmentId is higher than any existing ID
                if (appointments.length > 0) {
                    const maxId = Math.max(...appointments.map(app => app.id));
                    nextAppointmentId = maxId + 1;
                }
                console.log(`[INFO] Successfully loaded ${appointments.length} appointments from ${DATA_FILE}`);
            }
        } else {
            console.log(`[INFO] Data file not found at ${DATA_FILE}. A new one will be created.`);
        }
    } catch (err) {
        console.error('[ERROR] Could not load data from file:', err);
        // If the file is corrupt, we start with an empty list
        appointments = [];
    }
}

/**
 * Saves the current list of appointments to the JSON file.
 * This is called after every successful modification (add, update, delete).
 */
function saveAppointmentsToFile() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2)); // Using 'null, 2' for pretty-printing the JSON
        console.log(`[INFO] Appointments saved to ${DATA_FILE}`);
    } catch (err) {
        console.error('[ERROR] Could not save data to file:', err);
    }
}

// --- Helper Function for Responses (UDP version) ---
/**
 * Sends a response back to the client's address.
 * @param {object} rinfo - Remote address information (from dgram 'message' event).
 * @param {string} status - 'SUCCESS' or 'ERROR'.
 * @param {object|array|null} data - The payload of the response.
 * @param {string} message - A descriptive message.
 */
function sendResponse(rinfo, status, data, message) {
    // The client expects 'dados', so we will use that key.
    const response = { status, dados: data, mensagem: message };
    const responseBuffer = Buffer.from(JSON.stringify(response));

    // Use server.send() to reply to the specific client address and port.
    server.send(responseBuffer, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error(`[ERROR] Failed to send response to ${rinfo.address}:${rinfo.port}`, err);
        }
    });
}


// --- Command Handlers (UDP version) ---
// Note: They now receive 'rinfo' to know where to send the response.

function handleAdd(fullCommand, rinfo) {
    const addRegex = /^ADD\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+"([^"]+)"(?:\s+"([^"]+)")?$/i;
    const match = fullCommand.match(addRegex);
    if (!match) return sendResponse(rinfo, 'ERROR', null, 'Invalid ADD command format. Use: ADD <date> <time> <duration> "<title>" "[description]"');
    const [, date, time, duration, title, description] = match;
    const newAppointment = { id: nextAppointmentId++, date, time, duration: parseInt(duration, 10), title, description: description || '' };
    appointments.push(newAppointment);
    console.log('[INFO] New appointment added:', newAppointment);
    saveAppointmentsToFile();
    sendResponse(rinfo, 'SUCCESS', newAppointment, 'Appointment added successfully.');
}

function handleList(fullCommand, rinfo) {
    const parts = fullCommand.split(' ');
    const filterDate = parts[1];
    let results = appointments;
    if (filterDate) results = appointments.filter(app => app.date === filterDate);
    if (results.length === 0) return sendResponse(rinfo, 'SUCCESS', [], 'No appointments found for the specified criteria.');
    sendResponse(rinfo, 'SUCCESS', results, `${results.length} appointment(s) found.`);
}

function handleUpdate(fullCommand, rinfo) {
    const updateRegex = /^UPDATE\s+(\d+)\s+([a-zA-Z]+)\s+"([^"]+)"$/i;
    const match = fullCommand.match(updateRegex);
    if (!match) return sendResponse(rinfo, 'ERROR', null, 'Invalid UPDATE format. Use: UPDATE <id> <field> "<new_value>"');
    const [, idStr, field, newValue] = match;
    const id = parseInt(idStr, 10);
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return sendResponse(rinfo, 'ERROR', null, `Appointment with ID ${id} not found.`);
    const updatableFields = ['date', 'time', 'duration', 'title', 'description'];
    const fieldLower = field.toLowerCase();
    if (!updatableFields.includes(fieldLower)) return sendResponse(rinfo, 'ERROR', null, `Invalid field '${field}'.`);
    appointment[fieldLower] = fieldLower === 'duration' ? parseInt(newValue, 10) : newValue;
    console.log(`[INFO] Appointment ${id} updated:`, appointment);
    saveAppointmentsToFile();
    sendResponse(rinfo, 'SUCCESS', appointment, `Appointment ${id} updated successfully.`);
}

function handleDelete(fullCommand, rinfo) {
    const deleteRegex = /^DELETE\s+(\d+)$/i;
    const match = fullCommand.match(deleteRegex);
    if (!match) return sendResponse(rinfo, 'ERROR', null, 'Invalid DELETE format. Use: DELETE <id>');
    const id = parseInt(match[1], 10);
    const appointmentIndex = appointments.findIndex(app => app.id === id);
    if (appointmentIndex === -1) return sendResponse(rinfo, 'ERROR', null, `Appointment with ID ${id} not found.`);
    const deletedAppointment = appointments.splice(appointmentIndex, 1);
    console.log(`[INFO] Appointment ${id} deleted.`);
    saveAppointmentsToFile();
    sendResponse(rinfo, 'SUCCESS', deletedAppointment[0], `Appointment ${id} deleted successfully.`);
}

// --- Main Command Router ---
function handleCommand(command, rinfo) {
    const [commandVerb] = command.split(' ');
    switch (commandVerb.toUpperCase()) {
        case 'ADD': handleAdd(command, rinfo); break;
        case 'LIST': handleList(command, rinfo); break;
        case 'UPDATE': handleUpdate(command, rinfo); break;
        case 'DELETE': handleDelete(command, rinfo); break;
        default: sendResponse(rinfo, 'ERROR', null, `Unknown command: ${commandVerb}`); break;
    }
}

// --- UDP Server Creation ---
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`[ERROR] Server error:\n${err.stack}`);
    server.close();
});

// The 'message' event is fired whenever a new datagram is received.
server.on('message', (msg, rinfo) => {
    const command = msg.toString().trim();
    if (!command) return;

    console.log(`[DATA] Received from ${rinfo.address}:${rinfo.port}: "${command}"`);
    handleCommand(command, rinfo);
});

// The 'listening' event is fired once the server is ready.
server.on('listening', () => {
    const address = server.address();
    console.log(`[INFO] UDP Scheduler Server started and listening on ${address.address}:${address.port}`);
});

// --- Start Listening ---
loadAppointmentsFromFile(); // Load data before starting
server.bind(PORT, HOST);
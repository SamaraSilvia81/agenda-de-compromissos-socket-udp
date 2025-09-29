import net from 'net';
import fs from 'fs'; // Import the File System module
import path from 'path'; // Import Path module for reliable file paths

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

// --- Helper Function for Responses (No changes here) ---
function sendResponse(socket, status, data, message) {
    const response = { status, dados: data, mensagem: message };
    socket.write(JSON.stringify(response) + '\n');
}

// --- Command Handlers (with saveAppointmentsToFile calls) ---

function handleAdd(fullCommand, socket) {
    // ... (logic for handleAdd is the same)
    const addRegex = /^ADD\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+"([^"]+)"(?:\s+"([^"]+)")?$/i;
    const match = fullCommand.match(addRegex);
    if (!match) return sendResponse(socket, 'ERRO', null, 'Invalid ADD command format. Use: ADD <date> <time> <duration> "<title>" "[description]"');
    const [, date, time, duration, title, description] = match;
    const newAppointment = { id: nextAppointmentId++, date, time, duration: parseInt(duration, 10), title, description: description || '' };
    appointments.push(newAppointment);
    console.log('[INFO] New appointment added:', newAppointment);
    saveAppointmentsToFile(); // <-- SAVE AFTER ADDING
    sendResponse(socket, 'SUCESSO', newAppointment, 'Appointment added successfully.');
}

function handleList(fullCommand, socket) {
    const parts = fullCommand.split(' ');
    const filterArgument = parts[1];

    let results = appointments;

    if (filterArgument && filterArgument.toUpperCase() !== 'ALL') {
        try {
            const [fYear, fMonth, fDay] = filterArgument.split('-').map(Number);

            results = appointments.filter(app => {
                const [aYear, aMonth, aDay] = app.date.split('-').map(Number);
                return aYear === fYear && aMonth === fMonth && aDay === fDay;
            });
        // A variável 'e' foi renomeada para '_e' para indicar que não é utilizada,
        // alinhando-se à regra "argsIgnorePattern": "^_" no arquivo eslint.config.mjs.
        } catch (_e) {
            results = [];
        }
    }

    if (results.length === 0) {
        return sendResponse(socket, 'SUCESSO', [], 'No appointments found for the specified criteria.');
    }
    sendResponse(socket, 'SUCESSO', results, `${results.length} appointment(s) found.`);
}

function handleUpdate(fullCommand, socket) {
    const updateRegex = /^UPDATE\s+(\d+)\s+([a-zA-Z]+)\s+"([^"]+)"$/i;
    const match = fullCommand.match(updateRegex);
    if (!match) return sendResponse(socket, 'ERRO', null, 'Invalid UPDATE format. Use: UPDATE <id> <field> "<new_value>"');
    const [, idStr, field, newValue] = match;
    const id = parseInt(idStr, 10);
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return sendResponse(socket, 'ERRO', null, `Appointment with ID ${id} not found.`);
    const updatableFields = ['date', 'time', 'duration', 'title', 'description'];
    const fieldLower = field.toLowerCase();
    if (!updatableFields.includes(fieldLower)) return sendResponse(socket, 'ERRO', null, `Invalid field '${field}'.`);
    appointment[fieldLower] = fieldLower === 'duration' ? parseInt(newValue, 10) : newValue;
    console.log(`[INFO] Appointment ${id} updated:`, appointment);
    saveAppointmentsToFile(); // <-- SAVE AFTER UPDATING
    sendResponse(socket, 'SUCESSO', appointment, `Appointment ${id} updated successfully.`);
}

function handleDelete(fullCommand, socket) {
    const deleteRegex = /^DELETE\s+(\d+)$/i;
    const match = fullCommand.match(deleteRegex);
    if (!match) return sendResponse(socket, 'ERRO', null, 'Invalid DELETE format. Use: DELETE <id>');
    const id = parseInt(match[1], 10);
    const appointmentIndex = appointments.findIndex(app => app.id === id);
    if (appointmentIndex === -1) return sendResponse(socket, 'ERRO', null, `Appointment with ID ${id} not found.`);
    const deletedAppointment = appointments.splice(appointmentIndex, 1);
    console.log(`[INFO] Appointment ${id} deleted.`);
    saveAppointmentsToFile(); // <-- SAVE AFTER DELETING
    sendResponse(socket, 'SUCESSO', deletedAppointment[0], `Appointment ${id} deleted successfully.`);
}

// --- Main Command Router (No changes here) ---
function handleCommand(command, socket) {
    const [commandVerb] = command.split(' ');
    switch (commandVerb.toUpperCase()) {
        case 'ADD': handleAdd(command, socket); break;
        case 'LIST': handleList(command, socket); break;
        case 'UPDATE': handleUpdate(command, socket); break;
        case 'DELETE': handleDelete(command, socket); break;
        default: sendResponse(socket, 'ERRO', null, `Unknown command: ${commandVerb}`); break;
    }
}

// --- Server Creation (No changes here) ---
const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[INFO] Client connected: ${clientId}`);
    socket.on('data', (data) => {
        const command = data.toString().trim();
        if (!command) return;
        console.log(`[DATA] Received from ${clientId}: "${command}"`);
        handleCommand(command, socket);
    });
    socket.on('close', () => { console.log(`[INFO] Client disconnected: ${clientId}`); });
    socket.on('error', (err) => { console.error(`[ERROR] Socket error from ${clientId}: ${err.message}`); });
});

// --- Start Listening ---
loadAppointmentsFromFile(); // <-- LOAD DATA BEFORE STARTING
server.listen(PORT, HOST, () => {
    console.log(`[INFO] TCP Scheduler Server started and listening on ${HOST}:${PORT}`);
});
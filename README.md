![UDP Socket Appointment Scheduler](banner.png)

# UDP Socket Appointment Scheduler
![Badge Concluído](https://img.shields.io/static/v1?label=STATUS&message=In%20Progress&color=af0421&style=for-the-badge)

This is an academic project developed for the **Plataformas de Distribuição UFPE, 2025.2** course, taught by Professor **Nelson Souto Rosa**. The objective was to adjust in a client-server application in Node.js to manage a real-time appointment schedule using **UDP sockets**, instead of TCP.

### Authors
* **Rodolfo Marinho:** `[armc@cin.ufpe.br]`
* **Samara Sabino:** `[sssc@cin.ufpe.br]`

## Description

This project is a client-server application built with Node.js that uses **UDP (User Datagram Protocol) sockets** to manage a real-time, shared appointment schedule. The server maintains a list of events, and multiple clients can connect to add, list, update, and remove appointments.

A key feature of the client is its **timeout mechanism**, which handles the unreliable nature of UDP by notifying the user if the server does not respond within a set time.

Appointment data is persisted to an `appointments.json` file on the server-side, ensuring that information is not lost between server restarts.

## Features

- **Stateless UDP Server**: Capable of handling datagrams from multiple clients.
- **Client-Side Timeout Logic**: Gracefully handles network uncertainty and potential packet loss by notifying the user if a server response isn't received.
- **CRUD Operations**: Clients can perform the four basic data operations:
    - **C**reate (Add)
    - **R**ead (List)
    - **U**pdate
    - **D**elete
- **Data Persistence**: The schedule is saved to a JSON file on the server.
- **Command-Line Interface**: The client provides an interactive prompt for sending commands.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Yarn](https://yarnpkg.com/) (or another package manager like npm)

## How to Run

1.  **Clone the Repository**
    ```sh
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install Dependencies**
    ```sh
    yarn install
    ```

3.  **Start the Server**
    Open a terminal and run the following command. The server will start listening for connections on port 3000.
    ```sh
    node server/server.js
    ```
    You will see a confirmation message: `[INFO] UDP Scheduler Server started and listening on 127.0.0.1:3000`.

4.  **Start the Client**
    Open a **new** terminal (leave the server terminal running) and run the command below.
    ```sh
    node client/client.js
    ```
    After connecting, a `>` prompt will appear, ready to receive your commands.


<div align="center">
```text
╭──────────────────────────────────────────────────╮
│                                                  │
│         [~] Initializing SOCKET-UDP...           │
│         [✓] Client is ready.                     │
│         [»] Waiting for commands...              │
│                                                  │
╰──────────────────────────────────────────────────╯
```
</div>

## Available Commands

All commands must be entered into the client terminal. Arguments containing spaces (such as title and description) must be enclosed in double quotes (`"`).

| Command | Description | Format & Example |
| :--- | :--- | :--- |
| `ADD` | Adds a new appointment to the schedule. | **Format:**<br>`ADD <date> <time> <duration_min> "<title>" "[optional_description]"`<br><br>**Example:**<br>```> ADD 2025-10-26 15:00 90 "Project Sync" "Discuss milestones"``` |
| `LIST` | Lists all appointments or filters by a specific date. | **Format:**<br>`LIST` or `LIST <date>`<br><br>**Example:**<br>```> LIST\n> LIST 2025-10-26``` |
| `UPDATE` | Updates a specific field of an existing appointment, identified by its `id`.<br><br>**Updatable fields:**<br>`date`, `time`, `duration`, `title`, `description`. | **Format:**<br>`UPDATE <id> <field> "<new_value>"`<br><br>**Example:**<br>```> UPDATE 1 title "General Project Sync Meeting"``` |
| `DELETE` | Removes an appointment from the schedule, identified by its `id`. | **Format:**<br>`DELETE <id>`<br><br>**Example:**<br>```> DELETE 2``` |

<div style="text-align: center; font-family: monospace; white-space: pre;">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&color=c92c36&width=435&lines=Thanks%20for%20your%20attention!">
  </a>
</div>
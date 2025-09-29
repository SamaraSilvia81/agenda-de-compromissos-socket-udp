// test/test_client_organized.js
const dgram = require('dgram');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');
const TestMessages = require('./messages_test');
const fs = require('fs');

class OrganizedTestClient {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
    this.serverProcess = null;
  }

  log(userId, message) {
    const timestamp = ((performance.now() - this.startTime) / 1000).toFixed(2);
    console.log(`[${timestamp}s][User ${userId}] ${message}`);
  }

  async startServer(scenario = null) {
    return new Promise((resolve) => {
      const args = (scenario === 2) ? ['--crash-after', '3'] : [];
      this.serverProcess = spawn('node', ['test_server.js', ...args]);
      
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`\n--- SERVER LOG ---\n${output}\n------------------`); 
        if (output.includes('running on port')) {
          resolve();
        }
      });
      
      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        console.error(`\n--- SERVER ERROR ---\n${output}\n--------------------`);
      });
      
      this.serverProcess.on('close', (code) => {
        console.log(`\n[SERVER] Process exited with code ${code}.`);
        this.serverProcess = null;
      });
    });
  }

  async stopServer() {
    return new Promise(resolve => {
        if (this.serverProcess) {
            this.serverProcess.on('close', () => {
                console.log('\n🛑 Server stopped normally.');
                resolve();
            });
            this.serverProcess.kill('SIGTERM');
        } else {
            resolve();
        }
    });
  }

  async executeUserTest(userId, scenario) {
    const client = dgram.createSocket('udp4');
    try {
      switch(scenario) {
        case 1:
          return await this.testScenarioNormal(userId, client);
        case 2:
          return await this.testScenarioTimeout(userId, client);
        case 3:
          return await this.testScenarioServerOff(userId, client);
      }
    } finally {
      client.close();
    }
  }

  async testScenarioNormal(userId, client) {
    this.log(userId, '🚀 Starting normal operations...');
    const steps = [];
    const commands = [
      `ADD 2024-12-01 10:${userId.toString().padStart(2, '0')}:00 User${userId}_Meeting 60 Important meeting`,
      `LIST 2024-12-01`,
      `UPDATE 1 14:${userId.toString().padStart(2, '0')}:00`,
      `DELETE 1`,
      `LIST 2024-12-01`
    ];
    for (const cmd of commands) {
      const result = await this.sendCommand(client, cmd);
      steps.push({ command: cmd, success: result.success, response: result.response || result.error });
      const status = result.success ? '✅' : '❌';
      this.log(userId, `${status} CMD: ${cmd.split(' ')[0]} -> ${result.success ? 'OK' : result.error}`);
      if (!result.success) {
        this.log(userId, '❌ Operation failed.');
        return { success: false, steps: steps };
      }
      await this.delay(200);
    }
    this.log(userId, '✅ All operations completed successfully.');
    return { success: true, steps: steps };
  }

  async testScenarioTimeout(userId, client) {
    this.log(userId, '🔄 Testing timeout behavior (server will crash)...');
    const steps = [];
    
    const cmd1 = `ADD 2024-12-02 09:00 Timeout_Test_${userId} 30 Test`;
    const result1 = await this.sendCommand(client, cmd1);
    steps.push({ command: cmd1, success: result1.success, response: result1.response || result1.error });

    if (!result1.success && result1.error === 'timeout') {
        this.log(userId, '✅ Timeout correctly detected on the first command (server was already down).');
        return { success: true, steps: steps };
    }

    if (result1.success) {
      this.log(userId, '✅ Initial command OK. Waiting for server to crash...');
      await this.delay(1500);
      const cmd2 = `LIST 2024-12-02`;
      const result2 = await this.sendCommand(client, cmd2);
      steps.push({ command: cmd2, success: result2.success, response: result2.response || result2.error });
      if (!result2.success && result2.error === 'timeout') {
        this.log(userId, '✅ Timeout correctly detected after server crash.');
        return { success: true, steps: steps };
      }
    }
    
    this.log(userId, '❌ Unexpected behavior in timeout test.');
    return { success: false, steps: steps, error: 'Unexpected behavior in timeout scenario.' };
  }

  async testScenarioServerOff(userId, client) {
    this.log(userId, '❌ Testing offline server...');
    const steps = [];
    const cmd = `LIST 2024-12-03`;
    const result = await this.sendCommand(client, cmd);
    steps.push({ command: cmd, success: result.success, response: result.response || result.error });

    if (!result.success && result.error === 'timeout') {
      this.log(userId, '✅ Correctly timed out with an offline server.');
      return { success: true, steps: steps };
    } else {
      return { success: false, steps: steps, error: 'Did not time out as expected with offline server.' };
    }
  }

  async sendCommand(client, command) {
    return new Promise((resolve) => {
      const message = Buffer.from(command);
      client.send(message, 8080, 'localhost', (err) => {
        if (err) {
          resolve({ success: false, error: err.message });
          return;
        }
      });

      const timeout = setTimeout(() => {
        client.removeAllListeners('message');
        resolve({ success: false, error: 'timeout' });
      }, 3000);

      client.once('message', (msg) => {
        clearTimeout(timeout);
        resolve({ success: true, response: msg.toString() });
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ALTERADO: A mensagem de "Preparing next scenario..." foi REMOVIDA daqui
  async runScenario(scenario, userStart, userCount) {
    await new Promise(resolve => {
      TestMessages.showScenarioAnimation(scenario, resolve);
    });

    if (scenario !== 3) {
      await this.startServer(scenario);
    }

    await this.delay(100); 
    console.log(`\n👥 Executing for ${userCount} users...`);

    const userPromises = [];
    for (let i = userStart; i < userStart + userCount; i++) {
      userPromises.push(
        this.executeUserTest(i, scenario).then(result => {
          this.results.push({ userId: i, scenario: scenario, ...result });
        })
      );
    }

    await Promise.all(userPromises);

    if (scenario === 1) {
      await this.stopServer();
    }

    TestMessages.showScenarioReport(scenario, this.results);
    
    // As linhas abaixo foram removidas desta função
    // console.log('\n\n⏳ Preparing next scenario...');
    // await this.delay(3000);
  }
}

function generateJsonReport(client) {
    const endTime = performance.now();
    const duration = ((endTime - client.startTime) / 1000).toFixed(2);
    const totalTests = client.results.length;
    const totalSuccess = client.results.filter(r => r.success).length;
    const totalFailures = totalTests - totalSuccess;

    const descriptions = { 1: 'Normal', 2: 'Timeout', 3: 'Offline' };

    const report = {
        reportMetadata: {
            testDate: new Date().toISOString(),
            totalDuration: `${duration} seconds`
        },
        overallStats: {
            totalTests,
            totalSuccess,
            totalFailures,
            overallSuccessRate: `${totalTests > 0 ? (totalSuccess / totalTests * 100).toFixed(1) : '0.0'}%`
        },
        scenarioSummary: [1, 2, 3].map(id => {
            const scenarioResults = client.results.filter(r => r.scenario === id);
            const successCount = scenarioResults.filter(r => r.success).length;
            return {
                scenario: id,
                description: descriptions[id],
                status: scenarioResults.length === successCount ? '✅ PASSED' : '⚠️ FAILED',
                userCount: scenarioResults.length,
                successCount: successCount
            }
        }),
        detailedResults: client.results.map(({ userId, scenario, success, error, steps }) => ({
            userId, 
            scenario, 
            success, 
            error: error || null,
            steps: steps || []
        }))
    };

    try {
        fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
        console.log('\n💾 JSON report successfully generated: report.json');
    } catch (err) {
        console.error('\n❌ Error generating JSON report:', err);
    }
}

// ALTERADO: A mensagem de "Preparing next scenario..." agora é controlada AQUI
async function runOrganizedTests() {
  const client = new OrganizedTestClient();
  
  console.log('\n📝 CONCURRENCY TESTING SYSTEM - UDP AGENDA');
  console.log('Starting execution of 30 users across 3 scenarios...\n');
  
  await client.delay(1000);

  try {
    await client.runScenario(1, 1, 10);
    
    console.log('\n\n⏳ Preparing next scenario...');
    await client.delay(3000);

    await client.runScenario(2, 11, 10);

    console.log('\n\n⏳ Preparing next scenario...');
    await client.delay(3000);

    await client.runScenario(3, 21, 10);

    // Nenhuma mensagem aqui, vai direto para o relatório final
    
    TestMessages.showFinalSummary(client.results);
    generateJsonReport(client);

  } catch (error) {
    console.error('❌ A critical error occurred during test execution:', error);
  }
}

runOrganizedTests().catch(console.error);
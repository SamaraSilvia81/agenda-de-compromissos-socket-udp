class TestMessages {
  static showScenarioAnimation(scenario, onComplete) {
    const scenarios = {
      1: {
        title: '✨ SCENARIO 1: 10 NORMAL USERS - STABLE SERVER',
        art: [
          '┌────────────────────────────────────────────────────────┐',
          '│                                                        │',
          '│           [~] Starting Normal Tests...                 │',
          '│           [✓] Server Stable                            │',
          '│           [→] 10 Concurrent Users                      │',
          '│           [★] Operations: ADD, LIST, UPDATE, DELETE    │',
          '│                                                        │',
          '└────────────────────────────────────────────────────────┘',
        ]
      },
      2: {
        title: '✨ SCENARIO 2: 10 USERS - TIMEOUT (SERVER WILL CRASH)',
        art: [
          '┌──────────────────────────────────────────────────┐',
          '│                                                  │',
          '│           [~] Simulating Crash...                │',
          '│           [⚠] Server Will Crash                  │',
          '│           [⏱] Testing Timeouts...                │',
          '│           [🔄] Failure Recovery Expected         │',
          '│                                                  │',
          '└──────────────────────────────────────────────────┘',
        ]
      },
      3: {
        title: '✨ SCENARIO 3: 10 USERS - SERVER OFFLINE',
        art: [
          '┌──────────────────────────────────────────────────┐',
          '│                                                  │',
          '│           [~] Server Offline...                  │',
          '│           [❌] Connection Unavailable            │',
          '│           [💡] Testing Client Resilience...      │',
          '│           [⚡] Expected Timeouts                 │',
          '│                                                  │',
          '└──────────────────────────────────────────────────┘',
        ]
      }
    };

    const current = scenarios[scenario];
    if (!current) {
      onComplete();
      return;
    }

    console.log(`\n${current.title}`);
    console.log(current.art.join('\n'));

    setTimeout(() => {
      console.log('');
      onComplete();
    }, 1200);
  }

  static showScenarioReport(scenario, results) {
    const scenarioResults = results.filter(r => r.scenario === scenario);
    
    console.log(`\n📝 SCENARIO ${scenario} REPORT`);
    
    const reportData = scenarioResults.map(result => ({
      'User ID': result.userId,
      'Status': result.success ? '✅ PASSED' : '⚠️ FAILED',
      'Details': result.success ? 'OK' : result.error || 'Unknown error'
    }));

    console.table(reportData);

    const total = scenarioResults.length;
    const success = scenarioResults.filter(r => r.success).length;
    const failures = total - success;
    const successRate = total > 0 ? `${((success / total) * 100).toFixed(1)}%` : '0.0%';

    const summaryData = [
        { 'Metric': 'Users Tested', 'Value': total },
        { 'Metric': 'Successful Tests', 'Value': success },
        { 'Metric': 'Failed Tests', 'Value': failures },
        { 'Metric': 'Success Rate', 'Value': successRate }
    ];

    console.log('\n--- Scenario Summary ---');
    console.table(summaryData);

    if (failures === 0) {
        console.log('\n✅ ALL TESTS PASSED IN THIS SCENARIO!\n');
    }
  }

  static showFinalSummary(results) {
    console.log('\n📝 FINAL TEST SUMMARY UDP AGENDA');
    
    const summaryData = [
      {
        Scenario: '1 - Normal',
        Users: results.filter(r => r.scenario === 1).length,
        Success: results.filter(r => r.scenario === 1 && r.success).length,
        Failures: results.filter(r => r.scenario === 1 && !r.success).length,
        Status: results.filter(r => r.scenario === 1 && !r.success).length === 0 ? '✅ PASSED' : '⚠️ FAILED'
      },
      {
        Scenario: '2 - Timeout',
        Users: results.filter(r => r.scenario === 2).length,
        Success: results.filter(r => r.scenario === 2 && r.success).length,
        Failures: results.filter(r => r.scenario === 2 && !r.success).length,
        Status: results.filter(r => r.scenario === 2 && !r.success).length === 0 ? '✅ PASSED' : '⚠️ FAILED'
      },
      {
        Scenario: '3 - Offline',
        Users: results.filter(r => r.scenario === 3).length,
        Success: results.filter(r => r.scenario === 3 && r.success).length,
        Failures: results.filter(r => r.scenario === 3 && !r.success).length,
        Status: results.filter(r => r.scenario === 3 && !r.success).length === 0 ? '✅ PASSED' : '⚠️ FAILED'
      }
    ];

    console.table(summaryData);

    const totalTests = results.length;
    const totalSuccess = results.filter(r => r.success).length;
    const successRate = totalTests > 0 ? `${((totalSuccess / totalTests) * 100).toFixed(1)}%` : '0.0%';

    const overallStatsData = [
        { 'Statistic': 'Total Tests Run', 'Value': totalTests },
        { 'Statistic': 'Total Successful Tests', 'Value': totalSuccess },
        { 'Statistic': 'Overall Success Rate', 'Value': successRate }
    ];

    console.log("\n--- Overall Statistics ---");
    console.table(overallStatsData);

    if (totalTests - totalSuccess === 0) {
      console.log('\n🎉 ALL TESTS PASSED! CONCURRENT SYSTEM VALIDATED!');
    } else {
      console.log(`\n⚠️ ${totalTests - totalSuccess} TESTS FAILED - CHECK IMPLEMENTATION`);
    }
  }
}

module.exports = TestMessages;
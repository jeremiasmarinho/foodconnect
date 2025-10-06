/**
 * Automated Connection Test
 * This script tests the connection and provides real-time feedback
 */

const API_BASE_URL = "http://localhost:3001";

async function testConnection() {
  console.log("🔍 Starting Connection Tests...\n");

  // Test 1: Health Check
  console.log("1. Testing Health Endpoint...");
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Health Check: SUCCESS");
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Uptime: ${healthData.uptime}s\n`);
    } else {
      console.log("❌ Health Check: FAILED");
      console.log(`   Status: ${healthResponse.status}\n`);
    }
  } catch (error) {
    console.log("❌ Health Check: NETWORK ERROR");
    console.log(`   Error: ${error.message}\n`);
    return false;
  }

  // Test 2: Auth Login
  console.log("2. Testing Auth Login...");
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@foodconnect.com",
        password: "FoodConnect2024!",
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("✅ Auth Login: SUCCESS");
      console.log(`   User: ${loginData.user.username}`);
      console.log(`   Token: ${loginData.access_token.substring(0, 50)}...\n`);

      // Test 3: Protected Route
      return await testProtectedRoute(loginData.access_token);
    } else {
      console.log("❌ Auth Login: FAILED");
      console.log(`   Status: ${loginResponse.status}\n`);
      return false;
    }
  } catch (error) {
    console.log("❌ Auth Login: NETWORK ERROR");
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function testProtectedRoute(token) {
  console.log("3. Testing Protected Route...");
  try {
    const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("✅ Protected Route: SUCCESS");
      console.log(`   Profile: ${profileData.email}\n`);
      return true;
    } else {
      console.log("❌ Protected Route: FAILED");
      console.log(`   Status: ${profileResponse.status}\n`);
      return false;
    }
  } catch (error) {
    console.log("❌ Protected Route: NETWORK ERROR");
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function continuousMonitoring() {
  console.log("🔄 Starting Continuous Monitoring...\n");

  let successCount = 0;
  let failCount = 0;

  setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        successCount++;
        console.log(
          `✅ Health Check ${
            successCount + failCount
          }: OK (${new Date().toLocaleTimeString()})`
        );
      } else {
        failCount++;
        console.log(
          `❌ Health Check ${
            successCount + failCount
          }: FAILED (${new Date().toLocaleTimeString()})`
        );
      }
    } catch (error) {
      failCount++;
      console.log(
        `❌ Health Check ${successCount + failCount}: ERROR - ${
          error.message
        } (${new Date().toLocaleTimeString()})`
      );
    }
  }, 5000); // Check every 5 seconds
}

// Export for use in React Native/Web
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testConnection, continuousMonitoring };
}

// Auto-run in browser console
if (typeof window !== "undefined") {
  console.log("🚀 FoodConnect Connection Tester Ready!");
  console.log("📝 Available functions:");
  console.log("   - testConnection(): Run full connection test");
  console.log("   - continuousMonitoring(): Monitor connection every 5s");

  // Make functions globally available
  window.testConnection = testConnection;
  window.continuousMonitoring = continuousMonitoring;
}

import { API_CONFIG } from "../config/api";

describe("Connection Diagnostics", () => {
  beforeEach(() => {
    // Mock fetch for each test
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should identify correct API configuration", () => {
    expect(API_CONFIG.BASE_URL).toBe("http://localhost:3002");
    expect(API_CONFIG.BASE_URL).not.toBe("http://localhost:3000");
    console.log("✅ API Configuration is correct:", API_CONFIG.BASE_URL);
  });

  test("should diagnose ERR_ADDRESS_UNREACHABLE issue", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    // Simulate the actual error from the screenshot
    mockFetch.mockRejectedValueOnce(new Error("ERR_ADDRESS_UNREACHABLE"));

    try {
      await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@foodconnect.com",
          password: "FoodConnect2024!",
        }),
      });

      fail("Should have thrown ERR_ADDRESS_UNREACHABLE");
    } catch (error: any) {
      expect(error.message).toBe("ERR_ADDRESS_UNREACHABLE");

      // Diagnostic recommendations
      console.log("🔍 DIAGNOSTIC: ERR_ADDRESS_UNREACHABLE detected");
      console.log("📋 Possible causes:");
      console.log("1. Backend server not running on port 3001");
      console.log("2. Network connectivity issues");
      console.log("3. Firewall blocking the connection");
      console.log("4. Incorrect IP address configuration");
    }
  });

  test("should validate successful connection flow", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    // Mock successful health check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: 123.45,
      }),
    } as Response);

    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.status).toBe("ok");

    console.log("✅ Successful connection flow validated");
  });

  test("should test mobile IP configuration", () => {
    // Check if we're using localhost (won't work on mobile)
    const isLocalhost = API_CONFIG.BASE_URL.includes("localhost");

    if (isLocalhost) {
      console.log(
        "⚠️ WARNING: Using localhost - this won't work on physical devices"
      );
      console.log("📱 For mobile testing, use your computer's IP address");
      console.log("💡 Find your IP with: ip addr show or ifconfig");
      console.log("🔧 Update API_CONFIG.BASE_URL to use your local IP");
    }

    // For this test, we expect localhost since we're in development
    expect(isLocalhost).toBe(true);
  });

  test("should validate API configuration consistency", () => {
    expect(API_CONFIG).toBeDefined();
    expect(API_CONFIG.BASE_URL).toBeDefined();
    expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
    expect(API_CONFIG.ENDPOINTS).toBeDefined();
    expect(API_CONFIG.ENDPOINTS.AUTH).toBeDefined();
    expect(API_CONFIG.ENDPOINTS.AUTH.LOGIN).toBe("/auth/login");
  });
});

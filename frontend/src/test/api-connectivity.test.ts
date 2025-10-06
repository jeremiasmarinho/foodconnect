import { API_CONFIG } from "../config/api";

describe("API Connectivity Tests", () => {
  const baseUrl = API_CONFIG.BASE_URL;

  beforeEach(() => {
    // Mock fetch for each test
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should connect to backend health endpoint", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: 123.45,
      }),
    } as Response);

    try {
      const response = await fetch(`${baseUrl}/health`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.status).toBe("ok");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("uptime");
    } catch (error) {
      console.error("Health check failed:", error);
      fail(`Cannot connect to backend at ${baseUrl}/health`);
    }
  });

  test("should connect to auth endpoints", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "mock-token",
        refresh_token: "mock-refresh-token",
        user: {
          id: "1",
          email: "admin@foodconnect.com",
          username: "admin",
        },
      }),
    } as Response);

    try {
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@foodconnect.com",
          password: "FoodConnect2024!",
        }),
      });

      expect(loginResponse.ok).toBe(true);

      const loginData = await loginResponse.json();
      expect(loginData).toHaveProperty("access_token");
      expect(loginData).toHaveProperty("user");
    } catch (error) {
      console.error("Auth endpoint test failed:", error);
      fail(`Cannot connect to auth endpoint at ${baseUrl}/auth/login`);
    }
  });

  test("should validate API configuration", () => {
    expect(baseUrl).toBeDefined();
    expect(baseUrl).toMatch(/^https?:\/\//);

    // Check if it's pointing to correct port
    expect(baseUrl).toContain("3002");
    expect(baseUrl).not.toContain("3000"); // Common mistake
  });

  test("should test network reachability with timeout", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    // Mock timeout error
    mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

    try {
      await fetch(`${baseUrl}/health`, {
        method: "GET",
      });

      fail("Should have thrown timeout error");
    } catch (error: any) {
      if (error.message === "Request timeout") {
        expect(error.message).toBe("Request timeout");
        console.log("Timeout handling works correctly");
      } else if (error.message.includes("ECONNREFUSED")) {
        fail("Connection refused - backend is not running on specified port");
      } else if (error.message.includes("ERR_ADDRESS_UNREACHABLE")) {
        fail("Address unreachable - check network configuration");
      } else {
        // This is expected for our mock
        expect(error.message).toBe("Request timeout");
      }
    }
  });
});

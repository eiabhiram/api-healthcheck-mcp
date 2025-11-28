#!/usr/bin/env node

/**
 * MCP Server for API Health Checking
 * Provides tools to check if the GET localhost:8080/api/ticket endpoint is up or down
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Interface for API health check result
 */
interface HealthCheckResult {
  status: "up" | "down";
  responseTime?: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

/**
 * Check the health of the API endpoint
 */
async function checkApiHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch("http://localhost:8080/api/ticket", {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "MCP-API-Health-Checker/1.0"
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      status: response.ok ? "up" : "down",
      responseTime,
      statusCode: response.status,
      timestamp
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = "Unknown error";
    if (error.name === "AbortError") {
      errorMessage = "Request timeout (>10s)";
    } else if (error.code === "ECONNREFUSED") {
      errorMessage = "Connection refused - server not running";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Host not found";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: "down",
      responseTime,
      error: errorMessage,
      timestamp
    };
  }
}

/**
 * Format the health check result for display
 */
function formatHealthResult(result: HealthCheckResult): string {
  const statusIcon = result.status === "up" ? "✅" : "❌";
  const statusText = result.status.toUpperCase();
  
  let output = `${statusIcon} API Status: ${statusText}\n`;
  output += `🕒 Checked at: ${result.timestamp}\n`;
  
  if (result.responseTime !== undefined) {
    output += `⏱️ Response time: ${result.responseTime}ms\n`;
  }
  
  if (result.statusCode !== undefined) {
    output += `📊 HTTP Status: ${result.statusCode}\n`;
  }
  
  if (result.error) {
    output += `❗ Error: ${result.error}\n`;
  }
  
  return output;
}

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: "api-health-check-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "check_api_health",
          description: "Check if the GET localhost:8080/api/ticket endpoint is up or down",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;

    if (name === "check_api_health") {
      try {
        const result = await checkApiHealth();
        const formattedResult = formatHealthResult(result);
        
        return {
          content: [
            {
              type: "text",
              text: formattedResult,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to check API health: ${errorMessage}`,
            },
          ],
        };
      }
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

/**
 * Main function to start the MCP server
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  // Log to stderr (not stdout to avoid interfering with MCP protocol)
  console.error("API Health Check MCP Server running on stdio");
  console.error("Ready to check GET localhost:8080/api/ticket");
}

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
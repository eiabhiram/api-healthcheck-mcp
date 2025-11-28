# API Health Check MCP Server

This Model Context Protocol (MCP) server provides tools to check the health status of API endpoints. Specifically designed to monitor the `GET localhost:8080/api/ticket` endpoint.

## Features

- **Health Check Tool**: Checks if the API endpoint is up or down
- **Response Time Monitoring**: Measures and reports API response times
- **Error Handling**: Provides detailed error information when the API is unreachable
- **Timeout Protection**: Automatically times out requests after 10 seconds
- **Formatted Output**: Returns easy-to-read status reports with icons and timestamps

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### With Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "api-health-check": {
      "command": "node",
      "args": ["C:/Project Workspace/MCP/build/index.js"]
    }
  }
}
```

### Development

- `npm run build` - Build the TypeScript source
- `npm run watch` - Watch for changes and rebuild automatically
- `npm start` - Run the compiled server

## Tools Available

### `check_api_health`

Checks the health of the `GET localhost:8080/api/ticket` endpoint.

**Parameters**: None

**Returns**: 
- API status (up/down)
- Response time in milliseconds
- HTTP status code (if successful)
- Error details (if failed)
- Timestamp of the check

**Example Output**:
```
✅ API Status: UP
🕒 Checked at: 2024-01-15T10:30:45.123Z
⏱️ Response time: 150ms
📊 HTTP Status: 200
```

## Error Handling

The server handles various error conditions:

- **Connection Refused**: When the target server is not running
- **Timeout**: When requests take longer than 10 seconds
- **Host Not Found**: When localhost cannot be resolved
- **HTTP Errors**: When the server returns non-200 status codes

## Development

This server is built using:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- TypeScript
- Node.js Fetch API

## License

MIT
# Serra Dashboard API Documentation

## REST API Endpoints

### Command Processing

#### Process Command
- **Endpoint**: `POST /api/command`
- **Description**: Process a text command and get AI responses and dashboard updates
- **Request Body**:
  ```json
  {
    "text": "string" // The command text to process
  }
  ```
- **Response**:
  ```json
  {
    "messages": [], // Array of chat messages
    "updates": [] // Array of dashboard updates
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Command text is missing
  - `500 Internal Server Error`: Server processing error

### Response Management

#### Get Pending Responses
- **Endpoint**: `GET /api/responses/pending`
- **Description**: Get a list of trace IDs for pending responses
- **Response**:
  ```json
  {
    "pendingResponses": ["string"] // Array of trace IDs
  }
  ```
- **Error Response**:
  - `500 Internal Server Error`: Server processing error

#### Provide Response for Trace ID
- **Endpoint**: `POST /api/responses/:traceId`
- **Description**: Provide a response for a specific trace ID
- **URL Parameters**:
  - `traceId`: The trace ID of the pending response
- **Request Body**:
  ```json
  {
    "response": "string" // The response content
  }
  ```
- **Response**:
  ```json
  {
    "message": "Response provided successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Response content is missing
  - `404 Not Found`: No pending response found for the trace ID
  - `500 Internal Server Error`: Server processing error

#### Provide Response for Last Question
- **Endpoint**: `POST /api/responses/last`
- **Description**: Provide a response for the most recent pending question
- **Request Body**:
  ```json
  {
    "response": "string" // The response content
  }
  ```
- **Response**:
  ```json
  {
    "message": "Response provided successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Response content is missing
  - `404 Not Found`: No pending questions to respond to
  - `500 Internal Server Error`: Server processing error

## Standard Elements Library

### Input Elements

#### Number Input
```javascript
{
  id: "my-number",
  type: "number-input",
  label: "Enter Number",
  value: 0,
  relationships: [] // Optional: IDs of related elements
}
```
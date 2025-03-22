<template>
  <div class="ajax-data">
    <!-- Background animation -->
    <ul class="circles">
      <li v-for="i in 10" :key="i"></li>
    </ul>

    <div class="main-container glass">
      <!-- Back to Dashboard button spostato qui, in alto a sinistra -->
      <div class="back-to-dashboard">
        <router-link to="/dashboard-page" class="back-button">
          <span class="back-icon">←</span> Torna alla Dashboard
        </router-link>
      </div>

      <h1>Serenity API Documentation</h1>

      <div class="api-section">
        <h2>API Overview</h2>
        <p>
          A RESTful authentication API with user management and admin
          capabilities.
        </p>
        <div class="version-info">
          <span class="badge">Version: 1.0.0</span>
          <span class="badge">Base URL: /api</span>
        </div>
      </div>

      <div class="endpoints">
        <!-- Server Status -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('status')">
            <div class="method get">GET</div>
            <div class="path">/status</div>
            <div class="description">Check API status</div>
            <div class="toggle-icon" :class="{ open: openEndpoints.status }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.status">
            <div class="detail-section">
              <h4>Response</h4>
              <pre class="code-block">
  {
    "status": "ok",
    "version": "1.0.0",
    "timestamp": "2025-03-22T12:34:56.789Z"
  }</pre
              >
            </div>
          </div>
        </div>

        <!-- User Registration -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('register')">
            <div class="method post">POST</div>
            <div class="path">/users</div>
            <div class="description">Register a new user</div>
            <div class="toggle-icon" :class="{ open: openEndpoints.register }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.register">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
  {
    "name": "string", // Required
    "email": "string", // Required, valid email format
    "password": "string" // Required
  }</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">201 Created</div>
                <pre class="code-block">
  {
    "_id": "string",
    "name": "string",
    "email": "string",
    "isAdmin": false,
    "authProvider": "local",
    "createdAt": "string"
  }</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
  {
    "message": "Name, Email, and Password are required",
    "missing": {
      "name": boolean,
      "email": boolean,
      "password": boolean
    }
  }</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
  {
    "message": "Invalid email format"
  }</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
  {
    "message": "Registration failed. Email already exists."
  }</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- User Login -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('login')">
            <div class="method post">POST</div>
            <div class="path">/login</div>
            <div class="description">Authenticate a user</div>
            <div class="toggle-icon" :class="{ open: openEndpoints.login }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.login">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
  {
    "email": "string", // Required
    "password": "string" // Required
  }</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
  {
    "_id": "string",
    "name": "string",
    "email": "string",
    "isAdmin": boolean,
    "authProvider": "string",
    "createdAt": "string"
  }</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
  {
    "message": "Email and password are required"
  }</pre
                >
              </div>
              <div class="response">
                <div class="status error">401 Unauthorized</div>
                <pre class="code-block">
  {
    "message": "Invalid email or password"
  }</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Get All Users -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('getUsers')">
            <div class="method get">GET</div>
            <div class="path">/users</div>
            <div class="description">
              Retrieve all users (passwords excluded)
            </div>
            <div class="toggle-icon" :class="{ open: openEndpoints.getUsers }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.getUsers">
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
  [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "isAdmin": boolean,
      "authProvider": "string",
      "createdAt": "string"
    }
  ]</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Get User by ID -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('getUserById')">
            <div class="method get">GET</div>
            <div class="path">/users/:id</div>
            <div class="description">Retrieve a specific user by ID</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.getUserById }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.getUserById">
            <div class="detail-section">
              <h4>Path Parameters</h4>
              <table class="params-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>id</td>
                    <td>string</td>
                    <td>User's unique identifier</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "isAdmin": boolean,
  "authProvider": "string",
  "createdAt": "string"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">404 Not Found</div>
                <pre class="code-block">
{
  "message": "User not found"
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Login -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('adminLogin')">
            <div class="method post">POST</div>
            <div class="path">/admin/login</div>
            <div class="description">Authenticate as an administrator</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.adminLogin }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.adminLogin">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
{
  "email": "string", // Required
  "password": "string" // Required
}</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
{
  "message": "Admin login successful",
  "admin": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "isAdmin": true
  },
  "adminToken": "string"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
{
  "message": "Email and password are required"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">401 Unauthorized</div>
                <pre class="code-block">
{
  "message": "Invalid admin credentials"
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Get All Users -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('adminGetUsers')">
            <div class="method post">POST</div>
            <div class="path">/admin/users</div>
            <div class="description">
              Retrieve all users (admin access, includes passwords)
            </div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.adminGetUsers }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.adminGetUsers">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
{
  "adminEmail": "string", // Required
  "adminPassword": "string", // Required
  "adminToken": "string" // Required
}</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
[
  {
    "_id": "string",
    "name": "string",
    "email": "string",
    "password": "string",
    "isAdmin": boolean,
    "authProvider": "string",
    "createdAt": "string"
  }
]</pre
                >
              </div>
              <div class="response">
                <div class="status error">401 Unauthorized</div>
                <pre class="code-block">
{
  "message": "Admin authentication required"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">403 Forbidden</div>
                <pre class="code-block">
{
  "message": "Admin access denied"
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Delete User -->
        <div class="endpoint-card glass">
          <div
            class="endpoint-header"
            @click="toggleEndpoint('adminDeleteUser')"
          >
            <div class="method post">POST</div>
            <div class="path">/admin/users/delete/:id</div>
            <div class="description">Delete a user (admin access)</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.adminDeleteUser }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.adminDeleteUser">
            <div class="detail-section">
              <h4>Path Parameters</h4>
              <table class="params-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>id</td>
                    <td>string</td>
                    <td>User's unique identifier to delete</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
{
  "adminEmail": "string", // Required
  "adminPassword": "string", // Required
  "adminToken": "string" // Required
}</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
{
  "message": "User deleted successfully"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
{
  "message": "Cannot delete yourself"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">401 Unauthorized</div>
                <pre class="code-block">
{
  "message": "Admin authentication required"
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">404 Not Found</div>
                <pre class="code-block">
{
  "message": "User not found"
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Debug Endpoint -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('debug')">
            <div class="method get">GET</div>
            <div class="path">/debug</div>
            <div class="description">Debug information about the API</div>
            <div class="toggle-icon" :class="{ open: openEndpoints.debug }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.debug">
            <div class="detail-section">
              <h4>Response</h4>
              <pre class="code-block">
{
  "message": "Debug endpoint working",
  "timestamp": "2025-03-22T12:34:56.789Z",
  "environment": "development",
  "headers": { ... },
  "googleClientId": "Configured"
}</pre
              >
            </div>
          </div>
        </div>

        <!-- Google OAuth Authentication -->
        <div class="endpoint-card glass special">
          <div class="endpoint-header" @click="toggleEndpoint('googleAuth')">
            <div class="method special">OAUTH</div>
            <div class="path">Google Authentication</div>
            <div class="description">Google OAuth Authentication Flow</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.googleAuth }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.googleAuth">
            <div class="detail-section">
              <h4>Overview</h4>
              <p>
                The API supports Google OAuth authentication using the Google
                Auth Library. The client application should implement Google
                Sign-In and send the ID token to the server for verification.
              </p>
            </div>
            <div class="detail-section">
              <h4>Configuration</h4>
              <p>
                Server uses the <code>GOOGLE_CLIENT_ID</code> environment
                variable for OAuth verification.
              </p>
              <p>The OAuth client is initialized with:</p>
              <pre class="code-block">
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);</pre
              >
            </div>
            <div class="detail-section">
              <h4>Token Verification</h4>
              <p>The server verifies Google tokens using:</p>
              <pre class="code-block">
async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  return {
    googleId: payload['sub'],
    email: payload['email'],
    name: payload['name'],
    picture: payload['picture'],
    verified: payload['email_verified']
  };
}</pre
              >
            </div>
          </div>
        </div>

        <!-- Data Store -->
        <div class="endpoint-card glass special">
          <div class="endpoint-header" @click="toggleEndpoint('dataStore')">
            <div class="method special">STORE</div>
            <div class="path">Data Storage</div>
            <div class="description">API data persistence implementation</div>
            <div class="toggle-icon" :class="{ open: openEndpoints.dataStore }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.dataStore">
            <div class="detail-section">
              <h4>Overview</h4>
              <p>
                The API uses a simple JSON file-based data store for
                persistence. Data is stored in <code>data.json</code> in the
                server's root directory.
              </p>
            </div>
            <div class="detail-section">
              <h4>Methods</h4>
              <table class="methods-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>load()</code></td>
                    <td>Loads data from the file system</td>
                  </tr>
                  <tr>
                    <td><code>save()</code></td>
                    <td>Persists data to the file system</td>
                  </tr>
                  <tr>
                    <td><code>getCollection(collection)</code></td>
                    <td>Gets or creates a collection</td>
                  </tr>
                  <tr>
                    <td><code>insert(collection, document)</code></td>
                    <td>Adds a new document to a collection</td>
                  </tr>
                  <tr>
                    <td><code>find(collection, query)</code></td>
                    <td>Finds documents matching a query</td>
                  </tr>
                  <tr>
                    <td><code>findOne(collection, query)</code></td>
                    <td>Finds the first document matching a query</td>
                  </tr>
                  <tr>
                    <td><code>update(collection, query, update)</code></td>
                    <td>Updates documents matching a query</td>
                  </tr>
                  <tr>
                    <td><code>delete(collection, query)</code></td>
                    <td>Deletes documents matching a query</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Default Admin -->
        <div class="endpoint-card glass special">
          <div class="endpoint-header" @click="toggleEndpoint('defaultAdmin')">
            <div class="method special">ADMIN</div>
            <div class="path">Default Administrator</div>
            <div class="description">
              Default administrator account creation
            </div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.defaultAdmin }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.defaultAdmin">
            <div class="detail-section">
              <h4>Default Admin Account</h4>
              <p>
                On server initialization, a default admin account is created if
                no admin exists:
              </p>
              <pre class="code-block">
{
  "name": "Administrator",
  "email": "admin@example.com",
  "password": "admin123", // Should be changed in production!
  "isAdmin": true,
  "authProvider": "local",
  "createdAt": "2025-03-22T12:34:56.789Z"
}</pre
              >
              <div class="warning">
                <i class="warning-icon">⚠️</i>
                <span
                  >The default password should be changed immediately in
                  production environments.</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="security-section glass">
        <h2>Security Notes</h2>
        <ul class="security-list">
          <li>
            <i class="security-icon">🔒</i>
            <div>
              <h4>Authentication</h4>
              <p>
                The API supports both local (email/password) and Google OAuth
                authentication.
              </p>
            </div>
          </li>
          <li>
            <i class="security-icon">⚠️</i>
            <div>
              <h4>Password Storage</h4>
              <p>
                This implementation stores passwords in plain text. In
                production, passwords should be hashed using bcrypt or similar.
              </p>
            </div>
          </li>
          <li>
            <i class="security-icon">🔑</i>
            <div>
              <h4>Admin Authentication</h4>
              <p>
                Admin authentication uses a simple Base64 encoded token. In
                production, use JWT with proper expiration and signing.
              </p>
            </div>
          </li>
          <li>
            <i class="security-icon">🌐</i>
            <div>
              <h4>CORS Configuration</h4>
              <p>
                CORS is configured to allow all origins in development. Restrict
                this in production.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div class="version-badge">API Documentation v1.0.0</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApiDocumentation",
  data() {
    return {
      openEndpoints: {
        status: false,
        register: false,
        login: false,
        getUsers: false,
        getUserById: false,
        adminLogin: false,
        adminGetUsers: false,
        adminDeleteUser: false,
        debug: false,
        googleAuth: false,
        dataStore: false,
        defaultAdmin: false,
      },
    };
  },
  methods: {
    toggleEndpoint(endpoint) {
      this.openEndpoints[endpoint] = !this.openEndpoints[endpoint];
    },
  },
};
</script>

<style scoped>
.ajax-data {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, #1a237e, #4a148c);
  color: #fff;
}

.back-to-dashboard {
  position: absolute;
  top: 15px;
  left: 15px;
}

.back-button {
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
  padding: 0.5rem 1rem;
}

.back-button:hover {
  color: #64ffda;
}

.back-icon {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .back-to-dashboard {
    top: 10px;
    left: 10px;
  }
}

.main-container {
  position: relative;
  width: 90%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 15px;
}

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #fff;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 2rem;
}

h2 {
  color: #64ffda;
  margin: 1.5rem 0 1rem;
  font-size: 1.5rem;
}

.api-section {
  margin-bottom: 2rem;
  text-align: center;
}

.api-section p {
  margin-bottom: 1rem;
  opacity: 0.8;
}

.version-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.badge {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.endpoints {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.endpoint-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.endpoint-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.endpoint-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.method {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  min-width: 60px;
  text-align: center;
  margin-right: 1rem;
}

.get {
  background: rgba(97, 175, 254, 0.2);
  color: #61affe;
}

.post {
  background: rgba(73, 204, 144, 0.2);
  color: #49cc90;
}

.special {
  background: rgba(252, 161, 48, 0.2);
  color: #fca130;
}

.path {
  font-family: monospace;
  font-size: 1rem;
  margin-right: 1rem;
  flex: 1;
}

.description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  flex: 2;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  position: relative;
  margin-left: 1rem;
}

.toggle-icon span {
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  top: 50%;
  transform: translateY(-50%);
}

.toggle-icon:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transition: all 0.3s;
}

.toggle-icon.open:before {
  transform: translateY(-50%) rotate(0);
}

.endpoint-details {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.detail-section {
  margin-top: 1rem;
}

.detail-section h4 {
  color: #64ffda;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.code-block {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 5px;
  font-family: monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.response {
  margin-bottom: 1rem;
}

.status {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.success {
  background: rgba(73, 204, 144, 0.2);
  color: #49cc90;
}

.error {
  background: rgba(249, 62, 62, 0.2);
  color: #f93e3e;
}

.params-table,
.methods-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
}

.params-table th,
.methods-table th,
.params-table td,
.methods-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.params-table th,
.methods-table th {
  color: #64ffda;
  font-weight: bold;
}

.warning {
  background: rgba(252, 161, 48, 0.2);
  border-left: 4px solid #fca130;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
}

.warning-icon {
  margin-right: 0.5rem;
  font-style: normal;
}

.security-section {
  padding: 1.5rem;
  margin-top: 2rem;
}

.security-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
}

.security-list li {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.security-icon {
  margin-right: 1rem;
  font-size: 1.5rem;
  font-style: normal;
}

.security-list h4 {
  margin: 0 0 0.5rem;
  color: #64ffda;
}

.security-list p {
  margin: 0;
  opacity: 0.8;
}

.version-badge {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Background circles animation */
.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  z-index: -1;
}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  animation: animate 25s linear infinite;
  bottom: -150px;
  border-radius: 50%;
}

.circles li:nth-child(1) {
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
  animation-duration: 20s;
}

.circles li:nth-child(2) {
  left: 10%;
  width: 20px;
  height: 20px;
  animation-delay: 2s;
  animation-duration: 12s;
}

.circles li:nth-child(3) {
  left: 70%;
  width: 20px;
  height: 20px;
  animation-delay: 4s;
}

.circles li:nth-child(4) {
  left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
  animation-duration: 18s;
}

.circles li:nth-child(5) {
  left: 65%;
  width: 20px;
  height: 20px;
  animation-delay: 0s;
}

.circles li:nth-child(6) {
  left: 75%;
  width: 110px;
  height: 110px;
  animation-delay: 3s;
}

.circles li:nth-child(7) {
  left: 35%;
  width: 150px;
  height: 150px;
  animation-delay: 7s;
}

.circles li:nth-child(8) {
  left: 50%;
  width: 25px;
  height: 25px;
  animation-delay: 15s;
  animation-duration: 45s;
}

.circles li:nth-child(9) {
  left: 20%;
  width: 15px;
  height: 15px;
  animation-delay: 2s;
  animation-duration: 35s;
}

.circles li:nth-child(10) {
  left: 85%;
  width: 150px;
  height: 150px;
  animation-delay: 0s;
  animation-duration: 11s;
}

@keyframes animate {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
}
@media (max-width: 768px) {
  /* ... altri stili responsive ... */

  .back-to-dashboard {
    top: 10px;
    left: 10px;
  }

  .back-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
/* Responsive styles */
@media (max-width: 768px) {
  .main-container {
    width: 95%;
    padding: 1.5rem;
  }

  .endpoint-header {
    flex-wrap: wrap;
  }

  .method {
    margin-bottom: 0.5rem;
  }

  .path {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .description {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .code-block {
    font-size: 0.8rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .ajax-data {
    background: linear-gradient(135deg, #0d1117, #161b22);
  }
}
</style>

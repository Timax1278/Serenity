<template>
  <div class="ajax-data">
    <!-- Background animation -->
    <ul class="circles">
      <li v-for="i in 10" :key="i"></li>
    </ul>

    <div class="main-container glass">
      <!-- Back to Dashboard button -->
      <div class="back-to-dashboard">
        <router-link to="/dashboard-page" class="back-button">
          <span class="back-icon">←</span> Torna alla Dashboard
        </router-link>
      </div>

      <h1>Serenity Analytics API Documentation</h1>

      <div class="api-section">
        <h2>API Overview</h2>
        <p>
          A RESTful analytics API for tracking user engagement and application
          metrics.
        </p>
        <div class="version-info">
          <span class="badge">Version: 1.0.0</span>
          <span class="badge">Base URL: /api/analytics</span>
        </div>
      </div>

      <div class="endpoints">
        <!-- API Status -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('status')">
            <div class="method get">GET</div>
            <div class="path">/status</div>
            <div class="description">Check analytics API status</div>
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
      "timestamp": "2025-03-22T12:34:56.789Z",
      "metrics": {
        "totalEvents": 12453,
        "activeUsers": 342
      }
    }</pre
              >
            </div>
          </div>
        </div>

        <!-- Track Event -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('trackEvent')">
            <div class="method post">POST</div>
            <div class="path">/events</div>
            <div class="description">Track a user event</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.trackEvent }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.trackEvent">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
    {
      "userId": "string", // Required
      "eventType": "string", // Required (pageView, buttonClick, formSubmit, etc.)
      "eventData": {
        // Optional, custom event properties
      },
      "timestamp": "string" // Optional, defaults to server time
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
      "userId": "string",
      "eventType": "string",
      "eventData": {
        // Custom event properties
      },
      "timestamp": "string",
      "ip": "string",
      "userAgent": "string"
    }</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
    {
      "message": "userId and eventType are required"
    }</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- User Session -->
        <div class="endpoint-card glass">
          <div class="endpoint-header" @click="toggleEndpoint('userSession')">
            <div class="method post">POST</div>
            <div class="path">/sessions</div>
            <div class="description">Start or update a user session</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.userSession }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.userSession">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
    {
      "userId": "string", // Required
      "sessionId": "string", // Optional, if updating existing session
      "referrer": "string", // Optional
      "platform": "string", // Optional
      "location": {         // Optional
        "country": "string",
        "city": "string"
      }
    }</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
    {
      "sessionId": "string",
      "userId": "string",
      "startTime": "string",
      "lastActive": "string",
      "referrer": "string",
      "platform": "string",
      "location": {
        "country": "string",
        "city": "string"
      },
      "duration": 0, // in seconds
      "pageViews": 0
    }</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
    {
      "message": "userId is required"
    }</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Get User Analytics -->
        <div class="endpoint-card glass">
          <div
            class="endpoint-header"
            @click="toggleEndpoint('getUserAnalytics')"
          >
            <div class="method get">GET</div>
            <div class="path">/users/:id/analytics</div>
            <div class="description">Get analytics for a specific user</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.getUserAnalytics }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.getUserAnalytics">
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
              <h4>Query Parameters</h4>
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
                    <td>from</td>
                    <td>string</td>
                    <td>Start date (ISO format)</td>
                  </tr>
                  <tr>
                    <td>to</td>
                    <td>string</td>
                    <td>End date (ISO format)</td>
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
  "userId": "string",
  "summary": {
    "totalSessions": 0,
    "totalTimeSpent": 0, // in seconds
    "averageSessionDuration": 0, // in seconds
    "totalPageViews": 0,
    "totalEvents": 0
  },
  "sessions": [
    {
      "sessionId": "string",
      "startTime": "string",
      "endTime": "string",
      "duration": 0, // in seconds
      "pageViews": 0,
      "events": 0,
      "platform": "string",
      "referrer": "string"
    }
  ],
  "topEvents": [
    {
      "eventType": "string",
      "count": 0
    }
  ],
  "activityByDay": [
    {
      "date": "string",
      "sessions": 0,
      "events": 0,
      "timeSpent": 0 // in seconds
    }
  ]
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

        <!-- Get Dashboard Metrics -->
        <div class="endpoint-card glass">
          <div
            class="endpoint-header"
            @click="toggleEndpoint('dashboardMetrics')"
          >
            <div class="method get">GET</div>
            <div class="path">/dashboard</div>
            <div class="description">Get aggregated dashboard metrics</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.dashboardMetrics }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.dashboardMetrics">
            <div class="detail-section">
              <h4>Query Parameters</h4>
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
                    <td>period</td>
                    <td>string</td>
                    <td>Time period (day, week, month, year)</td>
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
  "period": "string",
  "activeUsers": {
    "total": 0,
    "new": 0,
    "returning": 0,
    "trend": 0 // percentage change from previous period
  },
  "engagement": {
    "totalSessions": 0,
    "averageSessionDuration": 0, // in seconds
    "bounceRate": 0, // percentage
    "pageViewsPerSession": 0
  },
  "topEvents": [
    {
      "eventType": "string",
      "count": 0
    }
  ],
  "topReferrers": [
    {
      "referrer": "string",
      "sessions": 0,
      "users": 0
    }
  ],
  "userRetention": {
    "day1": 0, // percentage
    "day7": 0,
    "day30": 0
  },
  "timeSeriesData": [
    {
      "date": "string",
      "activeUsers": 0,
      "sessions": 0,
      "pageViews": 0,
      "events": 0
    }
  ]
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Event Segmentation -->
        <div class="endpoint-card glass">
          <div
            class="endpoint-header"
            @click="toggleEndpoint('eventSegmentation')"
          >
            <div class="method post">POST</div>
            <div class="path">/events/segment</div>
            <div class="description">Segment users based on events</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.eventSegmentation }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.eventSegmentation">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
{
  "eventType": "string", // Required
  "filters": [
    {
      "property": "string",
      "operator": "string", // equals, notEquals, contains, greaterThan, lessThan
      "value": "any"
    }
  ],
  "timeRange": {
    "from": "string", // ISO date
    "to": "string"    // ISO date
  },
  "groupBy": "string" // Optional property to group results by
}</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <pre class="code-block">
{
  "totalUsers": 0,
  "totalEvents": 0,
  "segments": [
    {
      "segment": "string", // value of groupBy property
      "users": 0,
      "events": 0,
      "percentage": 0 // percentage of total
    }
  ],
  "userIds": [
    "string"
  ]
}</pre
                >
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
{
  "message": "eventType is required"
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Data Export -->
        <div class="endpoint-card glass special">
          <div class="endpoint-header" @click="toggleEndpoint('dataExport')">
            <div class="method special">EXPORT</div>
            <div class="path">/export</div>
            <div class="description">Export analytics data</div>
            <div
              class="toggle-icon"
              :class="{ open: openEndpoints.dataExport }"
            >
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.dataExport">
            <div class="detail-section">
              <h4>Request Body</h4>
              <pre class="code-block">
{
  "dataType": "string", // "events", "sessions", "users"
  "format": "string",   // "csv", "json"
  "timeRange": {
    "from": "string",   // ISO date
    "to": "string"      // ISO date
  },
  "filters": {          // Optional
    "eventTypes": ["string"],
    "userIds": ["string"]
  }
}</pre
              >
            </div>
            <div class="detail-section">
              <h4>Responses</h4>
              <div class="response">
                <div class="status success">200 OK</div>
                <p>Returns file download with requested format</p>
              </div>
              <div class="response">
                <div class="status error">400 Bad Request</div>
                <pre class="code-block">
{
  "message": "dataType and format are required"
}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Analytics -->
        <div class="endpoint-card glass special">
          <div class="endpoint-header" @click="toggleEndpoint('realtime')">
            <div class="method special">REALTIME</div>
            <div class="path">/realtime</div>
            <div class="description">Real-time analytics data stream</div>
            <div class="toggle-icon" :class="{ open: openEndpoints.realtime }">
              <span></span>
            </div>
          </div>
          <div class="endpoint-details" v-if="openEndpoints.realtime">
            <div class="detail-section">
              <h4>Overview</h4>
              <p>
                The real-time endpoint provides a WebSocket connection for
                streaming live analytics data. Connect to this endpoint to
                receive events as they occur.
              </p>
            </div>
            <div class="detail-section">
              <h4>Connection</h4>
              <pre class="code-block">
WebSocket URL: ws://your-domain.com/api/analytics/realtime
</pre
              >
            </div>
            <div class="detail-section">
              <h4>Authentication</h4>
              <pre class="code-block">
// Connect with authentication token
const socket = new WebSocket('ws://your-domain.com/api/analytics/realtime?token=YOUR_AUTH_TOKEN');
</pre
              >
            </div>
            <div class="detail-section">
              <h4>Events</h4>
              <table class="methods-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>connection</code></td>
                    <td>Emitted when a client connects</td>
                  </tr>
                  <tr>
                    <td><code>user_active</code></td>
                    <td>Emitted when a user becomes active</td>
                  </tr>
                  <tr>
                    <td><code>user_inactive</code></td>
                    <td>Emitted when a user becomes inactive</td>
                  </tr>
                  <tr>
                    <td><code>page_view</code></td>
                    <td>Emitted on page view events</td>
                  </tr>
                  <tr>
                    <td><code>custom_event</code></td>
                    <td>Emitted on custom events</td>
                  </tr>
                  <tr>
                    <td><code>error</code></td>
                    <td>Emitted on error</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="implementation-section glass">
        <h2>Implementation Guide</h2>
        <ul class="implementation-list">
          <li>
            <i class="implementation-icon">📊</i>
            <div>
              <h4>Client Integration</h4>
              <p>
                Include our analytics script in your application to
                automatically track page views and user sessions:
              </p>
              <pre class="code-block">
&lt;script src="https://cdn.serenity-analytics.com/tracker.js"&gt;&lt;/script&gt;
&lt;script&gt;
  SerenityAnalytics.init({
    apiKey: 'YOUR_API_KEY',
    userId: 'USER_ID', // Optional, set for authenticated users
    options: {
      trackPageViews: true,
      trackClicks: true,
      trackForms: true
    }
  });
&lt;/script&gt;</pre
              >
            </div>
          </li>
          <li>
            <i class="implementation-icon">🔄</i>
            <div>
              <h4>Custom Event Tracking</h4>
              <p>Track custom events in your application:</p>
              <pre class="code-block">
// Track a custom event
SerenityAnalytics.trackEvent('purchase_completed', {
  productId: '12345',
  price: 49.99,
  currency: 'USD'
});</pre
              >
            </div>
          </li>
          <li>
            <i class="implementation-icon">👤</i>
            <div>
              <h4>User Identification</h4>
              <p>Identify users after authentication:</p>
              <pre class="code-block">
// Call after user logs in
SerenityAnalytics.identifyUser({
  userId: 'user123',
  traits: {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'premium'
  }
});</pre
              >
            </div>
          </li>
          <li>
            <i class="implementation-icon">📱</i>
            <div>
              <h4>Mobile SDK Integration</h4>
              <p>For mobile applications, use our native SDKs:</p>
              <pre class="code-block">
// iOS (Swift)
import SerenityAnalytics

SerenityAnalytics.configure(apiKey: "YOUR_API_KEY")
SerenityAnalytics.identifyUser(userId: "user123")
SerenityAnalytics.trackEvent(name: "app_opened", properties: ["version": "1.2.3"])

// Android (Kotlin)
import com.serenity.analytics

SerenityAnalytics.configure(context, "YOUR_API_KEY")
SerenityAnalytics.identifyUser("user123")
SerenityAnalytics.trackEvent("app_opened", mapOf("version" to "1.2.3"))</pre
              >
            </div>
          </li>
        </ul>
      </div>

      <div class="security-section glass">
        <h2>Security & Privacy</h2>
        <ul class="security-list">
          <li>
            <i class="security-icon">🔒</i>
            <div>
              <h4>Data Encryption</h4>
              <p>
                All data is encrypted in transit using TLS 1.3 and at rest using
                AES-256 encryption.
              </p>
            </div>
          </li>
          <li>
            <i class="security-icon">🔐</i>
            <div>
              <h4>API Authentication</h4>
              <p>
                API access requires authentication using API keys or JWT tokens
                with appropriate scopes.
              </p>
            </div>
          </li>
          <li>
            <i class="security-icon">👁️</i>
            <div>
              <h4>Data Privacy</h4>
              <p>
                PII (Personally Identifiable Information) is stored separately
                and can be anonymized or deleted upon request.
              </p>
            </div>
          </li>
          <li>
            <i class="security-icon">📝</i>
            <div>
              <h4>Compliance</h4>
              <p>
                Our analytics system is designed to help with GDPR, CCPA, and
                other privacy regulation compliance.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div class="version-badge">Analytics API Documentation v1.0.0</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AnalyticsApiDocumentation",
  data() {
    return {
      openEndpoints: {
        status: false,
        trackEvent: false,
        userSession: false,
        getUserAnalytics: false,
        dashboardMetrics: false,
        eventSegmentation: false,
        dataExport: false,
        realtime: false,
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
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Background animation */
.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  animation: animate 25s linear infinite;
  bottom: -150px;
  border-radius: 50%;
}

.circles li:nth-child(1) {
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
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

/* Main container styling */
.main-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Glass effect */
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: 2rem;
  position: relative;
}

/* Back to dashboard button */
.back-to-dashboard {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.back-button:hover {
  opacity: 1;
}

.back-icon {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

/* API Section styling */
.api-section {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

h2:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.version-info {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Endpoint Cards */
.endpoints {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.endpoint-card {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.endpoint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.3);
}

.endpoint-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.method {
  font-weight: bold;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
  font-size: 0.9rem;
}

.get {
  background-color: #61affe;
  color: #fff;
}

.post {
  background-color: #49cc90;
  color: #fff;
}

.put {
  background-color: #fca130;
  color: #fff;
}

.delete {
  background-color: #f93e3e;
  color: #fff;
}

.special {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

.path {
  font-family: monospace;
  font-size: 1rem;
  flex: 1;
}

.description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  flex: 2;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  position: relative;
  transition: transform 0.3s ease;
}

.toggle-icon span {
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: white;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.toggle-icon:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: white;
  top: 0;
  left: 0;
  transition: transform 0.3s ease;
}

.toggle-icon:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: white;
  bottom: 0;
  left: 0;
  transition: transform 0.3s ease;
}

.toggle-icon.open:before {
  transform: rotate(45deg) translate(5px, 5px);
}

.toggle-icon.open:after {
  transform: rotate(-45deg) translate(5px, -5px);
}

.toggle-icon.open span {
  opacity: 0;
}

/* Endpoint Details */
.endpoint-details {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

h4 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.code-block {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  font-family: monospace;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Response styling */
.response {
  margin-bottom: 1rem;
}

.response:last-child {
  margin-bottom: 0;
}

.status {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.success {
  background-color: #49cc90;
  color: #fff;
}

.error {
  background-color: #f93e3e;
  color: #fff;
}

/* Tables */
.params-table,
.methods-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.params-table th,
.methods-table th,
.params-table td,
.methods-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.params-table th,
.methods-table th {
  background: rgba(0, 0, 0, 0.3);
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
}

.params-table tr:last-child td,
.methods-table tr:last-child td {
  border-bottom: none;
}

/* Warning */
.warning {
  background: rgba(255, 193, 7, 0.2);
  border-left: 4px solid #ffc107;
  padding: 0.8rem;
  margin-top: 1rem;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
}

.warning-icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

/* Security Section */
.security-section,
.implementation-section {
  margin-bottom: 2rem;
}

.security-list,
.implementation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.security-list li,
.implementation-list li {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.security-list li:last-child,
.implementation-list li:last-child {
  margin-bottom: 0;
}

.security-icon,
.implementation-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.security-list h4,
.implementation-list h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.security-list p,
.implementation-list p {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Version badge */
.version-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
}

/* Code elements */
code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ajax-data {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .glass {
    padding: 1.5rem;
  }

  .endpoint-header {
    flex-wrap: wrap;
  }

  .method {
    min-width: 50px;
  }

  .path {
    flex: 0 0 100%;
    margin: 0.5rem 0;
  }

  .description {
    flex: 1;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .endpoint-header {
    padding: 0.8rem;
  }

  .code-block {
    font-size: 0.8rem;
  }
}
</style>

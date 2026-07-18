import './App.css'

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1 className="app-title">
          <span className="leaf">Leaf</span>
          <span className="ampersand">&</span>
          <span className="spine-container">
            <span className="spine">Sp</span>
            <span className="i-wrapper">
              <span className="i-stem">ı</span>
              <span className="leaf-dot"></span>
            </span>
            <span className="spine">ne</span>
          </span>
        </h1>
        <p className="app-subtitle">Your Personal Book Reading Companion</p>
      </header>

      <main className="content">
        <article className="privacy-policy">
          <h2>Privacy Policy for Leaf & Spine</h2>
          <p className="last-updated">Last updated: January 19, 2026</p>

          <section>
            <h3>Information We Collect</h3>
            <ul>
              <li>Anonymous user IDs (Firebase Authentication)</li>
              <li>Purchase history (stored locally and in Firebase)</li>
              <li>Device identifiers for push notifications (Expo Push Token)</li>
            </ul>
          </section>

          <section>
            <h3>How We Use Information</h3>
            <ul>
              <li>To provide in-app purchase functionality</li>
              <li>To prevent fraud and validate purchases</li>
            </ul>
          </section>

          <section>
            <h3>Data Storage</h3>
            <ul>
              <li>Purchase data is stored securely in Firebase</li>
              <li>User IDs are anonymized</li>
              <li>No personal information is collected</li>
            </ul>
          </section>

          <section>
            <h3>Push Notifications</h3>
            <ul>
              <li>We may send push notifications to remind you to use the app</li>
              <li>We collect a device identifier (push token) to deliver these notifications</li>
              <li>You can disable notifications in your device settings at any time</li>
              <li>Push tokens are sent to Expo Push Service for delivery only</li>
            </ul>
          </section>

          <section>
            <h3>Third-Party Services</h3>
            <ul>
              <li>Firebase (Google)</li>
              <li>Google Play In-App Billing</li>
            </ul>
          </section>

          <section>
            <h3>Contact</h3>
            <p>Email: <a href="mailto:contact@leafandspine.com">expera.forge@gmail.com</a></p>
          </section>
        </article>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Leaf & Spine. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App

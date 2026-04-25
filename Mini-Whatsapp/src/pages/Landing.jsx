function LeafChatMark() {
  return (
    <svg className="leaf-chat-mark" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="#22c55e" />
      <path
        fill="#fff"
        d="M89.8 28.5c-6.6 2.7-13.6 4.1-21 4.1-21.4 0-38.6 15.2-41.3 35.4-5.3 4.7-8.4 10.8-9.1 17.7 7.7-4.9 16.4-7.4 26-7.4 25.2 0 44.7-19.1 45.5-44.2.1-1.9 0-3.7-.1-5.6Z"
      />
      <path
        fill="#22c55e"
        d="M36.6 69.5c10.8-13.8 25.8-22.9 45-27.1-15.3 7.3-26.8 18.5-34.4 33.6-3-.6-6.6-2.8-10.6-6.5Z"
      />
    </svg>
  )
}

function SpringBootMark() {
  return (
    <svg className="spring-mark" viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="#dcfce7" />
      <path
        fill="#16a34a"
        d="M76.8 22.4c-4.3 2-9.2 3-14.6 3-15.3 0-27.7 10.5-30.8 24.7-5.4.8-10.2 4.1-13 8.9 4.5-.8 8.8-.2 12.5 1.6.5 8.2 7.2 14.7 15.5 14.7 15.8 0 28.9-12.2 30.3-27.7.8-8.5-1.8-16.3-6.8-22.3 2.8-.3 5.1-1.3 6.9-2.9ZM35.4 63.1c-2.6-7 3.1-20 18.8-22.8-6.6 3.9-10.2 8.5-11.6 14.1 4.1-5.4 11.1-8.9 20.2-10.7-4.1 11.8-13.7 19.9-27.4 19.4Z"
      />
    </svg>
  )
}

function Landing({ onLogin }) {
  return (
    <main className="landing-page">
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="SpringChat home">
          <span className="brand-icon">S</span>
          SpringChat
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About us</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <button className="login-link" type="button" onClick={onLogin}>Log in</button>
          <a className="signup-button" href="#signup">Sign up</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-copy">
          <h1>The best way to chat with your team.</h1>
          <p className="hero-subtitle">
            Here you can put a short description about your SpringChat project.
          </p>
        </div>

        <div className="hero-visual" aria-label="SpringChat app illustration">
          <div className="visual-card visual-card-large">
            <span />
            <span />
            <span />
          </div>
          <div className="blob blob-one" />
          <div className="blob blob-two" />
          <div className="blob blob-three" />
          <div className="message-pill pill-one">Team sync</div>
          <div className="message-pill pill-two">Spring ready</div>
          <div className="logo-orbit leaf-orbit">
            <LeafChatMark />
          </div>
          <div className="logo-orbit spring-orbit">
            <SpringBootMark />
          </div>
        </div>
      </section>

    </main>
  )
}

export default Landing

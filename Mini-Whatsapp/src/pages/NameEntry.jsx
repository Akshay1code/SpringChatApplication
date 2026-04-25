import { useState } from 'react'

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SC'
}

function NameEntry({ onSubmit }) {
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    onSubmit({
      name: trimmedName,
      initials: getInitials(trimmedName),
    })
  }

  return (
    <main className="name-entry-page">
      <form className="name-card" onSubmit={handleSubmit}>
        <span className="brand-icon name-card-icon">S</span>
        <p className="name-eyebrow">Welcome to SpringChat</p>
        <h1>What is your name?</h1>
        <p>Tell us what to call you before entering the chat.</p>
        <input
          autoFocus
          aria-label="Your name"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Continue to chat</button>
      </form>
    </main>
  )
}

export default NameEntry

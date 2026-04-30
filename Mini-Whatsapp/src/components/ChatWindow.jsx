import { useEffect, useRef, useState } from 'react'

function MenuIconButton({ onClick }) {
  return (
    <button className="icon-button mobile-menu-button" type="button" aria-label="Open chat list" onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
      </svg>
    </button>
  )
}

function TypingText({ label }) {
  if (!label) {
    return null
  }

  const baseLabel = label.replace(/\.\.\.$/, '')

  return (
    <span className="typing-indicator-text">
      {baseLabel}
      <span className="typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
  )
}

function getMessageAuthor(message, chat) {
  if (chat?.type === 'group') {
    return message.sender === 'sent' ? 'You' : (message.senderName || 'Unknown User')
  }

  return message.sender === 'sent' ? 'You' : chat?.name
}

const quickEmojis = [
  { symbol: '😀', label: 'Smile' },
  { symbol: '😂', label: 'Laugh' },
  { symbol: '😢', label: 'Cry' },
  { symbol: '❤️', label: 'Heart' },
  { symbol: '👍', label: 'Thumbs up' },
]

export function ChatWindow({
  chat,
  messages,
  typingLabel,
  onDraftChange,
  onSendMessage,
  isMobileView,
  onOpenSidebar,
}) {
  const [draft, setDraft] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const feedRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const draftInputRef = useRef(null)

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    function handlePointerDown(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setIsEmojiPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    const draftInput = draftInputRef.current

    if (!draftInput) {
      return
    }

    draftInput.style.height = '0px'
    draftInput.style.height = `${draftInput.scrollHeight}px`
  }, [draft])

  function updateDraft(nextValue) {
    setDraft(nextValue)
    onDraftChange?.(nextValue)
  }

  function handleEmojiSelect(emojiSymbol) {
    updateDraft(`${draft}${emojiSymbol}`)
    setIsEmojiPickerOpen(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if(draft.includes("fuck") || draft.includes("chu") || draft.includes("bc") || draft.includes("mc")){
      alert("Bad Language")
      setDraft("")
      onDraftChange?.('')
      setIsEmojiPickerOpen(false)
      return
    }
    const trimmedDraft = draft.trim()

    if (!trimmedDraft) {
      return
    }

    onSendMessage(trimmedDraft)
    setDraft('')
    onDraftChange?.('')
    setIsEmojiPickerOpen(false)
  }

  function handleDraftKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  if (!chat) {
    return (
      <section className="chat-window empty-window">
        <div className="empty-window-card">
          {isMobileView ? <MenuIconButton onClick={onOpenSidebar} /> : null}
          <span className="brand-icon">S</span>
          <h1>Start new chat with currently available users</h1>
          <p>Select an available user from the sidebar to begin a conversation.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="chat-window">
      <header className="window-header">
        <div className="window-contact">
          {isMobileView ? <MenuIconButton onClick={onOpenSidebar} /> : null}
          <span className="chat-avatar large-avatar" style={{ background: chat.avatarColor }}>
            {chat.initials}
          </span>
          <span>
            <strong>{chat.name}</strong>
            <small className={typingLabel ? 'typing-active' : ''}>
              <i />
              {typingLabel ? <TypingText label={typingLabel} /> : (chat.type === 'group' ? 'Group chat' : 'Private chat')}
            </small>
          </span>
        </div>
      </header>

      <div className="message-feed" ref={feedRef}>
        <div className="date-separator">Today</div>
        {messages.map((message) => (
          <article className={`message ${message.sender}`} key={message.id}>
            <span className="message-author">{getMessageAuthor(message, chat)}</span>
            <p>{message.text}</p>
            <time>{message.time}</time>
          </article>
        ))}
      </div>

      <form className="message-composer" onSubmit={handleSubmit}>
        <div className="emoji-picker-anchor" ref={emojiPickerRef}>
          <button
            className={`composer-icon ${isEmojiPickerOpen ? 'active' : ''}`}
            type="button"
            aria-label="Choose emoji"
            aria-expanded={isEmojiPickerOpen}
            onClick={() => setIsEmojiPickerOpen((currentValue) => !currentValue)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8 10a1.3 1.3 0 1 1 0-2.6A1.3 1.3 0 0 1 8 10Zm8 0a1.3 1.3 0 1 1 0-2.6A1.3 1.3 0 0 1 16 10Zm-8.2 3.2h2.1a2.4 2.4 0 0 0 4.2 0h2.1a4.4 4.4 0 0 1-8.4 0Z" />
            </svg>
          </button>
          <div className={`emoji-picker ${isEmojiPickerOpen ? 'open' : ''}`} aria-hidden={!isEmojiPickerOpen}>
            {quickEmojis.map((emojiItem) => (
              <button
                key={emojiItem.label}
                className="emoji-option"
                type="button"
                aria-label={emojiItem.label}
                onClick={() => handleEmojiSelect(emojiItem.symbol)}
              >
                <span>{emojiItem.symbol}</span>
              </button>
            ))}
          </div>
        </div>
        <textarea
          ref={draftInputRef}
          aria-label="Message"
          className="message-composer-input"
          placeholder={chat.type === 'group' ? 'Type a group message...' : 'Type a message...'}
          value={draft}
          rows={1}
          onChange={(event) => {
            updateDraft(event.target.value)
          }}
          onKeyDown={handleDraftKeyDown}
        />
        <button className="send-button" type="submit" aria-label="Send message">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.8 20.2 21 12 3.8 3.8 3 10.2l10 1.8-10 1.8.8 6.4Z" />
          </svg>
        </button>
      </form>
    </section>
  )
}

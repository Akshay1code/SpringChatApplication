import { useState } from 'react'

export function ChatSidebar({
  isMobileView,
  isOpen,
  users,
  liveUsers,
  activeChatType,
  activeUserId,
  unreadByUser,
  groupUnread,
  onSelectUser,
  onSelectGroup,
  onStartChat,
  currentUser,
  onClose,
}) {
  const [searchValue, setSearchValue] = useState('')
  const [showAvailableUsers, setShowAvailableUsers] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onStartChat(searchValue)
    setSearchValue('')
  }

  function handleAvailableUserClick(userId) {
    onSelectUser(userId)
    setShowAvailableUsers(false)
  }

  return (
    <aside
      className={`chat-sidebar ${isMobileView ? 'mobile-drawer' : ''} ${isOpen ? 'open' : ''}`}
      aria-hidden={isMobileView && !isOpen}
    >
      <div className="sidebar-header">
        <a className="chat-brand" href="/" aria-label="SpringChat">
          <span className="brand-icon">S</span>
          SpringChat
        </a>
        {isMobileView ? (
          <button
            className="icon-button mobile-close-button"
            type="button"
            aria-label="Close chat list"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z" />
            </svg>
          </button>
        ) : null}
        <button
          className={`sidebar-toggle-button ${showAvailableUsers ? 'active' : ''}`}
          type="button"
          aria-label="Show available users"
          aria-expanded={showAvailableUsers}
          onClick={() => setShowAvailableUsers((currentValue) => !currentValue)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
          </svg>
          <span>Users</span>
          <em>{liveUsers.length}</em>
        </button>
      </div>

      {showAvailableUsers && (
        <section className="available-users-panel" aria-label="Currently available users">
          <div className="available-users-header">
            <strong>Currently available users</strong>
            <small>{liveUsers.length > 0 ? `${liveUsers.length} in this session` : 'No users yet'}</small>
          </div>

          <div className="available-users-list">
            {liveUsers.length > 0 ? (
              liveUsers.map((chatUser) => (
                <button
                  className="available-user-item"
                  key={`available-${chatUser.id}`}
                  type="button"
                  onClick={() => handleAvailableUserClick(chatUser.id)}
                >
                  <span className="chat-avatar" style={{ background: chatUser.avatarColor }}>
                    {chatUser.initials}
                  </span>
                  <span className="available-user-info">
                    <strong>{chatUser.name}</strong>
                    <small>Available in this session</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="available-users-empty">
                <strong>No available users</strong>
                <small>Users will appear here once they join or message in this session.</small>
              </div>
            )}
          </div>
        </section>
      )}

      <form className="chat-search" onSubmit={handleSubmit}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m20.7 19.3-4.2-4.2a7.4 7.4 0 1 0-1.4 1.4l4.2 4.2 1.4-1.4ZM5 10.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z" />
        </svg>
        <input
          type="search"
          placeholder="Enter username to start chat"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </form>

      <div className="chat-list">
        <button
          className={`chat-item ${activeChatType === 'group' ? 'active' : ''}`}
          type="button"
          onClick={onSelectGroup}
        >
          <span className="chat-avatar group-avatar">GC</span>
          <span className="chat-info">
            <span className="chat-row">
              <strong>Group Chat</strong>
              {groupUnread > 0 && <em>{groupUnread}</em>}
            </span>
            <span className="chat-row">
              <small>Message everyone online</small>
            </span>
          </span>
        </button>

        {users.length > 0 ? (
          users.map((chatUser) => (
            <button
              className={`chat-item ${activeChatType === 'private' && chatUser.id === activeUserId ? 'active' : ''}`}
              key={chatUser.id}
              type="button"
              onClick={() => onSelectUser(chatUser.id)}
            >
              <span className="chat-avatar" style={{ background: chatUser.avatarColor }}>
                {chatUser.initials}
              </span>
              <span className="chat-info">
                <span className="chat-row">
                  <strong>{chatUser.name}</strong>
                  {unreadByUser[chatUser.id] > 0 && <em>{unreadByUser[chatUser.id]}</em>}
                </span>
                <span className="chat-row">
                  <small>Private chat</small>
                </span>
              </span>
            </button>
          ))
        ) : (
          <div className="empty-chat-list">
            <strong>No chats yet</strong>
            <small>Enter a username above or wait for someone to message you.</small>
          </div>
        )}
      </div>

      <div className="sidebar-profile">
        <span className="chat-avatar user-avatar">{currentUser.initials}</span>
        <span>
          <strong>{currentUser.name}</strong>
          <small>Available</small>
        </span>
        <button className="icon-button" type="button" aria-label="Settings">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a7.2 7.2 0 0 0-2.6-1.5L14 2h-4l-.4 2.5A7.2 7.2 0 0 0 7 6L4.6 5 2.6 8.5l2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a7.2 7.2 0 0 0 2.6 1.5L10 22h4l.4-2.5A7.2 7.2 0 0 0 17 18l2.4 1 2-3.5-2-1.5ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
          </svg>
        </button>
      </div>
    </aside>
  )
}

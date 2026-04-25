import { useEffect, useRef, useState } from 'react'
import { ChatSidebar } from '../components/ChatSidebar'
import { ChatWindow } from '../components/ChatWindow'
import {
  connectSocket,
  disconnectSocket,
  sendGroupMessage,
  sendGroupTypingMessage,
  sendMessage,
  sendTypingMessage,
} from '../services/webSocket'

const groupChat = {
  id: 'group-chat',
  name: 'Group Chat',
  initials: 'GC',
  avatarColor: 'linear-gradient(135deg, #22c55e, #14532d)',
  type: 'group',
}

function getUserId(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'
}

function formatTime() {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

function isTypingEvent(message) {
  const textValue = message?.content ?? message?.message ?? message?.text
  return message?.eventType === 'typing' || textValue == null
}

function hasRenderableMessageContent(message) {
  const textValue = message?.content ?? message?.message ?? message?.text
  return typeof textValue === 'string' ? textValue.trim().length > 0 : Boolean(textValue)
}

function isSameGroupMessage(leftMessage, rightMessage) {
  if (leftMessage.clientMessageId && rightMessage.clientMessageId) {
    return leftMessage.clientMessageId === rightMessage.clientMessageId
  }

  return (
    leftMessage.senderName === rightMessage.senderName
    && leftMessage.text === rightMessage.text
    && leftMessage.sender === rightMessage.sender
    && leftMessage.time === rightMessage.time
  )
}

function createChatUser(name) {
  return {
    id: getUserId(name),
    name,
    initials: getInitials(name),
    avatarColor: 'linear-gradient(135deg, #86efac, #16a34a)',
  }
}

function normalizeUsersList(userNames, currentUserName) {
  const uniqueNames = [...new Set(
    userNames
      .filter((name) => typeof name === 'string')
      .map((name) => name.trim())
      .filter(Boolean),
  )]

  const sortedNames = uniqueNames.sort((leftName, rightName) => {
    if (leftName === currentUserName) {
      return -1
    }

    if (rightName === currentUserName) {
      return 1
    }

    return leftName.localeCompare(rightName)
  })

  return sortedNames.map((name) => createChatUser(name))
}

function normalizeIncomingMessage(message, loggedInUsername) {
  const senderName = message.sender || message.from || 'Unknown User'
  const receiverName = message.receiver || message.to || loggedInUsername
  const conversationName = senderName === loggedInUsername ? receiverName : senderName

  return {
    conversationUser: createChatUser(conversationName),
    message: {
      id: message.id || `${Date.now()}-${Math.random()}`,
      sender: senderName === loggedInUsername ? 'sent' : 'received',
      text: message.content || message.message || message.text || JSON.stringify(message),
      time: formatTime(),
    },
  }
}

function formatGroupTypingLabel(typingUsers) {
  if (typingUsers.length === 0) {
    return ''
  }

  if (typingUsers.length === 1) {
    return `${typingUsers[0]} is typing...`
  }

  if (typingUsers.length === 2) {
    return `${typingUsers[0]} and ${typingUsers[1]} are typing...`
  }

  return `${typingUsers[0]}, ${typingUsers[1]} and others are typing...`
}

function normalizeGroupMessage(message, loggedInUsername) {
  const senderName = message.sender || message.from || 'Unknown User'

  return {
    id: message.id || `${Date.now()}-${Math.random()}`,
    sender: senderName === loggedInUsername ? 'sent' : 'received',
    senderName,
    clientMessageId: message.clientMessageId || null,
    text: message.content || message.message || message.text || JSON.stringify(message),
    time: message.time || formatTime(),
  }
}

function Chat({ user, liveUsers, onRegisterLiveUser, onReplaceLiveUsers }) {
  const currentUser = user ?? {
    name: 'SpringChat User',
    initials: 'SC',
  }
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth <= 768)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768)
  const [users, setUsers] = useState([])
  const [activeChatType, setActiveChatType] = useState('private')
  const [activeUserId, setActiveUserId] = useState(null)
  const [messagesByUser, setMessagesByUser] = useState({})
  const [groupMessages, setGroupMessages] = useState([])
  const [unreadByUser, setUnreadByUser] = useState({})
  const [groupUnread, setGroupUnread] = useState(0)
  const [typingByUser, setTypingByUser] = useState({})
  const [groupTypingUsers, setGroupTypingUsers] = useState([])
  const activeUserIdRef = useRef(null)
  const activeChatTypeRef = useRef('private')
  const typingTimeoutRef = useRef(null)
  const privateTypingTargetRef = useRef(null)
  const groupTypingSentRef = useRef(false)
  const incomingPrivateTypingTimeoutsRef = useRef({})
  const incomingGroupTypingTimeoutsRef = useRef({})
  const activeUser = activeChatType === 'group'
    ? groupChat
    : users.find((chatUser) => chatUser.id === activeUserId) ?? null
  const activeMessages = activeChatType === 'group'
    ? groupMessages
    : activeUser ? messagesByUser[activeUser.id] ?? [] : []
  const typingLabel = activeChatType === 'group'
    ? formatGroupTypingLabel(groupTypingUsers)
    : activeUser ? typingByUser[activeUser.id] || '' : ''

  function registerLiveUserByName(name) {
    const trimmedName = name?.trim()

    if (!trimmedName || !onRegisterLiveUser) {
      return
    }

    onRegisterLiveUser(createChatUser(trimmedName))
  }

  useEffect(() => {
    activeUserIdRef.current = activeUserId
    activeChatTypeRef.current = activeChatType
  }, [activeChatType, activeUserId])

  useEffect(() => {
    registerLiveUserByName(currentUser.name)
  }, [currentUser.name])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')

    function handleMediaQueryChange(event) {
      setIsMobileView(event.matches)
      setIsSidebarOpen(!event.matches)
    }

    handleMediaQueryChange(mediaQuery)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaQueryChange)
      return () => mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }

    mediaQuery.addListener(handleMediaQueryChange)
    return () => mediaQuery.removeListener(handleMediaQueryChange)
  }, [])

  useEffect(() => {
    connectSocket(
      currentUser.name,
      (socketMessage) => {
        if (isTypingEvent(socketMessage)) {
          const senderName = socketMessage.sender || socketMessage.from
          if (!senderName || senderName === currentUser.name) {
            return
          }

          const receiverName = socketMessage.receiver || socketMessage.to || currentUser.name
          const conversationName = senderName === currentUser.name ? receiverName : senderName
          const conversationUser = createChatUser(conversationName)
          registerLiveUserByName(senderName)

          setUsers((currentUsers) => {
            if (currentUsers.some((chatUser) => chatUser.id === conversationUser.id)) {
              return currentUsers
            }

            return [...currentUsers, conversationUser]
          })
          setTypingByUser((currentTyping) => ({
            ...currentTyping,
            [conversationUser.id]: `${senderName} is typing...`,
          }))

          if (incomingPrivateTypingTimeoutsRef.current[conversationUser.id]) {
            clearTimeout(incomingPrivateTypingTimeoutsRef.current[conversationUser.id])
          }

          incomingPrivateTypingTimeoutsRef.current[conversationUser.id] = setTimeout(() => {
            setTypingByUser((currentTyping) => ({
              ...currentTyping,
              [conversationUser.id]: '',
            }))
            delete incomingPrivateTypingTimeoutsRef.current[conversationUser.id]
          }, 1600)
          return
        }

        const { conversationUser, message } = normalizeIncomingMessage(socketMessage, currentUser.name)
        registerLiveUserByName(conversationUser.name)

        if (incomingPrivateTypingTimeoutsRef.current[conversationUser.id]) {
          clearTimeout(incomingPrivateTypingTimeoutsRef.current[conversationUser.id])
          delete incomingPrivateTypingTimeoutsRef.current[conversationUser.id]
        }

        setTypingByUser((currentTyping) => ({
          ...currentTyping,
          [conversationUser.id]: '',
        }))

        setUsers((currentUsers) => {
          if (currentUsers.some((chatUser) => chatUser.id === conversationUser.id)) {
            return currentUsers
          }

          return [...currentUsers, conversationUser]
        })
        setMessagesByUser((currentMessages) => ({
          ...currentMessages,
          [conversationUser.id]: [
            ...(currentMessages[conversationUser.id] ?? []),
            message,
          ],
        }))
        setUnreadByUser((currentUnread) => {
          if (
            activeChatTypeRef.current === 'private'
            && conversationUser.id === activeUserIdRef.current
            || message.sender === 'sent'
          ) {
            return currentUnread
          }

          return {
            ...currentUnread,
            [conversationUser.id]: (currentUnread[conversationUser.id] ?? 0) + 1,
          }
        })
      },
      (socketMessage) => {
        if (isTypingEvent(socketMessage)) {
          const senderName = socketMessage.sender || socketMessage.from || 'Unknown User'

          if (senderName === currentUser.name) {
            return
          }

          registerLiveUserByName(senderName)

          setGroupTypingUsers((currentTypingUsers) => (
            currentTypingUsers.includes(senderName)
              ? currentTypingUsers
              : [...currentTypingUsers, senderName]
          ))

          if (incomingGroupTypingTimeoutsRef.current[senderName]) {
            clearTimeout(incomingGroupTypingTimeoutsRef.current[senderName])
          }

          incomingGroupTypingTimeoutsRef.current[senderName] = setTimeout(() => {
            setGroupTypingUsers((currentTypingUsers) => currentTypingUsers.filter((userName) => userName !== senderName))
            delete incomingGroupTypingTimeoutsRef.current[senderName]
          }, 1600)
          return
        }

        if (!hasRenderableMessageContent(socketMessage)) {
          return
        }

        const message = normalizeGroupMessage(socketMessage, currentUser.name)
        registerLiveUserByName(message.senderName)

        if (incomingGroupTypingTimeoutsRef.current[message.senderName]) {
          clearTimeout(incomingGroupTypingTimeoutsRef.current[message.senderName])
          delete incomingGroupTypingTimeoutsRef.current[message.senderName]
        }

        setGroupTypingUsers((currentTypingUsers) => currentTypingUsers.filter((userName) => userName !== message.senderName))

        setGroupMessages((currentMessages) => (
          currentMessages.some((currentMessage) => isSameGroupMessage(currentMessage, message))
            ? currentMessages
            : [...currentMessages, message]
        ))
        if (activeChatTypeRef.current !== 'group' && message.sender !== 'sent') {
          setGroupUnread((currentUnread) => currentUnread + 1)
        }
      },
      (onlineUsers) => {
        const normalizedUsers = normalizeUsersList(onlineUsers, currentUser.name)

        onReplaceLiveUsers?.(normalizedUsers)
        setUsers(normalizedUsers.filter((onlineUser) => onlineUser.name !== currentUser.name))
      },
    )

    return () => {
      disconnectSocket()
    }
  }, [currentUser.name])

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    Object.values(incomingPrivateTypingTimeoutsRef.current).forEach(clearTimeout)
    Object.values(incomingGroupTypingTimeoutsRef.current).forEach(clearTimeout)
  }, [])

  function clearTypingTimeout() {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  function broadcastTyping(isTyping, targetUser = activeUser) {
    if (!targetUser) {
      return
    }

    if (activeChatTypeRef.current === 'group' || targetUser.type === 'group') {
      sendGroupTypingMessage({
        eventType: 'typing',
        sender: currentUser.name,
        isTyping,
      })
      groupTypingSentRef.current = isTyping
      return
    }

    sendTypingMessage({
      eventType: 'typing',
      sender: currentUser.name,
      receiver: targetUser.name,
      isTyping,
    })
    privateTypingTargetRef.current = isTyping ? targetUser.id : null
  }

  function handleDraftChange(value) {
    if (!activeUser) {
      return
    }

    const hasDraft = value.trim().length > 0
    clearTypingTimeout()

    if (!hasDraft) {
      if (activeChatType === 'group') {
        if (groupTypingSentRef.current) {
          broadcastTyping(false, groupChat)
        }
      } else if (privateTypingTargetRef.current === activeUser.id) {
        broadcastTyping(false, activeUser)
      }

      return
    }

    if (activeChatType === 'group') {
      if (!groupTypingSentRef.current) {
        broadcastTyping(true, groupChat)
      }
    } else if (privateTypingTargetRef.current !== activeUser.id) {
      broadcastTyping(true, activeUser)
    }

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false, activeUser)
    }, 1200)
  }

  function handleStartChat(username) {
    const trimmedUsername = username.trim()

    if (!trimmedUsername || trimmedUsername === currentUser.name) {
      return
    }

    const chatUser = createChatUser(trimmedUsername)
    registerLiveUserByName(trimmedUsername)
    setActiveChatType('private')
    setUsers((currentUsers) => {
      if (currentUsers.some((userItem) => userItem.id === chatUser.id)) {
        return currentUsers
      }

      return [...currentUsers, chatUser]
    })
    setActiveUserId(chatUser.id)
    setUnreadByUser((currentUnread) => ({
      ...currentUnread,
      [chatUser.id]: 0,
    }))
    if (isMobileView) {
      setIsSidebarOpen(false)
    }
  }

  function handleSelectUser(userId) {
    if (activeChatTypeRef.current === 'group') {
      if (groupTypingSentRef.current) {
        broadcastTyping(false, groupChat)
      }
    } else if (privateTypingTargetRef.current) {
      const previousUser = users.find((chatUser) => chatUser.id === privateTypingTargetRef.current)

      if (previousUser) {
        broadcastTyping(false, previousUser)
      }
    }

    clearTypingTimeout()
    setActiveChatType('private')
    setActiveUserId(userId)
    setUnreadByUser((currentUnread) => ({
      ...currentUnread,
      [userId]: 0,
    }))
    if (isMobileView) {
      setIsSidebarOpen(false)
    }
  }

  function handleSelectGroup() {
    if (privateTypingTargetRef.current) {
      const previousUser = users.find((chatUser) => chatUser.id === privateTypingTargetRef.current)

      if (previousUser) {
        broadcastTyping(false, previousUser)
      }
    }

    clearTypingTimeout()
    setActiveChatType('group')
    setActiveUserId(null)
    setGroupUnread(0)
    if (isMobileView) {
      setIsSidebarOpen(false)
    }
  }

  function handleSendMessage(text) {
    if (!activeUser) {
      return
    }

    clearTypingTimeout()
    broadcastTyping(false, activeUser)

    if (activeChatType === 'group') {
      const clientMessageId = `${currentUser.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const messageTime = formatTime()
      const payload = {
        clientMessageId,
        sender: currentUser.name,
        content: text,
        time: messageTime,
      }
      const optimisticMessage = {
        id: Date.now(),
        sender: 'sent',
        senderName: currentUser.name,
        clientMessageId,
        text,
        time: messageTime,
      }

      if (sendGroupMessage(payload)) {
        setGroupMessages((currentMessages) => [...currentMessages, optimisticMessage])
      }
      return
    }

    const payload = {
      sender: currentUser.name,
      receiver: activeUser.name,
      content: text,
    }
    const optimisticMessage = {
      id: Date.now(),
      sender: 'sent',
      text,
      time: formatTime(),
    }

    sendMessage(payload)
    setMessagesByUser((currentMessages) => ({
      ...currentMessages,
      [activeUser.id]: [
        ...(currentMessages[activeUser.id] ?? []),
        optimisticMessage,
      ],
    }))
  }

  return (
    <main className="chat-app">
      {isMobileView && isSidebarOpen ? (
        <button
          className="chat-sidebar-backdrop"
          type="button"
          aria-label="Close chat list"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
      <ChatSidebar
        isMobileView={isMobileView}
        isOpen={isSidebarOpen}
        users={users}
        liveUsers={liveUsers}
        activeChatType={activeChatType}
        activeUserId={activeUserId}
        unreadByUser={unreadByUser}
        groupUnread={groupUnread}
        onSelectUser={handleSelectUser}
        onSelectGroup={handleSelectGroup}
        onStartChat={handleStartChat}
        currentUser={currentUser}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatWindow
        chat={activeUser}
        messages={activeMessages}
        typingLabel={typingLabel}
        onDraftChange={handleDraftChange}
        onSendMessage={handleSendMessage}
        isMobileView={isMobileView}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </main>
  )
}

export default Chat

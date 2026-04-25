import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

let stompClient = null
let activeSubscriptions = []

function appendUsername(url, username) {
  if (!username) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}username=${encodeURIComponent(username)}`
}

function normalizeSockJsUrl(url) {
  if (url.startsWith('wss://')) {
    return `https://${url.slice('wss://'.length)}`
  }

  if (url.startsWith('ws://')) {
    return `http://${url.slice('ws://'.length)}`
  }

  return url
}

function getSocketUrl(username) {
  if (import.meta.env.VITE_WS_URL) {
    return appendUsername(normalizeSockJsUrl(import.meta.env.VITE_WS_URL), username)
  }

  if (import.meta.env.DEV) {
    return appendUsername('http://localhost:8080/ws', username)
  }

  return appendUsername(`${window.location.origin}/ws`, username)
}

export const connectSocket = (
  username,
  onMessageReceived,
  onGroupMessageReceived,
  onUsersReceived,
) => {
  const socketUrl = getSocketUrl(username)
  const socket = new SockJS(socketUrl)
  stompClient = Stomp.over(socket)
  stompClient.debug = null

  stompClient.connect({}, () => {
    console.log('CONNECTED AS:', username)
    console.log('SOCKET URL:', socketUrl)

    activeSubscriptions.forEach((subscription) => subscription.unsubscribe())
    activeSubscriptions = []

    activeSubscriptions.push(stompClient.subscribe('/user/queue/messages', (msg) => {
      const data = JSON.parse(msg.body)
      onMessageReceived(data)
    }))

    if (onGroupMessageReceived) {
      activeSubscriptions.push(stompClient.subscribe('/topic/messages', (msg) => {
        const data = JSON.parse(msg.body)
        console.log('BROADCAST:', data)
        onGroupMessageReceived(data)
      }))
    }

    if (onUsersReceived) {
      activeSubscriptions.push(stompClient.subscribe('/topic/users', (msg) => {
        const data = JSON.parse(msg.body)
        console.log('ONLINE USERS:', data)
        onUsersReceived(data)
      }))

      stompClient.send('/app/getUsers', {}, {})
    }
  }, (error) => {
    console.error('Socket connection failed:', error)
  })
}

export const sendMessage = (message) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('Socket is not connected yet')
    return false
  }

  console.log('Sending payload:', message)
  stompClient.send('/app/private', {}, JSON.stringify(message))
  return true
}

export const sendTypingMessage = (message) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('Socket is not connected yet')
    return false
  }

  stompClient.send('/app/private', {}, JSON.stringify(message))
  return true
}

export const sendGroupMessage = (message) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('Socket is not connected yet')
    return false
  }

  console.log('Sending group payload:', message)
  stompClient.send('/app/broadcast', {}, JSON.stringify(message))
  return true
}

export const sendGroupTypingMessage = (message) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('Socket is not connected yet')
    return false
  }

  stompClient.send('/app/broadcast', {}, JSON.stringify(message))
  return true
}

export const disconnectSocket = () => {
  activeSubscriptions.forEach((subscription) => subscription.unsubscribe())
  activeSubscriptions = []

  if (stompClient?.connected) {
    stompClient.disconnect()
  }

  stompClient = null
}

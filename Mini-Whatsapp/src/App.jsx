import './App.css'
import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Chat from './pages/Chat'
import NameEntry from './pages/NameEntry'

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [liveUsers, setLiveUsers] = useState([])
  const navigate = useNavigate()

  function registerLiveUser(nextUser) {
    if (!nextUser?.name) {
      return
    }

    setLiveUsers((currentUsers) => (
      currentUsers.some((currentUser) => currentUser.name === nextUser.name)
        ? currentUsers
        : [...currentUsers, nextUser]
    ))
  }

  function replaceLiveUsers(nextUsers) {
    setLiveUsers(nextUsers)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <NameEntry
            onSubmit={(newUser) => {
              setUser(newUser)
              registerLiveUser(newUser)
              navigate('/chat')
            }}
          />
        )}
      />
      <Route path="/name" element={<Navigate to="/" replace />} />
      <Route
        path="/chat"
        element={(
          user
            ? (
              <Chat
                user={user}
                liveUsers={liveUsers}
                onRegisterLiveUser={registerLiveUser}
                onReplaceLiveUsers={replaceLiveUsers}
              />
            )
            : <Navigate to="/" replace />
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

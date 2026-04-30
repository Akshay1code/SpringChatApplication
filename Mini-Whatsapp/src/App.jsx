import './App.css'
import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Chat from './pages/Chat'
import NameEntry from './pages/NameEntry'

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [liveUsers, setLiveUsers] = useState([])
  const navigate = useNavigate()

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

import React, { useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/three/Scene'
import { GameProvider } from './context/GameContext'
import GameUI from './components/ui/GameUI'
import styles from './App.module.css'
import { Provider } from 'react-redux'
import { store } from './store'
import { ToastContainer } from 'react-toastify'
import { initNotifications, cleanupNotifications } from './services/notifications'
import { useFeature } from './config/featureFlags'
import 'react-toastify/dist/ReactToastify.css'

function ThreeCanvas() {
  return (
    <Canvas
      shadows
      camera={{
        position: [15, 15, 15],
        fov: 50
      }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}

const AppContent = () => {
  const showToasts = useFeature('TOAST_NOTIFICATIONS')

  useEffect(() => {
    // Initialize notifications and store cleanup function
    const cleanup = initNotifications()

    // Clean up notifications when component unmounts
    return () => {
      cleanup()
      cleanupNotifications()
    }
  }, [])

  return (
    <div className={styles.app}>
      <div className={styles.canvasContainer}>
        <ThreeCanvas />
      </div>
      <GameUI />
      {showToasts && (
        <ToastContainer 
          theme="dark"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{
            width: '400px',
            maxHeight: '80vh'
          }}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </Provider>
  )
}

export default App 
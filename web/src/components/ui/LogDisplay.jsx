import React from 'react'
import { useSelector } from 'react-redux'
import styles from './LogDisplay.module.css'

const LogDisplay = () => {
  const logs = useSelector(state => state.game.logs)

  return (
    <div className={styles.logDisplay}>
      <h3>Game Log</h3>
      <div className={styles.logList}>
        {logs.map((log, index) => (
          <div key={index} className={styles.logEntry}>
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogDisplay 
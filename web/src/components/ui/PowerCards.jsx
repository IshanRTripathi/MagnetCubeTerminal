import React from 'react'
import { useSelector } from 'react-redux'
import styles from './PowerCards.module.css'

const PowerCard = ({ card, isActive, onClick }) => (
  <div 
    className={`${styles.powerCard} ${isActive ? styles.active : ''}`}
    onClick={onClick}
  >
    <div className={styles.cardIcon}>{card.icon}</div>
    <div className={styles.cardName}>{card.name}</div>
    <div className={styles.cardDescription}>{card.description}</div>
  </div>
)

const PowerCards = () => {
  const currentPlayer = useSelector(state => state.game?.currentPlayer)
  const powerCards = currentPlayer?.powerCards || []

  return (
    <div className={styles.powerCards}>
      {powerCards.map((card, index) => (
        <PowerCard
          key={card.id}
          card={card}
          isActive={card.isActive}
          onClick={() => {
            // Handle card activation
            console.log('Activating card:', card.name)
          }}
        />
      ))}
    </div>
  )
}

export default PowerCards 
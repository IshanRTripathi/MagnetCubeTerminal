import React from 'react'
import { useSelector } from 'react-redux'
import styles from './PowerCardDeck.module.css'

const PowerCardDeck = () => {
  const currentPlayer = useSelector(state => state.game.currentPlayer)
  
  if (!currentPlayer) return null

  return (
    <div className={styles.powerCardDeck}>
      <h3 className={styles.title}>Power Cards</h3>
      <div className={styles.cardContainer}>
        {currentPlayer.powerCards.map(card => (
          <div key={card.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardName}>{card.name}</h4>
              <span className={styles.cardType}>{card.type}</span>
            </div>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PowerCardDeck 
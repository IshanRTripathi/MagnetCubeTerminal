import React from 'react'
import { useGame } from '../../context/GameContext'

const PowerCard = ({ card, isActive, onSelect }) => {
  const { currentPlayer } = useGame()
  const isDisabled = !isActive || card.cooldown > 0

  return (
    <div
      className={`power-card ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => !isDisabled && onSelect(card)}
    >
      <div className="card-header">
        <h3>{card.name}</h3>
        {card.cooldown > 0 && (
          <span className="cooldown">{card.cooldown}</span>
        )}
      </div>
      
      <div className="card-content">
        <p className="description">{card.description}</p>
        <div className="effects">
          {card.effects.map((effect, index) => (
            <div key={index} className="effect">
              <span className="effect-icon">{effect.icon}</span>
              <span className="effect-value">{effect.value}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .power-card {
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid #444;
          border-radius: 8px;
          padding: 12px;
          margin: 8px;
          width: 200px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .power-card:hover:not(.disabled) {
          transform: translateY(-2px);
          border-color: #666;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .power-card.active {
          border-color: #00ff00;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
        }

        .power-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.1em;
          color: #fff;
        }

        .cooldown {
          background: #ff4444;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
        }

        .description {
          color: #ccc;
          font-size: 0.9em;
          margin: 8px 0;
        }

        .effects {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .effect {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .effect-icon {
          font-size: 1.2em;
        }

        .effect-value {
          color: #fff;
          font-weight: bold;
        }

        /* Power card types */
        .power-card[data-type="magnetic"] {
          border-color: #00ffff;
        }

        .power-card[data-type="wind"] {
          border-color: #00ff00;
        }

        .power-card[data-type="grapple"] {
          border-color: #ff00ff;
        }
      `}</style>
    </div>
  )
}

export default PowerCard 
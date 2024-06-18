import React, { useState, useRef, useEffect } from 'react';
import './index.scss';

function App() {
  const [cards, setCards] = useState([]);
  const [cardsInPlay, setCardsInPlay] = useState([]);
  const [sets, setSets] = useState([]);
  const createDeck = () => {
    const cards = [];
    for (let amount = 0; amount < 3; amount += 1) {
      for (let color = 0; color < 3; color += 1) {
        for (let shape = 0; shape < 3; shape += 1) {
          for (let shade = 0; shade < 3; shade += 1) {
            cards.push({ amount, color, shape, shade, inSet: false });
          }
        }
      }
    }
    return cards;
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const dealCards = () => {
    const newCardsInPlay = cards.slice(0, 12);
    const remainingCards = cards.slice(12);

    setCardsInPlay(newCardsInPlay);
    setCards(remainingCards);
  };

  const findSets = () => {
    const { length } = cardsInPlay;
    const potentialSets = [];
    for (let first = 0; first < length; first += 1) {
      for (let second = 0; second < length; second += 1) {
        for (let third = 0; third < length; third += 1) {
          if (first !== second && first !== third && second !== third) {
            potentialSets.push(
              [{
                index: first,
                card: cardsInPlay[first],
                inSet: false,
              }, {
                index: second,
                card: cardsInPlay[second],
                inSet: false,
              }, {
                index: third,
                card: cardsInPlay[third],
                inSet: false,
              }],
            );
          }
        }
      }
    }

    const allSameOrDifferent = (set, p) => {
      const allSame = set[0][p] === set[1][p] && set[1][p] === set[2][p];
      const allDifferent = set[0][p] !== set[1][p] && set[0][p] !== set[2][p] && set[1][p] !== set[2][p];
      return allSame || allDifferent;
    };

    const actualSets = [];
    for (let i = 0; i < potentialSets.length; i += 1) {
      const set = potentialSets[i];
      const allAmountsSameOrDifferent = allSameOrDifferent([set[0].card, set[1].card, set[2].card], 'amount');
      const allColorsSameOrDifferent = allSameOrDifferent([set[0].card, set[1].card, set[2].card], 'color');
      const allShapesSameOrDifferent = allSameOrDifferent([set[0].card, set[1].card, set[2].card], 'shape');
      const allShadesSameOrDifferent = allSameOrDifferent([set[0].card, set[1].card, set[2].card], 'shade');
      if (allAmountsSameOrDifferent && allColorsSameOrDifferent && allShapesSameOrDifferent && allShadesSameOrDifferent) actualSets.push(set);
    }
    setSets(actualSets);
  };

  const showSet = () => {
    const randomSet = sets[Math.floor(Math.random() * sets.length)];
    setCardsInPlay((prevSets) => {
      const nextCards = [...prevSets];
      nextCards.forEach((card) => { card.inSet = false; });
      nextCards[randomSet[0].index].inSet = true;
      nextCards[randomSet[1].index].inSet = true;
      nextCards[randomSet[2].index].inSet = true;
      return nextCards;
    });
    // console.log(randomSet);
  };

  useEffect(() => {
    setCards(shuffle(createDeck()));
  }, []);

  return (
    <div className="app">
      <h1>SET!</h1>
      <div className="cards">
        {cardsInPlay.map(({ amount, color, shape, shade, inSet }, index) => (
          <div className={`cards-card color-${color} ${inSet ? 'selected' : ''}`}>
            {Array.from({ length: amount + 1 }).map(() => (
              <img className={`color-${color}`} src={`${shape}${shade}.svg`} />
            ))}
          </div>
        ))}
      </div>

      <button type="button" onClick={() => { setCards(shuffle(cards)); }}>Shuffle</button>
      <button type="button" onClick={dealCards}>Deal</button>
      <button type="button" onClick={findSets}>Find Sets</button>
      <button type="button" onClick={showSet}>Show Set</button>
    </div>
  );
}

export default App;

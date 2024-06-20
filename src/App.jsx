import React, { useEffect } from 'react';
import { sequential, layers, train, tensor2d, tensor1d } from '@tensorflow/tfjs';

import './index.scss';

let cards = [];
let cardsInPlay = [];
let sets = [];

function App() {
  const createDeck = () => {
    const nextCards = [];
    for (let amount = 1; amount <= 3; amount += 1) {
      for (let color = 1; color <= 3; color += 1) {
        for (let shape = 1; shape <= 3; shape += 1) {
          for (let shade = 1; shade <= 3; shade += 1) {
            nextCards.push({ amount, color, shape, shade, inSet: false });
          }
        }
      }
    }
    return nextCards;
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const dealCards = () => {
    const newCardsInPlay = cards.slice(0, 12);
    const remainingCards = cards.slice(12);

    cardsInPlay = newCardsInPlay;
    cards = remainingCards;
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
      if (allAmountsSameOrDifferent
        && allColorsSameOrDifferent
        && allShapesSameOrDifferent
        && allShadesSameOrDifferent) actualSets.push(set);
    }
    sets = actualSets;
  };

  const showSet = () => {
    const randomSet = sets[Math.floor(Math.random() * sets.length)];
    cardsInPlay.forEach((card) => { card.inSet = false; });
    randomSet.forEach(({ index }) => {
      cardsInPlay[index].inSet = true;
    });
  };

  useEffect(() => {
    const inputs = [];
    const outputs = [];
    for (let i = 0; i < 1000000; i += 1) {
      cards = shuffle(createDeck());
      dealCards();
      findSets();
      if (sets.length) {
        const input = cardsInPlay.map(({ amount, color, shape, shade }) => (Number(`${amount}${color}${shape}${shade}`)));
        const output = sets[Math.floor(Math.random() * sets.length)].map(({ index }) => index);
        inputs.push(input);
        outputs.push(output);
      }
    }
    const inputTensor = tensor2d(inputs);
    const outputTensor = tensor2d(outputs);
    const model = sequential();
    model.add(layers.dense({ units: 64, activation: 'relu', inputShape: [inputTensor.shape[1]] }));
    model.add(layers.dense({ units: 32, activation: 'relu' }));
    model.add(layers.dense({ units: outputTensor.shape[1] }));

    model.compile({
      optimizer: train.adam(),
      loss: 'meanSquaredError',
      metrics: ['mse'],
    });

    const onEpochEnd = async (epoch, logs) => {
      console.log(`Epoch ${epoch + 1} - loss: ${logs.loss}`);
    };

    model.fit(inputTensor, outputTensor, {
      epochs: 25,
      validationSplit: 0.2,
      callbacks: { onEpochEnd },
    }).then((res) => {
      console.log('training complete', res);
      model.save('downloads://my-model');
      for (let i = 0; i < 10; i += 1) {
        cards = shuffle(createDeck());
        dealCards();
        const testInput = cardsInPlay.map(({ amount, color, shape, shade }) => Number(`${amount}${color}${shape}${shade}`));
        const testTensor = tensor2d([testInput]);
        console.log(cardsInPlay);
        model.predict(testTensor).print();
      }
    });
  }, []);

  return (
    <div className="app">
      <h1>SET!</h1>
      <div className="cards">
        {cardsInPlay.map(({ amount, color, shape, shade, inSet }, index) => (
          <div key={index} className={`cards-card color-${color} ${inSet ? 'selected' : ''}`}>
            {Array.from({ length: amount }).map((_, i) => (
              <img key={i} className={`color-${color}`} src={`${shape}${shade}.svg`} alt={`${shape} ${shade}`} />
            ))}
          </div>
        ))}
      </div>

      <button type="button" onClick={() => { cards = shuffle(cards); }}>Shuffle</button>
      <button type="button" onClick={dealCards}>Deal</button>
      <button type="button" onClick={findSets}>Find Sets</button>
      <button type="button" onClick={showSet}>Show Set</button>
    </div>
  );
}

export default App;

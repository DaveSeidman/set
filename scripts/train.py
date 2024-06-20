import tensorflow as tf
import numpy as np
import random

cards = []
cards_in_play = []
sets = []

def create_deck():
    next_cards = []
    for amount in range(1, 4):
        for color in range(1, 4):
            for shape in range(1, 4):
                for shade in range(1, 4):
                    next_cards.append({'amount': amount, 'color': color, 'shape': shape, 'shade': shade, 'inSet': False})
    return next_cards

def shuffle(array):
    random.shuffle(array)
    return array

def deal_cards():
    global cards, cards_in_play
    cards_in_play = cards[:12]
    cards = cards[12:]

def find_sets():
    global sets
    potential_sets = []
    for first in range(len(cards_in_play)):
        for second in range(len(cards_in_play)):
            for third in range(len(cards_in_play)):
                if first != second and first != third and second != third:
                    potential_sets.append(
                        [
                            {'index': first, 'card': cards_in_play[first], 'inSet': False},
                            {'index': second, 'card': cards_in_play[second], 'inSet': False},
                            {'index': third, 'card': cards_in_play[third], 'inSet': False}
                        ]
                    )

    def all_same_or_different(set, p):
        all_same = set[0][p] == set[1][p] and set[1][p] == set[2][p]
        all_different = set[0][p] != set[1][p] and set[0][p] != set[2][p] and set[1][p] != set[2][p]
        return all_same or all_different

    actual_sets = []
    for set in potential_sets:
        all_amounts_same_or_different = all_same_or_different([set[0]['card'], set[1]['card'], set[2]['card']], 'amount')
        all_colors_same_or_different = all_same_or_different([set[0]['card'], set[1]['card'], set[2]['card']], 'color')
        all_shapes_same_or_different = all_same_or_different([set[0]['card'], set[1]['card'], set[2]['card']], 'shape')
        all_shades_same_or_different = all_same_or_different([set[0]['card'], set[1]['card'], set[2]['card']], 'shade')
        if all_amounts_same_or_different and all_colors_same_or_different and all_shapes_same_or_different and all_shades_same_or_different:
            actual_sets.append(set)
    sets = actual_sets

def show_set():
    random_set = random.choice(sets)
    for card in cards_in_play:
        card['inSet'] = False
    for item in random_set:
        cards_in_play[item['index']]['inSet'] = True

inputs = []
outputs = []
for _ in range(10000):
    cards = shuffle(create_deck())
    deal_cards()
    find_sets()
    if sets:
        input = [int(f"{card['amount']}{card['color']}{card['shape']}{card['shade']}") for card in cards_in_play]
        output = [item['index'] for item in random.choice(sets)]
        inputs.append(input)
        outputs.append(output)

input_tensor = tf.convert_to_tensor(inputs)
output_tensor = tf.convert_to_tensor(outputs)
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(input_tensor.shape[1],)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(output_tensor.shape[1])
])

model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mse'])

class CustomCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        print(f"Epoch {epoch + 1} - loss: {logs['loss']}")

model.fit(input_tensor, output_tensor, epochs=25, validation_split=0.2, callbacks=[CustomCallback()])

model.save('my_model.h5')

for _ in range(10):
    cards = shuffle(create_deck())
    deal_cards()
    test_input = np.array([[int(f"{card['amount']}{card['color']}{card['shape']}{card['shade']}") for card in cards_in_play]])
    test_tensor = tf.convert_to_tensor(test_input)
    print(cards_in_play)
    print(model.predict(test_tensor))

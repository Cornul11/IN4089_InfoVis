import os
import pandas as pd


def load_data():
    matches = pd.read_csv(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data/matches.csv'))
    players = pd.read_csv(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data/match_players.csv'))
    return matches, players

import os
import pandas as pd
from flask import g


def load_data():
    g.matches = pd.read_csv(os.path.dirname(__file__) + '/data/matches.csv')
    g.players = pd.read_csv(os.path.dirname(__file__) + '/data/match_players.csv')

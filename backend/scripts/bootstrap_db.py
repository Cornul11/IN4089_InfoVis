import pandas as pd
import sqlite3
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

logger.info("Loading CSV files")
matches = pd.read_csv("data/matches.csv")
players = pd.read_csv("data/match_players.csv")
logger.info("Loading CSV files complete")

logger.info("Pushing data to the database")
conn = sqlite3.connect("test.sqlite")
matches.to_sql(name="matches", con=conn)
players.to_sql(name="players", con=conn)
logger.info("Data transfer complete")

import json
import sqlite3

DATABASE = "../aoe.sqlite"


def get_db():
    db = sqlite3.connect(DATABASE)
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


token_rows = query_db("SELECT token FROM matches;")
player_rows = query_db("SELECT * FROM players;")

opponents_rows = [(x[2], x[1], x[5]) for x in player_rows]
filtered_players = filter(lambda x: any(x[1] == y for y in token_rows), player_rows)
vs_df = [
    (x[1], x[2], x[3], x[4], x[5], x[6], x[7], y[1], y[2])
    for x in filtered_players
    for y in opponents_rows
    if x[2] == y[0]
]
vs_df = filter(lambda x: x[0] != x[7], vs_df)
# wins_r = vs_df.pivot_table(
#     values="winner", index="civ", columns="opponent_civ"
# ).to_dict()

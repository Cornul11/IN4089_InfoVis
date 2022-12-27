import time

import pandas as pd

from aoe.db import query_db, df_from_query


def elo_match_distribution(map=None, civ=None):
    """
    This function returns the distribution of matches based on the average rating of players in those matches. The
     distribution is returned as a list of dictionaries, where each dictionary contains the following keys:
        - frequency: the number of matches that fall within a certain rating range
        - range: the rating range for the frequency count

    The function can also filter the distribution based on the map and/or civilization played in the match.

    Args:
        map (str, optional): The map played in the matches. If provided, the distribution will only include matches
        played on this map.
        civ (str, optional): The civilization played in the matches. If provided, the distribution will only include
        matches where players used this civilization.

    Returns:
        list: A list of dictionaries containing the frequency and range for each rating bin.
    """
    # Set the query string and arguments based on the provided parameters
    query_str = "SELECT FLOOR(matches.average_rating / 100) * 100 AS rating_range, COUNT(*) AS frequency"
    query_str += " FROM matches"
    query_args = []
    where_clauses = []
    if map:
        where_clauses.append("matches.map = ?")
        query_args.append(map)
    if civ:
        query_str += " INNER JOIN players ON matches.token = players.match"
        where_clauses.append("players.civ = ?")
        query_args.append(civ)
    if where_clauses:
        query_str += f" WHERE {' AND '.join(where_clauses)}"
    query_str += " GROUP BY rating_range ORDER BY rating_range ASC"

    # Execute the query and return the results as a list of dictionaries
    rows = query_db(query_str, query_args)
    return [{"frequency": x[1], "range": x[0]} for x in rows]


def global_civ_stats(players_m: pd.DataFrame, elo_s: int, elo_e: int) -> dict:
    """
    {Inca: {
        win_rate: 11
        popularity: 100

    },
        Aztec: {
            ...
        }
    }
    """
    # remove entries from df that aren't in the elo interval
    df = players_m[players_m["rating"].between(elo_s, elo_e)]
    civs = df["civ"].unique()
    res_dict = {}
    for civ in civs:
        df_civ = df.loc[df["civ"] == civ]
        total_inst = len(df_civ)
        win_inst = len(df_civ.loc[df_civ["winner"]])
        civ_entry = {
            "popularity": total_inst,
            "win_rate": (win_inst / total_inst) * 100,
        }
        res_dict[civ] = civ_entry
    return res_dict


def game_type(map=None, civ=None, elo_s=0, elo_e=4000) -> dict:
    """
    Retrieve the frequency of games played for a given map and/or civilization, within a given ELO range.

    Parameters:
    - map (str): The map for which to retrieve game frequencies. If not provided, frequencies will be returned for all maps.
    - civ (str): The civilization for which to retrieve game frequencies. If not provided, frequencies will be returned for all civilizations.
    - elo_s (int): The lower bound of the ELO range for which to retrieve game frequencies. Default is 0.
    - elo_e (int): The upper bound of the ELO range for which to retrieve game frequencies. Default is 4000.

    Returns:
    - dict: A dictionary containing the frequencies of games played for the given parameters. The dictionary keys are the ladders, and the values are the frequencies.
    """
    # Set the query string and arguments based on the provided parameters
    query_str = "SELECT m.ladder, count(*) AS frequency FROM matches m"
    query_args = []
    where_clauses = []
    if map:
        where_clauses.append("m.map = ?")
        query_args.append(map)
    if civ:
        query_str += " JOIN players p ON m.token = p.match"
        where_clauses.append("p.civ = ?")
        query_args.append(civ)
    if elo_s or elo_e:
        where_clauses.append("m.average_rating BETWEEN ? AND ?")
        query_args += [elo_s, elo_e]
    if where_clauses:
        query_str += f" WHERE {' AND '.join(where_clauses)}"
    query_str += " GROUP BY m.ladder"

    # Execute the query and return the results as a dictionary
    rows = query_db(query_str, query_args)
    return dict(rows)


# TODO: this need a full overhaul, it's incredibly slow
def heatmap_data(elo_s: int = None, elo_e: int = None):
    if elo_s is not None and elo_e is not None:
        token_rows = query_db(
            "SELECT token \
                FROM matches \
                WHERE average_rating BETWEEN ? AND ?;",
            [elo_s, elo_e],
        )
    else:
        token_rows = query_db("SELECT token FROM matches;")

    player_rows = query_db("SELECT * FROM players;")
    # player_rows schema:
    # x[0]  x[1]  x[2]   x[3]   x[4]  x[5] x[6] x[7]
    # index token match  rating color civ  team winner

    opponents_rows = [(x[2], x[1], x[5]) for x in player_rows]
    # opponents_rows schema:
    # x[0]  x[1]     x[2]
    # match opponent opponent_civ

    filtered_players = filter(lambda x: any(x[1] == y for y in token_rows), player_rows)
    # filtered_players schema:
    # x[0]  x[1]  x[2]   x[3]   x[4]  x[5] x[6] x[7]
    # index token match  rating color civ  team winner

    vs_df = [
        (x[1], x[2], x[3], x[4], x[5], x[6], x[7], y[1], y[2])
        for x in filtered_players
        for y in opponents_rows
        if x[2] == y[0]
    ]
    # vs_df schema:
    # x[0]   x[1]   x[2]   x[3]  x[4] x[5] x[6]   x[7]     x[8]
    # player match  rating color civ  team winner opponent opponent_civ

    vs_df = filter(lambda x: x[0] != x[7], vs_df)

    # up until here seems to do just as in the original code, but way slower.
    # will comment the rest because it doesn't work anyway

    wins_r = vs_df.pivot_table(
        values="winner", index="civ", columns="opponent_civ"
    ).to_dict()

    # csv_conversion TODO: this is really slow apparently
    string = "civ,ociv,val"
    for civ, content in wins_r.items():
        for ociv, val in content.items():
            string += "\n" + civ + "," + ociv + "," + str(val)

    return string


def winrate_data(elo_s: int = None, elo_e: int = None, civ: str = None):
    csv = "patch,amount"

    wins = df_from_query(f"SELECT match FROM players WHERE winner is True AND civ=\"{civ}\";")

    patches = [35584, 36202, 36906, 37650, 37906, 39284, 39515, 40220, 40874, 41855, 42848, 43210]
    for patch in patches:
        if elo_s is not None and elo_e is not None:
            matches = df_from_query(
                f"SELECT token FROM matches WHERE patch={patch} AND average_rating BETWEEN {elo_s} AND {elo_e}")
        else:
            matches = df_from_query(f"SELECT token FROM matches WHERE patch={patch}")

        matches = matches.token.unique()
        amount = wins[wins['match'].isin(matches)].shape[0]
        csv += '\n' + str(patch) + ',' + str(amount)

    return csv

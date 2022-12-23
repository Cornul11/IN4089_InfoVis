import pandas as pd

from aoe.db import query_db


def elo_match_distribution(map=None, civ=None):
    """
    Returns a list of dictionaries containing the frequency and range of ELO ratings for each bin
     in a histogram of ELO ratings for all matches.

    :return: A list of dictionaries with keys 'frequency' and 'range', representing the frequency
     and range of ELO ratings for each bin, respectively.
    """
    if map and civ:
        query_str = "SELECT FLOOR(matches.average_rating / 100) * 100 AS rating_range, \
                            COUNT(*)                                  AS frequency \
                     FROM matches \
                              INNER JOIN players ON matches.token = players.match \
                     WHERE players.civ = ? \
                       AND matches.map = ? \
                     GROUP BY rating_range \
                     ORDER BY rating_range ASC;"
        query_args = [civ, map]
    elif civ:
        query_str = "SELECT FLOOR(matches.average_rating / 100) * 100 AS rating_range, \
                            COUNT(*)                                  AS frequency \
                     FROM matches \
                              INNER JOIN players ON matches.token = players.match \
                     WHERE players.civ = ? \
                     GROUP BY rating_range \
                     ORDER BY rating_range ASC;"
        query_args = [civ]
    elif map:
        query_str = "SELECT FLOOR(average_rating / 100.00) * 100 AS bin_floor, \
                            COUNT(`index`)                       AS count \
                     FROM matches \
                     WHERE map IS ? \
                     GROUP BY 1 \
                     ORDER BY 1;"
        query_args = [map]
    else:
        query_str = "SELECT FLOOR(average_rating / 100.00) * 100 AS bin_floor, \
                            COUNT(`index`)                       AS count \
                     FROM matches \
                     GROUP BY 1 \
                     ORDER BY 1;"
        query_args = []

    rows = query_db(query_str, query_args)

    results = [{"frequency": x[1], "range": x[0]} for x in rows]
    return results


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


def game_type(elo_s=0, elo_e=4000) -> dict:
    """
    Returns a dictionary containing the frequencies of different game types (ladders) within a certain ELO range.

    :param elo_s: The lower bound of the ELO range (inclusive). Default is 0.
    :param elo_e: The upper bound of the ELO range (inclusive). Default is 4000.
    :return: A dictionary with ladders as keys and frequencies as values.
    """
    rows = query_db(
        "select ladder, count(*) as frequency \
        from matches \
        where average_rating between ? and ?\
        group by ladder;",
        [elo_s, elo_e],
    )
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

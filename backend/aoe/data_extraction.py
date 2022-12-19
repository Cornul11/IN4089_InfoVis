import pandas as pd


def elo_match_distribution(matches: pd.DataFrame) -> dict:
    average_rating = matches['average_rating']
    new_entry = pd.Series([0])
    average_rating = pd.concat([average_rating, new_entry], ignore_index=True)

    s = pd.cut(average_rating, bins=54).value_counts().rename("frequency").to_frame()
    s.reset_index(inplace=True)
    s = s.rename(columns={'index': 'range'}).sort_values(by='range')
    s['range'] = s['range'].apply(lambda x: x.right)
    s.iloc[0, 1] -= 1

    return s.to_dict("records")


def global_civ_stats(players_m: pd.DataFrame, elo_s: int, elo_e: int) -> dict:
    '''
    {Inca: {
            win_rate: 11
            popularity: 100

            },
     Aztec: {
            ...
            }
    }
    '''
    # remove entries from df that aren't in the elo interval
    df = players_m[players_m['rating'].between(elo_s, elo_e)]
    civs = df['civ'].unique()
    res_dict = {}
    for civ in civs:
        df_civ = df.loc[df['civ'] == civ]
        total_inst = len(df_civ)
        win_inst = len(df_civ.loc[df_civ['winner']])
        civ_entry = {
            "popularity": total_inst,
            "win_rate": (win_inst / total_inst) * 100
        }
        res_dict[civ] = civ_entry
    return res_dict


def game_type(matches: pd.DataFrame, elo_s=0, elo_e=4000) -> dict:
    df = matches[matches['average_rating'].between(elo_s, elo_e)]
    df = df['ladder']
    s = df.value_counts().rename("amount").to_frame()
    s.reset_index(inplace=True)
    s = s.rename(columns={'index': 'type'}).sort_values(by='amount')
    res = {}
    for _, row in s.iterrows():
        res[row['type']] = row['amount']
    return res

def heatmap_data(matches: pd.DataFrame, players: pd.DataFrame, elo_s: int = None, elo_e: int = None):
    if elo_s is not None and elo_e is not None:
        token = matches[matches['average_rating'].between(elo_s, elo_e)]['token']
    else:
        token = matches['token']
    renames = {
        "token": "opponent",
        "civ": "opponent_civ",
    }
    opponents = players[["match", "token", "civ"]].rename(columns=renames)
    filtered_players = players[players['match'].isin(token)]
    vs_df = pd.merge(filtered_players, opponents, left_on="match", right_on="match").rename(columns={"token": "player"})
    vs_df = vs_df[vs_df["player"] != vs_df["opponent"]]
    wins_r = vs_df.pivot_table(values="winner", index="civ", columns="opponent_civ").to_dict()

    # csv_conversion TODO: this is really slow apparently
    string = "civ,ociv,val"
    for civ, content in wins_r.items():
        for ociv, val in content.items():
            string += '\n' + civ + "," + ociv + "," + str(val)

    return string

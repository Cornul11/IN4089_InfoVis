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
            "win_rate": (win_inst/total_inst)*100
        }
        res_dict[civ] = civ_entry
    return res_dict


def game_type(matches: pd.DataFrame) -> dict:
    df = matches['ladder']
    s = df.value_counts().rename("amount").to_frame()
    s.reset_index(inplace=True)
    s = s.rename(columns={'index': 'type'}).sort_values(by='amount')
    res = {}
    for _, row in s.iterrows():
        res[row['type']] = row['amount']
    return res


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
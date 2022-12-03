import pandas as pd


def elo_match_distribution(matches: pd.DataFrame) -> dict:
    average_rating = matches['average_rating']
    histogram = average_rating.value_counts().rename("frequency").to_frame()
    histogram.reset_index(inplace=True)
    histogram = histogram.rename(columns={'index': 'average_rating'})
    return histogram.to_dict("records")


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
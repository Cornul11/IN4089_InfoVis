import os

from flask import Flask, request, jsonify, make_response

from aoe.data_extraction import (
    elo_match_distribution,
    global_civ_stats,
    game_type,
    heatmap_data,
)
from aoe.db import init_db_app

app = Flask(__name__)

init_db_app(app)

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass


@app.route("/api/v1/match_elos", methods=["GET"])
def match_elo():
    civilization = request.args.get("civ")
    map = request.args.get("map")
    # TODO: figure out if we use the jsonify or flask-cors
    if civilization and map:
        response = jsonify(elo_match_distribution(civ=civilization, map=map))
    elif civilization:
        response = jsonify(elo_match_distribution(civ=civilization))
    elif map:
        response = jsonify(elo_match_distribution(map=map))
    else:
        response = jsonify(elo_match_distribution())
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


# Seems to be unused so I'll just remove it for now

# @app.route("/api/v1/global_civ_stats", methods=['GET'])
# def g_civ_stats():
#     if request.method == 'GET':  # Necessary?
#         elo_start = int(request.args.get('elo_s'))
#         elo_end = int(request.args.get('elo_e'))
#         test = global_civ_stats(players_m, elo_start, elo_end)
#     return test


@app.route("/api/v1/game_type_stats", methods=["GET"])
def game_types_stats():
    if request.method == "GET":
        elo_start = request.args.get("elo_s")
        elo_end = request.args.get("elo_e")
        if not elo_start or not elo_end:
            response = jsonify(game_type())
        else:
            pass
            response = jsonify(game_type(int(elo_start), int(elo_end)))
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response


@app.route("/api/v1/heatmap_civs", methods=["GET"])
def heatmap_civs():
    if request.method == "GET":
        elo_start = request.args.get("elo_s")
        elo_end = request.args.get("elo_e")
        if not elo_start or not elo_end:
            response = make_response(heatmap_data())
        else:
            response = make_response(heatmap_data(int(elo_start), int(elo_end)))
        response.headers["Content-Disposition"] = "attachment; filename=export.csv"
        response.headers["Content-Type"] = "text/csv"
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

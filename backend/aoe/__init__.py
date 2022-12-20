import os

from flask import Flask, request, jsonify, make_response

from aoe.data import load_data
from aoe.data_extraction import elo_match_distribution, global_civ_stats, game_type, heatmap_data


def create_app():
    app = Flask(__name__)

    matches, players_m = load_data()

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/")
    def hello_world():
        return "<p>Hello, World!</p>" + str(matches['patch'].unique())

    @app.route("/api/v1/match_elos", methods=['GET'])
    def match_elo():
        # TODO: figure out if we use the jsonify or flask-cors
        response = jsonify(elo_match_distribution(matches))
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    @app.route("/api/v1/global_civ_stats", methods=['GET'])
    def g_civ_stats():
        if request.method == 'GET':  # Necessary?
            elo_start = int(request.args.get('elo_s'))
            elo_end = int(request.args.get('elo_e'))
            test = global_civ_stats(players_m, elo_start, elo_end)
        return test

    @app.route("/api/v1/game_type_stats", methods=['GET'])
    def game_types_stats():
        if request.method == 'GET':
            elo_start = request.args.get('elo_s')
            elo_end = request.args.get('elo_e')
            if not elo_start or not elo_end:
                response = jsonify(game_type(matches))
            else:
                response = jsonify(game_type(matches, int(elo_start), int(elo_end)))
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

    @app.route("/api/v1/heatmap_civs", methods=['GET'])
    def heatmap_civs():
        if request.method == 'GET':
            elo_start = request.args.get('elo_s')
            elo_end = request.args.get('elo_e')
            if not elo_start or not elo_end:
                response = make_response(heatmap_data(matches, players_m))
            else:
                response = make_response(heatmap_data(matches, players_m, int(elo_start), int(elo_end)))
            response.headers["Content-Disposition"] = "attachment; filename=export.csv"
            response.headers["Content-Type"] = "text/csv"
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

    return app

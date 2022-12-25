import sqlite3
import pandas as pd

from flask import g

DATABASE = "aoe.sqlite"


def init_db_app(app):
    app.teardown_appcontext(close_connection)


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def df_from_query(query):
    con = getattr(g, "_database", None)
    df = pd.read_sql_query(query, con)
    return df


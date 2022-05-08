import sqlite3


db = sqlite3.connect("../db.sqlite")

cursor = db.cursor()

with open("trophies.csv") as file:
    lines = file.read().split("\n")
    for line in lines:
        data = line.split(",")
        map = data[0]
        fishes = data[1]
        if fishes == "":
            continue
        map_id = cursor.execute(
            f"select id from maps where name='{map}'").fetchone()

        if not map_id:
            continue
        map_id = map_id[0]
        fishes = fishes.split(";")
        for fish in fishes:
            query = f"select id from fishes where name='{fish}'"

            id = cursor.execute(query).fetchone()
            if not id:
                print(fish)
                continue
            id = id[0]
            db.commit()

            query = f"INSERT INTO map_trophies VALUES(null,{map_id},{id})"

            cursor.execute(query)
            db.commit()

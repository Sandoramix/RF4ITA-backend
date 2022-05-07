import sqlite3


db = sqlite3.connect("../db.sqlite")

cursor = db.cursor()

with open("spots.csv") as file:
    lines = file.read().split("\n")
    for line in lines:
        data = line.split(",")
        map = data[0]
        spots_raw = data[1]
        if spots_raw == "":
            continue
        map_id = cursor.execute(
            f"select id from maps where name='{map}'").fetchone()

        if not map_id:
            print(map)
            continue
        map_id = map_id[0]
        spots = spots_raw.split(" ")
        for spot in spots:
            splitted = spot.split(":")
            x = splitted[0]
            y = splitted[1]

            query = f"INSERT INTO spots VALUES(null,{map_id},{x},{y})"
            print(query)
            cursor.execute(query)
            db.commit()

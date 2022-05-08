import sqlite3


db = sqlite3.connect("../db.sqlite")

cursor = db.cursor()

with open("fishes.csv") as file:
    fishes = file.read().split("\n")
    for fish in fishes:
        data = fish.split(",")

        name = data[0]

        update = False

        query = f"SELECT * FROM fishes WHERE name='{name}'"
        fish = cursor.execute(query).fetchone()

        trophy = data[1]
        trophy = trophy if trophy != "null" else None

        super_trophy = data[2]
        super_trophy = super_trophy if super_trophy != "null" else None

        query = f"INSERT INTO fishes VALUES(null,'{name}',null,"
        query += trophy if trophy != None else 'null'
        query += "," + super_trophy if super_trophy != None else ',null'
        query += ",null)"

        if fish != None:
            query = f"UPDATE fishes set super_trophy={super_trophy if super_trophy != None else 'null'},trophy={trophy if trophy != None else 'null'} where name={name}"

        fish = cursor.execute(query)
        db.commit()

        fish_id = fish.lastrowid

        foundInMaps = data[3].split(" ")

        for map in foundInMaps:

            query = f"INSERT INTO map_fishes VALUES(null,(select id from maps where name='{map}'),{fish_id})"
            cursor.execute(query)
            db.commit()

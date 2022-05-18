from PIL import Image

from itertools import product

import os
import sys


def tile(dir_in, x, y, z, ):

    for (root, dirs, files) in os.walk(dir_in):
        dir_out = root
        print(root,  files)
        for file in files:
            if not file[0].isupper():
                continue
            name, ext = os.path.splitext(file)
            img = Image.open(os.path.join(root, file))
            w, h = img.size
            # out = os.path.join(root, f'{str(z-1)}_0_0{ext}')
            # img.save(out)

            height_split = h//y
            width_split = w//x
            for i in range(0, y):
                for j in range(0, x):
                    left = i*width_split
                    upper = j*height_split
                    box = (left, upper, left+width_split, upper+height_split)

                    out = os.path.join(dir_out, f'{z}_{i}_{j}{ext}')
                    if not os.path.exists(out):
                        img.crop(box).save(out)


args = sys.argv
if len(args) < 5:
    exit(" usage: z x y folder")

directory = sys.argv[4]

x = int(sys.argv[3])
y = int(sys.argv[2])
z = int(sys.argv[1])


tile(directory, x, y, z)

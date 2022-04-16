const mapTarget = document.querySelector(`#place`);

const maps = {
    thecottagepond: {
        x: {
            min: 4,
            max: 20,
        },
        y: {
            min: 4,
            max: 20,
        },
    },
    mosquitolake: {
        x: {
            min: 33,
            max: 109,
        },
        y: {
            min: 36,
            max: 112,
        },
    },
    windingrivulet: {
        x: {
            min: 48,
            max: 138,
        },
        y: {
            min: 57,
            max: 147,
        },
    },
    oldburglake: {
        x: {
            min: 1,
            max: 80,
        },
        y: {
            min: 1,
            max: 80,
        },
    },
    belayalake: {
        x: {
            min: 3,
            max: 110,
        },
        y: {
            min: -4,
            max: 103,
        },
    },
    kuorilake: {
        x: {
            min: 56,
            max: 146,
        },
        y: {
            min: 56,
            max: 146,
        },
    },
    bearklake: {
        x: {
            min: 8,
            max: 92,
        },
        y: {
            min: 6,
            max: 90,
        },
    },
    volkhovriver: {
        x: {
            min: 0,
            max: 200,
        },
        y: {
            min: 0,
            max: 200,
        },
    },
    severskydonetsriver: {
        x: {
            min: 13,
            max: 189,
        },
        y: {
            min: 11,
            max: 187,
        },
    },
    surariver: {
        x: {
            min: 1,
            max: 157,
        },
        y: {
            min: 3,
            max: 159,
        },
    },
    ladogariver: {
        x: {
            min: 8,
            max: 98,
        },
        y: {
            min: 3,
            max: 93,
        },
    },
    theamberlake: {
        x: {
            min: 6,
            max: 186,
        },
        y: {
            min: 25,
            max: 205,
        },
    },
    ladogaarchipelago: {
        x: {
            min: 0,
            max: 599,
        },
        y: {
            min: 0,
            max: 599,
        },
    },
    akhtubariver: {
        x: {
            min: 2,
            max: 200,
        },
        y: {
            min: 1,
            max: 199,
        },
    },
    lowertunguskariver: {
        x: {
            min: 0,
            max: 240,
        },
        y: {
            min: 1,
            max: 241,
        },
    },
    yamariver: {
        x: {
            min: 0,
            max: 298,
        },
        y: {
            min: 1,
            max: 299,
        },
    },
};

var xx = 0;
Object.keys(maps).forEach((m) => {
    let el = document.createElement(`option`);
    if (xx == 0) {
        el.selected = true;
        xx++;
    }
    el.value = m;
    el.innerText = m;
    mapTarget.append(el);
});
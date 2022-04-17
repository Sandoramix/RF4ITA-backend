const mapTarget = document.querySelector(`#place`);

const MAPS = {
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

for (let j = 0; j < Object.keys(MAPS).length; j++) {
	let el = document.createElement(`option`);
	if (j == 0) el.selected = true;

	let name = Object.keys(MAPS)[j];
	el.value = name;
	el.innerText = name;
	mapTarget.append(el);
}
const SEARCH_LATLNG_BTN = document.querySelector(`#coordsSearch`),
	SEARCH_LNG = document.querySelector(`#search-x`),
	SEARCH_LAT = document.querySelector(`#search-y`),
	MAP_CNT = document.querySelector(`#map-container`),
	LEAFLET_MAP = document.querySelector(`#map`),
	COORDS_CONTENT = document.querySelector(`#coords`),
	IMG_OUTER_SIZE = 1024,
	IMG_MIN_INNER_PX = 42,
	IMG_MAX_INNER_PX = 982,
	OUTER_BOUNDS = [
		[0, 0],
		[IMG_OUTER_SIZE, IMG_OUTER_SIZE],
	],
	INNER_BOUNDS = [
		[IMG_MIN_INNER_PX, IMG_MIN_INNER_PX],
		[IMG_MAX_INNER_PX, IMG_MAX_INNER_PX],
	],
	IMG_INNER_SIZE = IMG_OUTER_SIZE - IMG_MIN_INNER_PX * 2;

var currentMap = MAPS["thecottagepond"],
	layerObject = document.createElement(`object`),
	leafletMap = L.map(`map`, {}),
	currentCoordinateCircle = L.circleMarker(),
	mapTileLayer = L.tileLayer(),
	layerObject = document.createElement(`object`),
	layerGroup,
	xRatio = 0,
	yRatio = 0,
	x = 0,
	y = 0;

updateMap(`thecottagepond`);

function updateMap(map_name) {
	if (!MAPS[map_name]) return;
	currentMap = MAPS[map_name];
	xRatio = IMG_INNER_SIZE / (currentMap.x.max - currentMap.x.min);
	yRatio = IMG_INNER_SIZE / (currentMap.y.max - currentMap.y.min);

	LEAFLET_MAP.innerHTML = `<div id="map"></div>`;
	if (leafletMap) {
		leafletMap.invalidateSize();
		leafletMap.off();
		leafletMap.remove();
	}

	if (map_name === ``) return;

	mapTileLayer = new L.tileLayer(`http://localhost/MAPS/${map_name}/{z}_{x}_{y}.jpg`, {
		minZoom: 0,
		maxZoom: 2,
		noWrap: true,
		attribution: 'Map inspired by &copy; <a href="https://rf4.info">rf4.info</a>',
	});

	var customCRS = L.extend(L.CRS.Simple, {
		projection: L.extend(L.Projection.LonLat, {
			bounds: L.bounds([0, 0], [IMG_OUTER_SIZE, IMG_OUTER_SIZE]),
		}),
		transformation: new L.Transformation(1, 0, 1, 0),
		scale: function (zoom) {
			return Math.pow(2, zoom - 2);
		},
		infinite: false,
	});

	var obj = document.createElement("object");
	obj.type = "image/svg+xml";
	obj.data = `http://localhost/MAPS/${map_name}/ground`;

	var grOverlay = L.svgOverlay(obj, OUTER_BOUNDS);

	var allLayers = [mapTileLayer, grOverlay];

	leafletMap = L.map("map", {
		crs: customCRS,
		layers: allLayers,
		maxBounds: OUTER_BOUNDS,
		doubleClickZoom: false,
	}).setView([0, 0], 1);

	L.DomUtil.addClass(leafletMap._container, "crosshair-cursor");

	L.control
		.layers(
			{},
			{
				Ground: grOverlay,
			}
		)
		.setPosition("topleft")
		.addTo(leafletMap);

	leafletMap.on("click", (ev) => {
		y = IMG_OUTER_SIZE - ev.latlng.lat;
		x = ev.latlng.lng;
	});

	leafletMap.on("mousemove", (ev) => {
		y = IMG_OUTER_SIZE - ev.latlng.lat;
		x = ev.latlng.lng;

		let check = coordsInBounds(x, y);

		let igX = leafletToGameCoordinate(x, xRatio, currentMap.x);
		let igY = leafletToGameCoordinate(y, yRatio, currentMap.y);

		COORDS_CONTENT.textContent = `${check ? `${igX}:${igY}` : `-:-`}`;
	});
}

function leafletToGameCoordinate(coord, ratio, limits) {
	return Math.round((coord - IMG_MIN_INNER_PX) / ratio + limits.min);
}
function gameToLeafletCoordinate(coord, ratio, limits, isY = false) {
	let tmp = (coord - limits.min) * ratio + IMG_MIN_INNER_PX;
	return isY ? IMG_OUTER_SIZE - tmp : tmp;
}
function fixCoordinate(n) {
	let check = Math.trunc(n) < Math.round(n);
	return check ? Math.round(n) : Math.trunc(n);
}
function coordsInBounds(x, y) {
	return x >= IMG_MIN_INNER_PX && x <= IMG_MAX_INNER_PX && y >= IMG_MIN_INNER_PX && y <= IMG_MAX_INNER_PX;
}

mapTarget.addEventListener(`change`, () => {
	updateMap(mapTarget.selectedOptions[0].value);
});

SEARCH_LATLNG_BTN.addEventListener(`click`, coordsSearchHandler);
function coordsSearchHandler() {
	let igX = parseInt(SEARCH_LNG.value);
	let igY = parseInt(SEARCH_LAT.value);

	let goodCoords = checkSearchCoords(igX, currentMap.x, SEARCH_LNG);
	goodCoords = goodCoords && checkSearchCoords(igY, currentMap.y, SEARCH_LAT);

	if (!goodCoords) return;
	if (currentCoordinateCircle) {
		currentCoordinateCircle.removeFrom(leafletMap);
	}
	let mapX = gameToLeafletCoordinate(igX, xRatio, currentMap.x),
		mapY = gameToLeafletCoordinate(igY, yRatio, currentMap.y, true);

	currentCoordinateCircle = L.circleMarker(L.latLng(mapY, mapX), { radius: 10 }).addTo(leafletMap);
	SEARCH_LNG.value = ``;
	SEARCH_LAT.value = ``;
}

function checkSearchCoords(coord, limits, element) {
	if (coord > limits.max || coord < limits.min) {
		element.classList.add(`red-border`);
		return false;
	}

	element.classList.remove(`red-border`);
	return true;
}

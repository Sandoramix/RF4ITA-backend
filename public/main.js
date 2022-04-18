const mapTarget = document.querySelector(`#place`);

var MAPS = {};

function updateSelect() {
    for (let j = 0; j < Object.keys(MAPS).length; j++) {
        let el = document.createElement(`option`);
        if (j == 0) el.selected = true;

        let name = Object.keys(MAPS)[j];
        el.value = name;
        el.innerText = MAPS[name].prettifiedName;
        mapTarget.append(el);
    }
}
fetch(`http://localhost/maps`, { method: `GET`, mode: "no-cors" })
    .then((res) => res.json())
    .then((data) => {
        MAPS = data;
        updateSelect();
        updateMap(mapTarget.selectedOptions[0].value);
    });

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
    IMG_INNER_SIZE = IMG_OUTER_SIZE - IMG_MIN_INNER_PX * 2,
    IG_MAP_SQUARE_LENGTH = 94;

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
    y = 0,
    userFirstMark = L.circleMarker(),
    userSecondMark = L.circleMarker(),
    userMarksLine = L.polyline([
        [-1, -1],
        [-1, -1],
    ]),
    polylineTooltip = L.tooltip();

userFirstMark = userSecondMark = userMarksLine = polylineTooltip = null;

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
        scale: function(zoom) {
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
        .layers({}, {
            Ground: grOverlay,
        })
        .setPosition("topleft")
        .addTo(leafletMap);

    leafletMap.on("click", (ev) => {
        y = ev.latlng.lat;
        x = ev.latlng.lng;

        if (!coordsInBounds(x, y)) return;

        newUserMarksHandler(ev.latlng);
    });

    leafletMap.on("mousemove", (ev) => {
                y = IMG_OUTER_SIZE - ev.latlng.lat;
                x = ev.latlng.lng;

                let check = coordsInBounds(x, y);

                let igX = leafletToGameCoordinate(x, xRatio, currentMap.x);
                let igY = leafletToGameCoordinate(y, yRatio, currentMap.y);

                COORDS_CONTENT.textContent = `${check ? `${igX}:${igY}` : `-:-`}`;
		if (!check) return;
		if (userFirstMark && !userSecondMark) {
			updatePolyLine(ev.latlng);
		}
	});
}

function newCircleMarker(latlng, radius = 10, tooltipContent = null, color = `#3388ff`) {
	let marker = L.circleMarker(latlng, { radius, color });
	if (tooltipContent) {
		let tip = L.tooltip({ direction: "auto" }).setContent(tooltipContent);
		marker.bindTooltip(tip);
	}

	return marker;
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

	SEARCH_LNG.value = ``;
	SEARCH_LAT.value = ``;

	if (currentCoordinateCircle) {
		currentCoordinateCircle.removeFrom(leafletMap);
	}
	let mapX = gameToLeafletCoordinate(igX, xRatio, currentMap.x),
		mapY = gameToLeafletCoordinate(igY, yRatio, currentMap.y, true);
	if (!coordsInBounds(mapX, mapY)) return;
	newUserMarksHandler(L.latLng(mapY, mapX));
}

function newUserMarksHandler(latlng) {
	if (userFirstMark && userSecondMark) {
		userFirstMark.removeFrom(leafletMap);
		userSecondMark.removeFrom(leafletMap);
		userMarksLine.removeFrom(leafletMap);
		polylineTooltip.removeFrom(leafletMap);
		userFirstMark = userSecondMark = userMarksLine = polylineTooltip = null;
		return;
	}

	let igx = leafletToGameCoordinate(latlng.lng, xRatio, currentMap.x),
		igy = leafletToGameCoordinate(IMG_OUTER_SIZE - latlng.lat, yRatio, currentMap.y);

	if (userFirstMark) {
		userSecondMark = newCircleMarker(latlng, 8, `${igx}:${igy}`, `#40FF40`).addTo(leafletMap);
		updatePolyLine(latlng);

		return;
	}
	userFirstMark = newCircleMarker(latlng, 10, `${igx}:${igy}`).addTo(leafletMap);
	polylineTooltip = L.tooltip({ permanent: true, direction: "top", sticky: true });
	polylineTooltip.setContent(`Distance: 0m`);

	userMarksLine = L.polyline([userFirstMark.getLatLng(), latlng], {}).addTo(leafletMap);
	userMarksLine.bindTooltip(polylineTooltip);
	userMarksLine.openTooltip();
}

function updatePolyLine(latlng, offset = 0) {
	if (!userFirstMark) return;
	let midpoint = latlngMidPoint(userFirstMark.getLatLng(), latlng);

	let direction = getDirection(latlng);

	let lat = latlng.lat,
		lng = latlng.lng;
	lat = direction.includes("N") ? lat + offset : lat - offset;
	lng = direction.includes("E") ? lng - offset : lng + offset;

	userMarksLine.setLatLngs([userFirstMark.getLatLng(), newLatlng(lat, lng)]);

	let distance = distanceBetweenTwoPoints(userFirstMark.getLatLng(), latlng, IG_MAP_SQUARE_LENGTH / currentMap.squareWidth);

	polylineTooltip.setLatLng(midpoint).setContent(`Distance: <b>${distance}m</b> <em><b>${distance !== 0 ? direction : ``}</b></em>`);
}

function getDirection(latlng2) {
	let currDirection = "";
	if (!userFirstMark) return currDirection;
	let latlng1 = userFirstMark.getLatLng();
	currDirection += latlng1.lat < latlng2.lat ? "S" : "N";
	currDirection += latlng1.lng < latlng2.lng ? "E" : "W";
	return currDirection;
}
function newLatlng(lat, lng) {
	return L.latLng(lat, lng);
}
function distanceBetweenTwoPoints(a, b, unit) {
	return Math.round(Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lng - a.lng, 2)) / unit);
}
function latlngMidPoint(latlng1, latlng2) {
	return L.latLng((latlng1.lat + latlng2.lat) / 2, (latlng1.lng + latlng2.lng) / 2);
}

function checkSearchCoords(coord, limits, element) {
	if (coord > limits.max || coord < limits.min) {
		element.classList.add(`red-border`);
		return false;
	}

	element.classList.remove(`red-border`);
	return true;
}
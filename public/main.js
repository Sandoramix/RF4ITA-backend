var x = 0,
    y = 0;

var coordsSearchBtn = document.querySelector(`#coordsSearch`),
    coordsSearchX = document.querySelector(`#search-x`),
    coordsSearchY = document.querySelector(`#search-y`),
    mapContainer = document.querySelector(`#map-container`),
    leafletMap = document.querySelector(`#map`),
    layerObject = document.createElement(`object`),
    coordsSpan = document.querySelector(`#coords`),
    tiles = L.tileLayer(``),
    layerObject,
    layerGroup,
    map = L.map(`map`);

const imageSize = 1024,
    minInner = 42,
    maxInner = 982;

const outerBounds = [
    [0, 0],
    [imageSize, imageSize],
];
const innerBounds = [
    [minInner, minInner],
    [maxInner, maxInner],
];

const innerImageWidth = imageSize - minInner * 2;

updateMap(`thecottagepond`);

var currentMap, xRatio, yRatio;

function updateMap(map_name) {
    if (!maps[map_name]) return;
    currentMap = maps[map_name];

    xRatio = innerImageWidth / (currentMap.x.max - currentMap.x.min);
    yRatio = innerImageWidth / (currentMap.y.max - currentMap.y.min);
    console.log(xRatio, yRatio);
    leafletMap.innerHTML = `<div id="map"></div>`;
    if (map) {
        map.invalidateSize();
        map.off();
        map.remove();
    }

    if (map_name === ``) return;

    tiles = new L.tileLayer(`http://localhost/maps/${map_name}/{z}_{x}_{y}.jpg`, {
        minZoom: 0,
        maxZoom: 2,
        noWrap: true,
        attribution: 'Map inspired by &copy; <a href="https://rf4.info">rf4.info</a>',
    });

    var customCRS = L.extend(L.CRS.Simple, {
        projection: L.extend(L.Projection.LonLat, {
            bounds: L.bounds([0, 0], [imageSize, imageSize]),
        }),
        transformation: new L.Transformation(1, 0, 1, 0),
        scale: function(zoom) {
            return Math.pow(2, zoom - 2);
        },
        infinite: false,
    });

    var obj = document.createElement("object");
    obj.type = "image/svg+xml";
    obj.data = `http://localhost/maps/${map_name}/ground`;

    var grOverlay = L.svgOverlay(obj, outerBounds);

    var allLayers = [tiles, grOverlay];

    map = L.map("map", {
        crs: customCRS,
        layers: allLayers,
        maxBounds: outerBounds,
        doubleClickZoom: false,
    }).setView([0, 0], 1);

    L.DomUtil.addClass(map._container, "crosshair-cursor");

    L.control
        .layers({}, {
            Ground: grOverlay,
        })
        .setPosition("topleft")
        .addTo(map);
    map.addEventListener("click", (ev) => {
        y = imageSize - ev.latlng.lat;
        x = ev.latlng.lng;

        console.log(x, y);
    });

    map.addEventListener("mousemove", (ev) => {
                y = imageSize - ev.latlng.lat;
                x = ev.latlng.lng;
                let check = coordsInBounds(x, y);

                let mapX = x - minInner;
                let mapY = y - minInner;
                let igX = Math.round(mapX / xRatio + currentMap.x.min);
                let igY = Math.round(mapY / yRatio + currentMap.y.min);

                coordsSpan.textContent = `${check ? `${igX}:${igY}` : `-:-`}`;
	});
	// coordsSearchHandler();
}

function fixCoordinate(n) {
	let check = Math.trunc(n) < Math.round(n);
	return check ? Math.round(n) : Math.trunc(n);
}
function coordsInBounds(x, y) {
	let horizontal = x >= minInner && x <= maxInner;
	let vertical = y >= minInner && y <= maxInner;
	return horizontal && vertical;
}

mapTarget.addEventListener(`change`, () => {
	updateMap(mapTarget.selectedOptions[0].value);
});

coordsSearchBtn.addEventListener(`click`, coordsSearchHandler);
var currCoordinateMarker;

function coordsSearchHandler() {
	let igX = parseInt(coordsSearchX.value);
	let igY = parseInt(coordsSearchY.value);

	let goodCoords = checkSearchCoords(igX, currentMap.x, coordsSearchX);
	goodCoords = goodCoords && checkSearchCoords(igY, currentMap.y, coordsSearchY);

	if (!goodCoords) return;
	if (currCoordinateMarker) {
		currCoordinateMarker.removeFrom(map);
	}
	let mapX = (igX - currentMap.x.min) * xRatio + minInner,
		mapY = imageSize - ((igY - currentMap.y.min) * yRatio + minInner);

	currCoordinateMarker = L.circleMarker(L.latLng(mapY, mapX), { radius: 10 }).addTo(map);
	coordsSearchX.value = ``;
	coordsSearchY.value = ``;
}

function checkSearchCoords(coord, limits, element) {
	if (coord > limits.max || coord < limits.min) {
		element.classList.add(`red-border`);
		return false;
	}

	element.classList.remove(`red-border`);
	return true;
}
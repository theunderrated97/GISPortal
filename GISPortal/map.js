var serverPort = config.server.ipport;
var geoserverWorkspace = config.workspace;
var layerList = [];
var queryGeoJSON;
var editLayer;
var editgeojson;
var modifiedFeatureList = [];
var editTask;
var modifyInteraction;
var snap_edit;
var addFeatureInteraction;
var activeControl;

proj4.defs("EPSG:26331", "+proj=utm +zone=31 +a=6378249.145 +rf=293.465 +towgs84=-93.6,-83.7,113.8,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:26332", "+proj=utm +zone=32 +a=6378249.145 +rf=293.465 +towgs84=-93.6,-83.7,113.8,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:4674", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");

ol.proj.proj4.register(proj4);
const customproj = ol.proj.get(config.viewProjection);

var mapView = new ol.View({
    center: config.mapview.center,
    zoom: config.mapview.zoom,
    maxZoom: config.mapview.maxzoom,
    projection: customproj
});

var map = new ol.Map({
    target: 'map',
    view: mapView,
    controls: []
});

// start : remove DoubleClickZoom interaction
const dblClickInteraction = map.getInteractions().getArray().find((interaction) => { return interaction instanceof ol.interaction.DoubleClickZoom })
map.removeInteraction(dblClickInteraction);
// end : remove DoubleClickZoom interaction

// window.localStorage.setItem('role', 'admin');
// var layerGroups = localStorage.getItem("layers").split("|");
var layerGroups = [];

for (i = 0; i < config.layers.length; i++) {
    if (localStorage.getItem("layers").split("|").includes(config.layers[i].title)) {
        if (!layerGroups.includes(config.layers[i].layergroup)) {
            layerGroups.push(config.layers[i].layergroup)
        }
    }
}

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var mapExtent = [-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7];
var matrixIds = ['EPSG:3857:0', 'EPSG:3857:1', 'EPSG:3857:2', 'EPSG:3857:3', 'EPSG:3857:4', 'EPSG:3857:5', 'EPSG:3857:6', 'EPSG:3857:7', 'EPSG:3857:8', 'EPSG:3857:9', 'EPSG:3857:10', 'EPSG:3857:11', 'EPSG:3857:12', 'EPSG:3857:13', 'EPSG:3857:14', 'EPSG:3857:15', 'EPSG:3857:16', 'EPSG:3857:17', 'EPSG:3857:18', 'EPSG:3857:19', 'EPSG:3857:20', 'EPSG:3857:21', 'EPSG:3857:22', 'EPSG:3857:23', 'EPSG:3857:24', 'EPSG:3857:25'];
var resolutions = [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981];

var allLayers = []
for (j = 0; j < layerGroups.length; j++) {
    var layerCollection = [];
    for (k = 0; k < config.layers.length; k++) {
        if (config.layers[k].layergroup == layerGroups[j]) {
            if (localStorage.getItem("layers").split("|").includes(config.layers[k].title)) {
                if (config.layers[k].type == "base") {
                    if (config.layers[k].internal_name == 'nil') {
                        layerCollection.push(
                            new ol.layer.Tile({
                                title: config.layers[k].title,
                                type: config.layers[k].type,
                                visible: config.layers[k].visible,
                                attributions: '',
                                source: config.layers[k].source,
                                transition: 0,
                                crossOrigin: "anonymous",
                                projection: config.viewProjection
                            })
                        );
                    } else if (config.layers[k].internal_name == 'osm:osm') {
                        layerCollection.push(
                            new ol.layer.Tile({
                                title: config.layers[k].title,
                                type: config.layers[k].type,
                                visible: config.layers[k].visible,
                                source: new ol.source.WMTS({
                                    url: 'http://' + config.server.ipport + '/geoserver/osm/gwc/service/wmts?REQUEST=GetCapabilities',
                                    layer: config.layers[k].internal_name,
                                    matrixSet: 'EPSG:3857',
                                    format: 'image/png',
                                    projection: projection,
                                    crossOrigin: "anonymous",
                                    tileGrid: new ol.tilegrid.WMTS({
                                        origin: ol.extent.getTopLeft(projectionExtent),
                                        resolutions: resolutions,
                                        matrixIds: matrixIds
                                    })
                                })
                            })
                        );
                    }
                } else if (config.layers[k].type == "image") {
                    layerCollection.push(
                        new ol.layer.Image({
                            title: config.layers[k].title,
                            visible: true,
                            maxZoom: config.layers[k].maxZoom,
                            minZoom: config.layers[k].minZoom,
                            source: new ol.source.ImageWMS({
                                url: 'http://' + config.server.ipport + '/geoserver/' + config.workspace + '/wms',
                                params: { 'LAYERS': config.layers[k].internal_name },
                                serverType: 'geoserver',
                                transition: 0,
                                crossOrigin: "anonymous"
                            })
                        })
                    );
                    allLayers.unshift(layerCollection[layerCollection.length - 1]);
                } else if (config.layers[k].type == "tile") {
                    layerCollection.push(
                        new ol.layer.Tile({
                            title: config.layers[k].title,
                            visible: true,
                            maxZoom: config.layers[k].maxZoom,
                            minZoom: config.layers[k].minZoom,
                            source: new ol.source.TileWMS({
                                url: 'http://' + config.server.ipport + '/geoserver/' + config.workspace + '/wms',
                                params: { 'LAYERS': config.layers[k].internal_name, 'TILED': true },
                                serverType: 'geoserver',
                                transparent: true,
                                transition: 0,
                                crossOrigin: "anonymous",
                                projection: customproj
                            }),
                        })
                    );
                    allLayers.unshift(layerCollection[layerCollection.length - 1]);
                }
            }
        }
    }
    var groupLayer = new ol.layer.Group({
        title: layerGroups[j],
        fold: 'open',
        layers: layerCollection
    });
    map.addLayer(groupLayer);
}

// start : get projection of  layer
var layerProjection;
function getLayerProjection(lyrName) {
    var url = 'http://' + config.server.ipport + '/geoserver/wms?request=getCapabilities';
    var parser = new ol.format.WMSCapabilities();

    $.ajax(url).then(function (response) {
        var result = parser.read(response);
        var Layers = result.Capability.Layer.Layer;
        for (l = 0; l < Layers.length; l++) {
            if (Layers[l].Name == lyrName) {
                layerProjection = Layers[l].CRS[0];
                break;
            }
        }
    });
}
// end : get projection of  layer

// start : preparing layer list
for (y = 0; y < map.getLayers().getLength(); y++) {
    var lyr1 = map.getLayers().item(y)
    if (lyr1.get('title') == 'Base Layers') { } else {
        if (lyr1.getLayers().getLength() > 0) {
            for (z = 0; z < lyr1.getLayers().getLength(); z++) {
                var lyr2 = lyr1.getLayers().item(z);
                layerList.push(lyr2.getSource().getParams().LAYERS);
            }
        } else {
            layerList.push(lyr1.getSource().getParams().LAYERS);
        }
    }
}
// end : preparing layer list

// start : mouse position
var mousePosition = new ol.control.MousePosition({
    className: 'mousePosition',
    projection: 'EPSG:4326',
    coordinateFormat: function (coordinate) { return ol.coordinate.format(coordinate, '{y} , {x}', 4); }
});
map.addControl(mousePosition);
// end : mouse position

// start : scale control
var scaleControl = new ol.control.ScaleLine({
    bar: true,
    text: true,
    minWidth: 100,
    maxWidth: 100
});
map.addControl(scaleControl);
// end : scale control

// start : style definition
var cyanSelectionFeatureStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(64,244,208,0.4)',
    }),
    stroke: new ol.style.Stroke({
        color: '#40E0D0',
        width: 3,
    }),
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: '#40E0D0'
        })
    })
});
var cyanSelectionFeatureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: cyanSelectionFeatureStyle
});
var yellowSelectionFeatureStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255,255,0,0.4)',
    }),
    stroke: new ol.style.Stroke({
        color: '#FFFF00',
        width: 3,
    }),
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: '#FFFF00'
        })
    })
});
var yellowSelectionFeatureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: yellowSelectionFeatureStyle
});
var interactionStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(200, 200, 200, 0.6)',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
    }),
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
    })
});
// end : style definition

// start : pan interaction
var drgPanInteraction = new ol.interaction.DragPan();
// start : pan interaction

// start : zoomIn interaction
var zoomInInteraction = new ol.interaction.DragBox();

zoomInInteraction.on('boxend', function () {
    var zoomInExtent = zoomInInteraction.getGeometry().getExtent();
    map.getView().fit(zoomInExtent);
});
// end : zoomIn interaction

// start : zoomOut interaction
var zoomOutInteraction = new ol.interaction.DragBox();

zoomOutInteraction.on('boxend', function () {
    var zoomOutExtent = zoomOutInteraction.getGeometry().getExtent();
    map.getView().setCenter(ol.extent.getCenter(zoomOutExtent));
    mapView.setZoom(mapView.getZoom() - 1)
});
// end : zoomOut interaction

// start : Length and Area Measurement Control
var continuePolygonMsg = 'Click to continue polygon, Double click to complete';
var continueLineMsg = 'Click to continue line, Double click to complete';

var draw;
var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 204, 51, 0.4)',
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});
map.addLayer(vector);

function addInteraction(intType) {

    draw = new ol.interaction.Draw({
        source: source,
        type: intType,
        style: interactionStyle
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();

    var sketch;
    var pointerMoveHandler = function (evt) {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = 'Click to start drawing';

        if (sketch) {
            var geom = sketch.getGeometry();
        }
    };

    map.on('pointermove', pointerMoveHandler);

    draw.on('drawstart', function (evt) {
        sketch = evt.feature;
        var tooltipCoord = evt.coordinate;
        sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
    });
}

var helpTooltipElement;
var helpTooltip;

function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);
}

var measureTooltipElement;
var measureTooltip;

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}

var formatLength = function (line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};

var formatArea = function (polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};
// end : Length and Area Measurement Control

// start : FeatureInfo Control
var featureInfoData;
var featureinfoDetails;
map.on('singleclick', function (evt) {
    if ($('#featureInfo').hasClass('clicked')) {
        var featureInfoLyrList = [];
        for (p = 0; p < map.getLayers().getLength(); p++) {
            var lyrx = map.getLayers().item(p)
            if (lyrx.get('title') == 'Base Layers' || lyrx.get('title') == undefined) { } else {
                if (lyrx.getLayers().getLength() > 0) {
                    for (q = 0; q < lyrx.getLayers().getLength(); q++) {
                        var lyry = lyrx.getLayers().item(q);
                        if (lyry.getVisible()) {
                            if ((lyry.getMinZoom() < mapView.getZoom()) && (lyry.getMaxZoom() > mapView.getZoom())) {
                                featureInfoLyrList.push(lyry.getSource().getParams().LAYERS);
                            }
                        }
                    }
                } else {
                    if (lyrx.getVisible()) {
                        if (lyrx.getMinZoom() < mapView.getZoom()) {
                            featureInfoLyrList.push(lyrx.getSource().getParams().LAYERS);
                        }
                    }
                }
            }

        }
        var layerListString = featureInfoLyrList.join();
        featureInfoData = undefined;
        var resolution = mapView.getResolution();

        var url = map.getLayers().item(1).getLayers().item(0).getSource().getFeatureInfoUrl(evt.coordinate, resolution,
            config.viewProjection, {
            'INFO_FORMAT': 'application/json',
            'LAYERS': layerListString,
            'QUERY_LAYERS': layerListString,
            'FEATURE_COUNT': '100'
        });

        if (url) {
            $.getJSON(url, function (data) {
                if (data.features.length > 0) {
                    featureInfoData = data;
                    featureinfoDetails = document.createElement('div');

                    $('#featureInfoTable').empty();
                    var table = $('#featureInfoTable')[0];

                    var tbody = document.createElement('tbody');
                    table.appendChild(tbody)

                    var row_1 = document.createElement('tr');
                    var row_1_data_1 = document.createElement('td');
                    row_1_data_1.innerHTML = "Layer";
                    let row_1_data_2 = document.createElement('td');
                    for (l = 0; l < config.layers.length; l++) {
                        if (config.layers[l].internal_name.split(':')[1] == data.features[0].id.split('.')[0]) {
                            row_1_data_2.innerHTML = config.layers[l].title;
                        }
                    }
                    // row_1_data_2.innerHTML = data.features[0].id.split('.')[0];

                    row_1.appendChild(row_1_data_1);
                    row_1.appendChild(row_1_data_2);

                    tbody.appendChild(row_1);

                    for (const key of Object.keys(data.features[0].properties)) {
                        if (key.indexOf('gid') == -1) {
                            var row_2 = document.createElement('tr');
                            var row_2_data_1 = document.createElement('td');
                            row_2_data_1.innerHTML = key;
                            let row_2_data_2 = document.createElement('td');
                            row_2_data_2.innerHTML = data.features[0].properties[key];

                            row_2.appendChild(row_2_data_1);
                            row_2.appendChild(row_2_data_2);

                            tbody.appendChild(row_2);
                        }
                    }

                    addGeoJsonFeature(featureInfoData.features[0].id);
                    if (data.features.length > 1) {
                        var previousNextDiv = document.createElement('div');
                        previousNextDiv.id = 'preNxtDiv';
                        var previousNextContent = document.createElement('div');
                        previousNextContent.id = 'preNxtContent';
                        var previousButton = document.createElement('button');
                        previousButton.id = 'preBtn';
                        previousButton.innerHTML = '<i class="fas fa-arrow-circle-left fa-lg"></i>';
                        previousButton.onclick = function () { featureInfoPre(); };

                        var featureCountSpan = document.createElement('span');
                        featureCountSpan.id = 'featureCountSpan';
                        featureCountSpan.innerHTML = '  1 / ' + data.features.length + '  ';

                        var nextButton = document.createElement('button');
                        nextButton.innerHTML = '<i class="fas fa-arrow-circle-right fa-lg"></i>';
                        nextButton.id = 'nxtBtn';
                        nextButton.onclick = function () { featureInfoNxt(); };

                        previousNextDiv.appendChild(previousButton);
                        previousNextDiv.appendChild(featureCountSpan);
                        previousNextDiv.appendChild(nextButton);
                        previousNextContent.appendChild(previousNextDiv);
                        $("#featureInfoFooterDiv").empty();
                        $("#featureInfoFooterDiv").css("display", "flex");
                        $("#featureInfoFooterDiv").append(previousNextContent);
                        $("#featureInfoTableDiv").css("height", "calc(100vh - 80px)");
                    } else {
                        $("#featureInfoFooterDiv").css("display", "none");
                        $("#featureInfoFooterDiv").empty();
                        $("#featureInfoTableDiv").css("height", "calc(100vh - 40px)");
                    }
                    if (!($('#right').is(':visible'))) {
                        $("#right").append($("#featureInfoDiv"));
                        $("#featureInfoDiv").css("display", "block");
                        openRightPane();
                    }
                } else {
                    $("#featureInfoTable").empty();
                    $("#featureInfoFooterDiv").empty();
                    $("#featureInfoFooterDiv").css("display", "none");
                    closeRightPane();
                    if (queryGeoJSON) {
                        queryGeoJSON.getSource().clear();
                        map.removeLayer(queryGeoJSON);
                    }
                }
            })
        } else {
        }
    }
});
// end : FeatureInfo Control


// start : general functions

var selectedFeatureOverlay = new ol.layer.Vector({
    title: 'Selected Feature',
    source: new ol.source.Vector(),
    map: map,
    style: yellowSelectionFeatureStyle
});

function openLeftPane() {
    $("#left").css("display", "block");

    if ($('#middle').hasClass('col-10')) {
        $('#middle').removeClass('col-10');
        $('#middle').addClass('col-8');
    } else {
        $('#middle').removeClass('col-12');
        $('#middle').addClass('col-10');
    }
    map.updateSize();
}

function closeLeftPane() {
    if ($('#left').is(':visible')) {
        $("#left").css("display", "none");
        if ($('#middle').hasClass('col-10')) {
            $('#middle').removeClass('col-10');
            $('#middle').addClass('col-12');
            map.updateSize();
        }
        if ($('#middle').hasClass('col-8')) {
            $('#middle').removeClass('col-8');
            $('#middle').addClass('col-10');
            map.updateSize();
        }
    }
}

function openRightPane() {
    if (!($('#right').is(':visible'))) {
        $("#right").css("display", "block");
        if ($('#middle').hasClass('col-10')) {
            $('#middle').removeClass('col-10');
            $('#middle').addClass('col-8');
        } else {
            $('#middle').removeClass('col-12');
            $('#middle').addClass('col-10');
        }
        map.updateSize();
    }

}

function closeRightPane() {
    if ($('#right').is(':visible')) {
        if ($('#middle').hasClass('col-10')) {
            $('#middle').removeClass('col-10');
            $('#middle').addClass('col-12');
        } else {
            $('#middle').removeClass('col-8');
            $('#middle').addClass('col-10');
        }
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#right").css("display", "none");
        map.updateSize();
    }
}

function openBottomPane() {
    $("#bottom").removeClass("d-none");
    $("#map").css("height", "calc(100vh - 190px)");
    map.updateSize();
}
function closeBottomPane() {
    $("#bottom").addClass("d-none");
    $("#bottom").children().css("display", "none");
    $("#bottom").children().appendTo("body");
    $("#map").css("height", "calc(100vh - 40px)");
    map.updateSize();
}

function deactivateControl(ctrl) {
    if (ctrl == "Layers") {
        if ($('#layers').hasClass('clicked')) { $("#layers").toggleClass("clicked"); }
        $("#map").css("cursor", "default");
        $("#left").children().css("display", "none");
        $("#left").children().appendTo("body");
        closeLeftPane();
        activeControl = "";
    }
    if (ctrl == "Legends") {
        if ($('#legends').hasClass('clicked')) { $("#legends").toggleClass("clicked"); }
        $("#map").css("cursor", "default");
        $("#left").children().css("display", "none");
        $("#left").children().appendTo("body");
        closeLeftPane();
        activeControl = "";
    }
    if (ctrl == "Pan") {
        if ($('#pan').hasClass('clicked')) { $("#pan").toggleClass("clicked"); }
        $("#map").css("cursor", "default");
        map.removeInteraction(drgPanInteraction);
    }
    if (ctrl == "ZoomIn") {
        if ($('#zoomIn').hasClass('clicked')) { $("#zoomIn").toggleClass("clicked"); }
        $("#map").css("cursor", "default");
        map.removeInteraction(zoomInInteraction);
    }
    if (ctrl == "ZoomOut") {
        if ($('#zoomOut').hasClass('clicked')) { $("#zoomOut").toggleClass("clicked"); }
        $("#map").css("cursor", "default");
        map.removeInteraction(zoomOutInteraction);
    }
    if (ctrl == "MeasureLength") {
        if ($('#measureLength').hasClass('clicked')) { $("#measureLength").toggleClass("clicked"); }
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
    }
    if (ctrl == "MeasureArea") {
        if ($('#measureArea').hasClass('clicked')) { $("#measureArea").toggleClass("clicked"); }
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
    }
    if (ctrl == "downloadMap") {
        if ($('#downloadMap').hasClass('clicked')) { $("#downloadMap").toggleClass("clicked"); }
        $("#map").css("cursor", "default");
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        closeRightPane();
        activeControl = "";
    }
    if (ctrl == "FeatureInfo") {
        if (queryGeoJSON) { queryGeoJSON.getSource().clear(); map.removeLayer(queryGeoJSON); }
        if ($('#featureInfo').hasClass('clicked')) { $("#featureInfo").toggleClass("clicked"); }
        closeRightPane();
        $("#featureInfoTable").empty();
        $("#featureInfoFooterDiv").empty();

        $("#map").css("cursor", "default");
    }
    if (ctrl == "AttributeQuery") {
        if ($('#attributeQuery').hasClass('clicked')) { $("#attributeQuery").toggleClass("clicked"); }
        closeRightPane()
        closeBottomPane();
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#bottom").children().css("display", "none");
        $("#bottom").children().appendTo("body");
        $('#attQryTable').empty();

        if (queryGeoJSON) {
            queryGeoJSON.getSource().clear();
            map.removeLayer(queryGeoJSON);
        }

        $('#selectLayer').empty();
        $('#selectAttribute').empty();
        $('#selectOperator').empty();
        $('#enterValue').val('');
    }
    if (ctrl == "SpatialQuery") {
        if ($('#spatialQuery').hasClass('clicked')) { $("#spatialQuery").toggleClass("clicked"); }
        closeRightPane();
        closeBottomPane();
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#bottom").children().css("display", "none");
        $("#bottom").children().appendTo("body");
        $('#attQryTable').empty();

        if (queryGeoJSON) {
            queryGeoJSON.getSource().clear();
            map.removeLayer(queryGeoJSON);
        }

        if (yellowSelectionFeatureOverlay) {
            yellowSelectionFeatureOverlay.getSource().clear();
            map.removeLayer(yellowSelectionFeatureOverlay);
        }
        map.removeInteraction(draw);

        if ($('#spUserInput').hasClass('clicked')) { $("#spUserInput").toggleClass("clicked"); }
    }
    if (ctrl == "Settings") {
        if ($('#settings').hasClass('clicked')) { $("#settings").toggleClass("clicked"); }
        closeRightPane()
    }
    if (ctrl == "StartEditing") {
        if (!(editTask == 'delete')) {
            if (modifiedFeatureList.length > 0) {
                var answer = confirm('You have unsaved edits. Do you want to save edits?');
                if (answer) {
                    saveEdits(editTask);
                    modifiedFeatureList = [];
                } else {
                    modifiedFeatureList = [];
                    yellowSelectionFeatureOverlay.getSource().clear();
                    map.removeLayer(yellowSelectionFeatureOverlay);
                }
            }
        }
        if ($('#startEditing').hasClass('clicked')) { $("#startEditing").toggleClass("clicked"); }
        if (editgeojson) {
            editgeojson.getSource().clear();
            map.removeLayer(editgeojson);
        }
        if (yellowSelectionFeatureOverlay) {
            yellowSelectionFeatureOverlay.getSource().clear();
            map.removeLayer(yellowSelectionFeatureOverlay);
        }
        selectedFeatureOverlay.getSource().clear();
        map.removeLayer(selectedFeatureOverlay);
        modifiedFeature = false;
        editTask = '';
        if (snap_edit) {
            map.removeInteraction(snap_edit);
        }
        if (addFeatureInteraction) {
            map.removeInteraction(addFeatureInteraction);
        }
        $('#addFeature').prop('disabled', false);
        if ($('#addFeature').hasClass('clicked')) { $("#addFeature").toggleClass("clicked"); }
        $('#ModifyFeature').prop('disabled', false);
        if ($('#ModifyFeature').hasClass('clicked')) { $("#ModifyFeature").toggleClass("clicked"); }
        $('#DeleteFeature').prop('disabled', false);
        if ($('#DeleteFeature').hasClass('clicked')) { $("#DeleteFeature").toggleClass("clicked"); }
        $('#ModifyAttribute').prop('disabled', false);
        if ($('#ModifyAttribute').hasClass('clicked')) { $("#ModifyAttribute").toggleClass("clicked"); }
        closeRightPane();
        closeBottomPane();
        $("#editingTools").css("display", "none");
    }
    if (ctrl == "AddFeature") {
        if ($('#addFeature').hasClass('clicked')) { $("#addFeature").toggleClass("clicked"); }
        if (modifiedFeatureList.length > 0) {
            var answer = confirm('You have unsaved edits. Do you want to save edits?');
            if (answer) {
                saveEdits(editTask);
                modifiedFeatureList = [];
            } else {
                modifiedFeatureList = [];
                yellowSelectionFeatureOverlay.getSource().clear();
                map.removeLayer(yellowSelectionFeatureOverlay);
            }
        }
        selectedFeatureOverlay.getSource().clear();
        map.removeLayer(selectedFeatureOverlay);
        modifiedFeature = false;
        editTask = '';
        if (snap_edit) {
            map.removeInteraction(snap_edit);
        }
        if (addFeatureInteraction) {
            map.removeInteraction(addFeatureInteraction);
        }
        $('#ModifyFeature').prop('disabled', false);
        $('#DeleteFeature').prop('disabled', false);
        $('#ModifyAttribute').prop('disabled', false);
        closeRightPane();
        closeBottomPane();
        $('#attributeUpdateTable').empty();
    }
    if (ctrl == "ModifyFeature") {
        if ($('#ModifyFeature').hasClass('clicked')) { $("#ModifyFeature").toggleClass("clicked"); }
        if (modifiedFeatureList.length > 0) {
            var answer = confirm('Save edits?');
            if (answer) {
                saveEdits(editTask);
                modifiedFeatureList = [];
                setTimeout(function () { editgeojson.getSource().refresh(); }, 1000);
            } else {
                modifiedFeatureList = [];
                yellowSelectionFeatureOverlay.getSource().clear();
                map.removeLayer(yellowSelectionFeatureOverlay);
                editgeojson.getSource().refresh();
            }
        }
        map.un('click', modifyFeature);
        selectedFeatureOverlay.getSource().clear();
        map.removeLayer(selectedFeatureOverlay);
        modifiedFeature = false;
        map.removeInteraction(modifyInteraction);
        map.removeInteraction(snap_edit);
        editTask = '';
        $('#addFeature').prop('disabled', false);
        $('#DeleteFeature').prop('disabled', false);
        $('#ModifyAttribute').prop('disabled', false);
    }
    if (ctrl == "DeleteFeature") {
        if ($('#DeleteFeature').hasClass('clicked')) { $("#DeleteFeature").toggleClass("clicked"); }
        modifiedFeatureList = [];
        yellowSelectionFeatureOverlay.getSource().clear();
        map.removeLayer(yellowSelectionFeatureOverlay);
        map.un('click', selectFeatureToDelete);
        selectedFeatureOverlay.getSource().clear();
        map.removeLayer(selectedFeatureOverlay);
        modifiedFeature = false;
        editTask = '';
        $('#addFeature').prop('disabled', false);
        $('#ModifyFeature').prop('disabled', false);
        $('#ModifyAttribute').prop('disabled', false);

        yellowSelectionFeatureOverlay.getSource().clear();
        map.removeLayer(yellowSelectionFeatureOverlay);

        closeRightPane();
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#bottom").children().css("display", "none");
        $("#bottom").children().appendTo("body");
        $('#attributeUpdateTable').empty();
        $("#attributeUpdateFooterDiv").css("display", "none");
    }
    if (ctrl == "ModifyAttribute") {
        if ($('#ModifyAttribute').hasClass('clicked')) { $("#ModifyAttribute").toggleClass("clicked"); }
        if (modifiedFeatureList.length > 0) {
            var answer = confirm('You have unsaved edits. Do you want to save edits?');
            if (answer) {
                saveEdits(editTask);
                modifiedFeatureList = [];
            } else {
                modifiedFeatureList = [];
                yellowSelectionFeatureOverlay.getSource().clear();
                map.removeLayer(yellowSelectionFeatureOverlay);
            }
        }
        map.un('click', selectFeatureAttributeUpdate);
        modifiedFeature = false;
        editTask = '';

        $('#addFeature').prop('disabled', false);
        $('#ModifyFeature').prop('disabled', false);
        $('#DeleteFeature').prop('disabled', false);

        selectedFeatureOverlay.getSource().clear();
        map.removeLayer(selectedFeatureOverlay);
        yellowSelectionFeatureOverlay.getSource().clear();
        map.removeLayer(yellowSelectionFeatureOverlay);

        closeRightPane();
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#bottom").children().css("display", "none");
        $("#bottom").children().appendTo("body");
        $('#attributeUpdateTable').empty();
        $("#attributeUpdateFooterDiv").css("display", "none");
    }
}

function addGeoJsonFeature(fid) {
    if (queryGeoJSON) {
        queryGeoJSON.getSource().clear();
        map.removeLayer(queryGeoJSON);
    }

    var filteredGeoJSON = {
        "type": "FeatureCollection",
        "features": featureInfoData.features.filter(function (feature) {
            return (feature.id === fid);
        })
    };

    queryGeoJSON = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(filteredGeoJSON)
        }),
        style: cyanSelectionFeatureStyle,
    });

    map.addLayer(queryGeoJSON);
};

function featureInfoNxt() {
    var currentTableNo = $('#featureCountSpan').text().trim().split('/')[0].trim();
    if (currentTableNo != featureInfoData.features.length) {
        $('#featureInfoTable').empty();
        var table = $('#featureInfoTable')[0];
        var tbody = document.createElement('tbody');

        table.appendChild(tbody)

        var row_1 = document.createElement('tr');
        var heading_1 = document.createElement('td');
        heading_1.innerHTML = "Layer";
        var heading_2 = document.createElement('td');
        for (l = 0; l < config.layers.length; l++) {
            if (config.layers[l].internal_name.split(':')[1] == featureInfoData.features[currentTableNo].id.split('.')[0]) {
                heading_2.innerHTML = config.layers[l].title;
            }
        }
        // heading_2.innerHTML = featureInfoData.features[currentTableNo].id.split('.')[0];

        row_1.appendChild(heading_1);
        row_1.appendChild(heading_2);
        tbody.appendChild(row_1);

        for (const key of Object.keys(featureInfoData.features[currentTableNo].properties)) {
            if (key.indexOf('gid') == -1) {
                var row_2 = document.createElement('tr');
                var row_2_data_1 = document.createElement('td');
                row_2_data_1.innerHTML = key;
                let row_2_data_2 = document.createElement('td');
                row_2_data_2.innerHTML = featureInfoData.features[currentTableNo].properties[key];

                row_2.appendChild(row_2_data_1);
                row_2.appendChild(row_2_data_2);

                tbody.appendChild(row_2);
            }
        }
        addGeoJsonFeature(featureInfoData.features[currentTableNo].id);

        $('#featureCountSpan').text(' ' + (Number(currentTableNo) + 1) + ' / ' + featureInfoData.features.length + ' ')
    }
}

function featureInfoPre() {
    var currentTableNo = $('#featureCountSpan').text().trim().split('/')[0].trim();
    if (currentTableNo != 1) {
        $('#featureInfoTable').empty();
        var table = $('#featureInfoTable')[0];
        var tbody = document.createElement('tbody');

        table.appendChild(tbody)

        var row_1 = document.createElement('tr');
        var heading_1 = document.createElement('td');
        heading_1.innerHTML = "Layer";
        var heading_2 = document.createElement('td');
        for (l = 0; l < config.layers.length; l++) {
            if (config.layers[l].internal_name.split(':')[1] == featureInfoData.features[currentTableNo - 2].id.split('.')[0]) {
                heading_2.innerHTML = config.layers[l].title;
            }
        }
        // heading_2.innerHTML = featureInfoData.features[currentTableNo - 2].id.split('.')[0];

        row_1.appendChild(heading_1);
        row_1.appendChild(heading_2);
        tbody.appendChild(row_1);

        for (const key of Object.keys(featureInfoData.features[currentTableNo - 2].properties)) {
            if (key.indexOf('gid') == -1) {
                var row_2 = document.createElement('tr');
                var row_2_data_1 = document.createElement('td');
                row_2_data_1.innerHTML = key;
                let row_2_data_2 = document.createElement('td');
                row_2_data_2.innerHTML = featureInfoData.features[currentTableNo - 2].properties[key];

                row_2.appendChild(row_2_data_1);
                row_2.appendChild(row_2_data_2);

                tbody.appendChild(row_2);
            }
        }
        addGeoJsonFeature(featureInfoData.features[currentTableNo - 2].id);

        $('#featureCountSpan').text(' ' + (Number(currentTableNo) - 1) + ' / ' + featureInfoData.features.length + ' ')
    }
}

// function addMapLayerList(selectElementName) {
//     $('#selectLayer').empty();

//     var select = $('#' + selectElementName);
//     select.append("<option class='ddindent' value=''></option>");

//     layerList.forEach(element => {
//         var value = element;
//         select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
//     });
// };

function addMapLayerList(usage, selectElementName) {
    if (usage == "attributeQuery") {
        $('#selectLayer').empty();
        var select = $('#' + selectElementName);
        select.append("<option class='ddindent' value=''></option>");
        for (u = 0; u < config.layers.length; u++) {
            if (config.layers[u].attributeQuery == true) {
                select.append("<option class='ddindent' value='" + config.layers[u].internal_name + "'>" + config.layers[u].title + "</option>");
            }
        }
    }
    if (usage == "spatialQuery") {
        $('#buffSelectLayer').empty();
        var select = $('#' + selectElementName);
        select.append("<option class='ddindent' value=''></option>");
        for (u = 0; u < config.layers.length; u++) {
            if (config.layers[u].spatialQuery == true) {
                select.append("<option class='ddindent' value='" + config.layers[u].internal_name + "'>" + config.layers[u].title + "</option>");
            }
        }
    }
    if (usage == "editing") {
        $('#editingLayer').empty();
        var select = $('#' + selectElementName);
        select.append("<option class='ddindent' value=''></option>");
        for (u = 0; u < config.layers.length; u++) {
            if (config.layers[u].editing == true) {
                select.append("<option class='ddindent' value='" + config.layers[u].internal_name + "'>" + config.layers[u].title + "</option>");
            }
        }
    }
};

function addMapLayerList_spQry() {
    $('#buffSelectLayer').empty();

    var select = $('#buffSelectLayer');
    select.append("<option class='ddindent' value=''></option>");

    layerList.forEach(element => {
        var value = element;
        select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
    });
};

function addMapLayerList_settings() {
    $('#editingLayer').empty();

    var select = $('#editingLayer');
    select.append("<option class='ddindent' value=''></option>");

    layerList.forEach(element => {
        var value = element;
        select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
    });
};

var feature;

function newpopulateQueryTable(url) {
    if (typeof attributePanel !== 'undefined') {
        if (attributePanel.parentElement !== null) {
            attributePanel.close();
        }
    }
    $.getJSON(url, function (data) {
        if (data.features.length > 0) {
            featData = data;
            var col = [];
            col.push('id');
            var geomType = data.features[0].geometry.type;

            for (var i = 0; i < data.features.length; i++) {
                for (var key in data.features[i].properties) {
                    if (col.indexOf(key) === -1) {
                        col.push(key);
                    }
                }
            }

            $('#attQryTable').empty();
            var table = $('#attQryTable')[0];

            var tr = table.insertRow(-1);                   // TABLE ROW.then.

            for (var i = 0; i < col.length; i++) {
                var th = document.createElement("th");      // TABLE HEADER.
                if (config.theme == "red") { th.setAttribute("class", "table-danger table-bordered table-sm border-dark"); }
                if (config.theme == "green") { th.setAttribute("class", "table-success table-bordered table-sm border-dark"); }
                if (config.theme == "blue") { th.setAttribute("class", "table-primary table-bordered table-sm border-dark"); }
                if (config.theme == "black") { th.setAttribute("class", "table-secondary table-bordered table-sm border-dark"); }

                th.innerHTML = col[i];
                tr.appendChild(th);
            }

            for (var i = 0; i < data.features.length; i++) {
                tr = table.insertRow(-1);
                for (var j = 0; j < col.length; j++) {
                    var tabCell = tr.insertCell(-1);
                    if (j == 0) {
                        tabCell.innerHTML = data.features[i]['id'];
                        var id = data.features[i]['id'];
                    }
                    else {
                        tabCell.innerHTML = data.features[i].properties[col[j]];
                    }
                }

                if (geomType === 'Point') {
                    var featExtent = new ol.geom.Point(data.features[i].geometry.coordinates).getExtent();
                    if (layerProjection == config.viewProjection) { } else {
                        var featExtent = ol.proj.transformExtent(featExtent, layerProjection, config.viewProjection)
                    }
                    tr.setAttribute('onclick', 'map.getView().fit([' + featExtent + '], { duration: 1500, size: map.getSize(), maxZoom: 21 })');
                } else if (geomType === "Polygon") {
                    var featExtent = new ol.geom.Polygon(data.features[i].geometry.coordinates).getExtent();
                    if (layerProjection == config.viewProjection) { } else {
                        var featExtent = ol.proj.transformExtent(featExtent, layerProjection, config.viewProjection)
                    }
                    tr.setAttribute('onclick', 'map.getView().fit([' + featExtent + '], { duration: 1500, size: map.getSize(), maxZoom: 21 })');
                } else if (geomType === "MultiPolygon") {
                    var featExtent = new ol.geom.MultiPolygon(data.features[i].geometry.coordinates).getExtent();
                    if (layerProjection == config.viewProjection) { } else {
                        var featExtent = ol.proj.transformExtent(featExtent, layerProjection, config.viewProjection)
                    }
                    tr.setAttribute('onclick', 'map.getView().fit([' + featExtent + '], { duration: 1500, size: map.getSize(), maxZoom: 21 })');
                } else if (geomType === "LineString") {
                    var featExtent = new ol.geom.LineString(data.features[i].geometry.coordinates).getExtent();
                    if (layerProjection == config.viewProjection) { } else {
                        var featExtent = ol.proj.transformExtent(featExtent, layerProjection, config.viewProjection)
                    }
                    tr.setAttribute('onclick', 'map.getView().fit([' + featExtent + '], { duration: 1500, size: map.getSize(), maxZoom: 21 })');
                } else if (geomType === "MultiLineString") {
                    var featExtent = new ol.geom.MultiLineString(data.features[i].geometry.coordinates).getExtent();
                    if (layerProjection == config.viewProjection) { } else {
                        var featExtent = ol.proj.transformExtent(featExtent, layerProjection, config.viewProjection)
                    }
                    tr.setAttribute('onclick', 'map.getView().fit([' + featExtent + '], { duration: 1500, size: map.getSize(), maxZoom: 21 })');
                }
            }
            addGeoJsonURL(url);
            $("#attListDivTest").appendTo("body");
            $("#bottom").append($("#attListDivTest"));
            $("#attListDivTest").css("display", "block");
            openBottomPane();
            showAlert("Data fetched successfully.", "alert-success", false)
        } else {
            showAlert("No data found matching with criteria", "alert-danger", true);
            if (queryGeoJSON) {
                queryGeoJSON.getSource().clear();
                map.removeLayer(queryGeoJSON);
            }

            if (yellowSelectionFeatureOverlay) {
                yellowSelectionFeatureOverlay.getSource().clear();
                map.removeLayer(yellowSelectionFeatureOverlay);
            }
            coordList = '';
            markerFeature = undefined;
            $("attListDivTest").css("display", "none");
            closeBottomPane();
        }
    });
};

function addGeoJsonURL(url) {

    if (queryGeoJSON) {
        queryGeoJSON.getSource().clear();
        map.removeLayer(queryGeoJSON);
    }
    queryGeoJSON = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON(),
        }),
        style: cyanSelectionFeatureStyle,
    });
    map.addLayer(queryGeoJSON);
    queryGeoJSON.getSource().on('addfeature', function () {
        map.getView().fit(
            queryGeoJSON.getSource().getExtent(),
            { duration: 1000, size: map.getSize(), maxZoom: 18 }
        );
    });
};

function addGeoJsonFeature(fid) {
    if (queryGeoJSON) {
        queryGeoJSON.getSource().clear();
        map.removeLayer(queryGeoJSON);
    }

    var filteredGeoJSON = {
        "type": "FeatureCollection",
        "features": featureInfoData.features.filter(function (feature) {
            return (feature.id === fid);
        })
    };

    queryGeoJSON = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(filteredGeoJSON)
        }),
        style: cyanSelectionFeatureStyle,
    });

    map.addLayer(queryGeoJSON);
};
function showAlert(messageText, messageType, modelTrueFalse) {
    $(".alert").css("display", "block");
    $(".alert").addClass(messageType);
    $("#alertSpan").text(messageText);

    if (messageType == "alert-success") {
        $("#alertIcon").addClass("fa fa-check-circle");
    } else if (messageType == "alert-warning") {
        $("#alertIcon").addClass("fa-solid fa-triangle-exclamation");
    } else if (messageType == "alert-danger") {
        $("#alertIcon").addClass("fa-solid fa-circle-exclamation");
    }

    $(".alert").fadeTo(1000, 1);
    if (!modelTrueFalse) {
        window.setTimeout(function () {
            $(".alert").fadeTo(1000, 0, function () {
                $(".alert").removeClass(messageType);
                $("#alertSpan").text("");
                $(".alert").css("display", "none");
            });
        }, 3000);
    }

}

function hideAlert() {
    $(".alert").fadeTo(250, 0, function () {
        $("#alertSpan").text("");
        if ($(".alert").hasClass("alert-success")) {
            $(".alert").removeClass("alert-success");
            $("#alertIcon").removeClass("fa fa-check-circle");
        }
        if ($(".alert").hasClass("alert-warning")) {
            $(".alert").removeClass("alert-warning");
            $("#alertIcon").removeClass("fa-solid fa-triangle-exclamation");
        }
        if ($(".alert").hasClass("alert-danger")) {
            $(".alert").removeClass("alert-danger");
            $("#alertIcon").removeClass("fa-solid fa-circle-exclamation");
        }
    });
    $(".alert").css("display", "none");
}

function addFeature(evt) {
    if (yellowSelectionFeatureOverlay) {
        yellowSelectionFeatureOverlay.getSource().clear();
        map.removeLayer(yellowSelectionFeatureOverlay);
    }

    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
    }
    if (snap_edit) {
        map.removeInteraction(snap_edit);
    }

    var interactionType;
    source_mod = editgeojson.getSource();

    addFeatureInteraction = new ol.interaction.Draw({
        source: editgeojson.getSource(),
        type: editgeojson.getSource().getFeatures()[0].getGeometry().getType(),
        style: interactionStyle
    });
    map.addInteraction(addFeatureInteraction);
    snap_edit = new ol.interaction.Snap({
        source: editgeojson.getSource()
    });
    map.addInteraction(snap_edit);

    addFeatureInteraction.on('drawend', function (e) {
        var feature = e.feature;
        feature.set('geometry', feature.getGeometry());
        modifiedFeatureList.push(feature);
        addFeatureAttributeUpdate(feature);
        openRightPane();
        map.removeInteraction(addFeatureInteraction);
        map.removeInteraction(snap_edit);
    })
}

function modifyFeature(evt) {
    modifiedFeatureList = [];
    yellowSelectionFeatureOverlay.getSource().clear();
    map.removeLayer(yellowSelectionFeatureOverlay);
    var selectedFeature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });

    if (selectedFeature) {
        yellowSelectionFeatureOverlay.getSource().addFeature(selectedFeature);

        var modifySource = yellowSelectionFeatureOverlay.getSource();
        modifyInteraction = new ol.interaction.Modify({
            source: modifySource
        });
        map.addInteraction(modifyInteraction);

        var sourceEditGeoJson = editgeojson.getSource();
        snap_edit = new ol.interaction.Snap({
            source: sourceEditGeoJson
        });
        map.addInteraction(snap_edit);
        modifyInteraction.on('modifyend', function (e) {
            modifiedFeature = true;
            featureAdd = true;
            if (modifiedFeatureList.length > 0) {
                for (var j = 0; j < modifiedFeatureList.length; j++) {
                    if (e.features.item(0)['id_'] == modifiedFeatureList[j]['id_']) {
                        featureAdd = false;
                    }
                }
            }
            if (featureAdd) {
                modifiedFeatureList = [];
                modifiedFeatureList.push(e.features.item(0));
            }
        })

        var keys = selectedFeature.getKeys();
        $('#attributeUpdateTable').empty();
        var table = $("#attributeUpdateTable")[0];
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        table.appendChild(thead);
        table.appendChild(tbody)
        var row_1 = document.createElement('tr');
        var heading_1 = document.createElement('th');
        heading_1.innerHTML = selectedFeature.W.split('.')[0];
        heading_1.setAttribute("colspan", "2");

        row_1.appendChild(heading_1);
        thead.appendChild(row_1);

        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key != 'geometry') {
                var val = selectedFeature.get(key);

                var row_2 = document.createElement('tr');
                var row_2_data_1 = document.createElement('td');
                row_2_data_1.innerHTML = key;
                let row_2_data_2 = document.createElement('td');
                row_2_data_2.innerHTML = val;
                row_2_data_2.contentEditable = "true";

                row_2.appendChild(row_2_data_1);
                row_2.appendChild(row_2_data_2);

                tbody.appendChild(row_2);
            }
        }
        $("#attributeUpdateFooterDiv").css("display", "flex");
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#right").append($("#attributeUpdateDiv"));
        $("#attributeUpdateDiv").css("display", "block");
        openRightPane();
    } else {
        $('#attributeUpdateTable').empty();
        modifiedFeatureList = [];
        closeRightPane();
    }
}

var clones = [];

function saveEdits(editTaskName) {
    clones = [];
    for (var i = 0; i < modifiedFeatureList.length; i++) {
        var feature = modifiedFeatureList[i];
        var featureProperties = feature.getProperties();

        delete featureProperties.boundedBy;
        var clone = feature.clone();
        clone.setId(feature.getId());
        clones.push(clone)
    }

    if (editTaskName == 'update') { transactWFS('update_batch', clones); }
    if (editTaskName == 'insert') { transactWFS('insert_batch', clones); }
}

var formatWFS = new ol.format.WFS();
var transactWFS = function (mode, f) {

    var node;
    var formatGML = new ol.format.GML({
        featureNS: geoserverWorkspace,
        featureType: editLayer,
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        srsName: config.viewProjection
    });
    switch (mode) {
        case 'insert':
            node = formatWFS.writeTransaction([f], null, null, formatGML);
            break;
        case 'insert_batch':
            node = formatWFS.writeTransaction(f, null, null, formatGML);
            break;
        case 'update':
            node = formatWFS.writeTransaction(null, [f], null, formatGML);
            break;
        case 'update_batch':
            node = formatWFS.writeTransaction(null, f, null, formatGML);
            break;
        case 'delete':
            node = formatWFS.writeTransaction(null, null, [f], formatGML);
            break;
        case 'delete_batch':
            node = formatWFS.writeTransaction(null, null, [f], formatGML);
            break;
    }
    var xs = new XMLSerializer();
    var payload = xs.serializeToString(node);

    payload = payload.split('feature:' + editLayer).join(editLayer);
    if (editTask == 'insert') { payload = payload.split(geoserverWorkspace + ':geometry').join(geoserverWorkspace + ':geom'); }
    if (editTask == 'update') { payload = payload.split('<Name>geometry</Name>').join('<Name>geom</Name>'); }

    $.ajax('http://' + config.server.ipport + '/geoserver/wfs', {
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: payload.trim(),
        success: function (data) {
        },
        error: function (e) {
            var errorMsg = e ? (e.status + ' ' + e.statusText) : "";
            // console.log(errorMsg);
            showAlert("Error in updating record.", "alert-danger", true)
        }
    }).done(function () {
        showAlert("Record updated successfully.", "alert-success", false)
    });
};

function selectFeatureToDelete(evt) {

    modifiedFeatureList = [];
    yellowSelectionFeatureOverlay.getSource().clear();
    map.removeLayer(yellowSelectionFeatureOverlay);
    var selectedFeature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });

    if (selectedFeature) {
        yellowSelectionFeatureOverlay.getSource().addFeature(selectedFeature);

        var keys = selectedFeature.getKeys();
        $('#attributeUpdateTable').empty();
        var table = $("#attributeUpdateTable")[0];
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        table.appendChild(thead);
        table.appendChild(tbody)
        var row_1 = document.createElement('tr');
        var heading_1 = document.createElement('th');
        heading_1.innerHTML = selectedFeature.W.split('.')[0];
        heading_1.setAttribute("colspan", "2");

        row_1.appendChild(heading_1);
        thead.appendChild(row_1);

        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key != 'geometry') {
                var val = selectedFeature.get(key);

                var row_2 = document.createElement('tr');
                var row_2_data_1 = document.createElement('td');
                row_2_data_1.innerHTML = key;
                let row_2_data_2 = document.createElement('td');
                row_2_data_2.innerHTML = val;

                row_2.appendChild(row_2_data_1);
                row_2.appendChild(row_2_data_2);

                tbody.appendChild(row_2);
            }
        }
        modifiedFeatureList = [];
        modifiedFeatureList.push(selectedFeature);
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#right").append($("#attributeUpdateDiv"));
        $("#attributeUpdateDiv").css("display", "block");
        openRightPane();
    } else {
        $('#attributeUpdateTable').empty();
        modifiedFeatureList = [];
        closeRightPane();
    }
}

function selectFeatureAttributeUpdate(evt) {
    modifiedFeatureList = [];
    yellowSelectionFeatureOverlay.getSource().clear();
    map.removeLayer(yellowSelectionFeatureOverlay);
    var selectedFeature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });

    if (selectedFeature) {
        yellowSelectionFeatureOverlay.getSource().addFeature(selectedFeature);

        var keys = selectedFeature.getKeys();
        $('#attributeUpdateTable').empty();
        var table = $("#attributeUpdateTable")[0];
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        table.appendChild(thead);
        table.appendChild(tbody)
        var row_1 = document.createElement('tr');
        var heading_1 = document.createElement('th');
        heading_1.innerHTML = selectedFeature.W.split('.')[0];
        heading_1.setAttribute("colspan", "2");

        row_1.appendChild(heading_1);
        thead.appendChild(row_1);

        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key != 'geometry') {
                var val = selectedFeature.get(key);

                var row_2 = document.createElement('tr');
                var row_2_data_1 = document.createElement('td');
                row_2_data_1.innerHTML = key;
                let row_2_data_2 = document.createElement('td');
                row_2_data_2.innerHTML = val;
                row_2_data_2.contentEditable = "true";

                row_2.appendChild(row_2_data_1);
                row_2.appendChild(row_2_data_2);

                tbody.appendChild(row_2);
            }
        }
        $("#attributeUpdateFooterDiv").css("display", "flex");
        modifiedFeatureList = [];
        modifiedFeatureList.push(selectedFeature);
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        $("#right").append($("#attributeUpdateDiv"));
        $("#attributeUpdateDiv").css("display", "block");
        openRightPane();
    } else {
        $('#attributeUpdateTable').empty();
        modifiedFeatureList = [];
        closeRightPane();
    }
}

function addFeatureAttributeUpdate(selectedFeature) {
    if (selectedFeature) {
        var keys = editgeojson.getSource().getFeatures()[0].getKeys();

        $('#attributeUpdateTable').empty();
        var table = $("#attributeUpdateTable")[0];
        var tbody = document.createElement('tbody');
        table.appendChild(tbody)

        var row_2 = document.createElement('tr');
        var row_2_data_1 = document.createElement('td');
        row_2_data_1.innerHTML = "Layer";
        let row_2_data_2 = document.createElement('td');
        row_2_data_2.innerHTML = editLayer.split(':')[1];
        row_2.appendChild(row_2_data_1);
        row_2.appendChild(row_2_data_2);

        tbody.appendChild(row_2);


        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key != 'geometry' && key != '__gid' && key != 'id') {
                var val = selectedFeature.get(key);

                var row_2 = document.createElement('tr');
                var row_2_data_1 = document.createElement('td');
                row_2_data_1.innerHTML = key;
                let row_2_data_2 = document.createElement('td');
                row_2_data_2.innerHTML = '';
                row_2_data_2.contentEditable = "true";

                row_2.appendChild(row_2_data_1);
                row_2.appendChild(row_2_data_2);

                tbody.appendChild(row_2);
            }
            $("#attributeUpdateDiv").css("display", "block");
            $("#right").append($("#attributeUpdateDiv")[0]);
        }
        modifiedFeatureList.push(selectedFeature);
    } else {
        $('#attributeUpdateTable').empty();
        modifiedFeatureList = [];
    }
}

var markerFeature;
function addInteractionForSpatialQuery(intType) {
    draw = new ol.interaction.Draw({
        source: yellowSelectionFeatureOverlay.getSource(),
        type: intType,
        style: interactionStyle
    });
    map.addInteraction(draw);
    yellowSelectionFeatureOverlay.getSource().on('addfeature', function () { });

    draw.on('drawend', function (e) {
        markerFeature = e.feature;
        markerFeature.set('geometry', markerFeature.getGeometry());
        map.removeInteraction(draw);
        $('#spUserInput').toggleClass('clicked');
    })
}

// start : live search function
var txtVal = "";

var typingTimer;                //timer identifier
var doneTypingInterval = 500;  //time in ms (1 seconds)


$('#inpt_search').keyup(function () {
    clearTimeout(typingTimer);
    if ($('#inpt_search').val()) {
        typingTimer = setTimeout(liveSearch, doneTypingInterval);
    } else {
        clearResults();
    }
});

function liveSearch() {
    var newVal = $('#inpt_search').val().trim();
    if (newVal == txtVal) {
    } else {
        txtVal = $('#inpt_search').val();
        txtVal = txtVal.trim();
        var response_substation;
        var response_msp;
        var response_bp;
        if (txtVal !== "") {
            if (txtVal.length > 2) {
                clearResults();
                createLiveSearchTable();

                var searchLayerName;
                var searchAttributeName;
                for (q = 0; q < config.search.length; q++) {
                    if (searchLayerName == undefined) {
                        searchLayerName = config.search[q].layer_name;
                        searchAttributeName = config.search[q].attributes;
                    } else {
                        searchLayerName = searchLayerName + "," + config.search[q].layer_name;
                        searchAttributeName = searchAttributeName + "|" + config.search[q].attributes;
                    }
                }

                $.ajax({
                    url: './resources/php/fetch.php',
                    type: 'POST',
                    data: { request: 'liveSearch', searchTxt: txtVal, searchLayer: searchLayerName, searchAttribute: searchAttributeName },
                    dataType: 'json',
                    success: function (response) {
                        if (config.search.length == 1 && response.length > 0) {
                            createRows(response, config.search[0].layer_name, config.search[0].external_name, txtVal);
                        } else if (response.length > 1 && response.length > 0) {
                            for (r = 0; r < response.length; r++) {
                                for (s = 0; s < config.search.length; s++) {
                                    if (config.search[s].attributes == Object.keys(response[r][0])[0]) {
                                        createRows(response[r], config.search[s].layer_name, config.search[s].external_name, txtVal);
                                    }
                                }
                            }
                        }
                    },
                    error: function (e) {
                        alert(e);
                        // console.log(e);
                    }
                });
            } else { clearResults(); }
        } else {
            clearResults();
        }
    }
}

var liveDataDivEle = $('#liveDataDiv')[0];
var searchTable = $("#assetSearchTableID")[0];


function createLiveSearchTable() {
    var tableHeaderRow = document.createElement('tr');
    var th1 = document.createElement('th');
    th1.innerHTML = "Layer";
    if (config.theme == "red") { th1.setAttribute("class", "table-danger table-bordered table-sm border-dark"); }
    if (config.theme == "green") { th1.setAttribute("class", "table-success table-bordered table-sm border-dark"); }
    if (config.theme == "blue") { th1.setAttribute("class", "table-primary table-bordered table-sm border-dark"); }
    if (config.theme == "black") { th1.setAttribute("class", "table-secondary table-bordered table-sm border-dark"); }
    tableHeaderRow.appendChild(th1);

    var th2 = document.createElement('th');
    th2.innerHTML = "Feature";
    if (config.theme == "red") { th2.setAttribute("class", "table-danger table-bordered table-sm border-dark"); }
    if (config.theme == "green") { th2.setAttribute("class", "table-success table-bordered table-sm border-dark"); }
    if (config.theme == "blue") { th2.setAttribute("class", "table-primary table-bordered table-sm border-dark"); }
    if (config.theme == "black") { th2.setAttribute("class", "table-secondary table-bordered table-sm border-dark"); }
    tableHeaderRow.appendChild(th2);

    searchTable.appendChild(tableHeaderRow);
}

function updateLiveTable(response) {
    $.each(response, function (i, item) {
        var $tr = $('<tr>').append(
            $('<td>').text(item.rank),
            $('<td>').text(item.content),
            $('<td>').text(item.UID)
        ).appendTo('#assetSearchTableID tbody');
    });
}

function createRows(data, layerName, external_name, searchTxt) {
    $("." + "live" + layerName).remove();
    var i = 0;
    for (var key in data) {
        var data2 = data[key];
        var tableRow = document.createElement('tr');
        tableRow.setAttribute("class", "live" + layerName);
        var td1 = document.createElement('td');
        if (i == 0) { td1.innerHTML = external_name; }
        var td2 = document.createElement('td');
        for (var key2 in data2) {
            td2.innerHTML = data2[key2];
            td2.setAttribute('onClick', 'zoomToFeature(this,\'' + layerName + '\',\'' + key2 + '\')');
        }
        tableRow.appendChild(td1);
        tableRow.appendChild(td2);
        searchTable.appendChild(tableRow);

        i = i + 1;
    }

    var ibControl = new ol.control.Control({
        element: liveDataDivEle,
    });
    $("#liveDataDiv").css("display", "block");
    map.addControl(ibControl);
}

function clearResults() {
    $("#assetSearchTableID").empty();
    $("#liveDataDiv").css("display", "none");
    map.removeLayer(queryGeoJSON);
}

function zoomToFeature(featureName, layerName, attributeName) {
    var value_layer = layerName;
    var value_attribute = attributeName.split(",")[0];
    var value_operator = "==";
    var value_txt = featureName.innerHTML.split(",")[0];
    var url = "http://" + serverPort + "/geoserver/" + config.workspace + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=" + value_attribute + "+" + value_operator + "+'" + value_txt + "'&outputFormat=application/json"
    addGeoJsonURL(url);
}
// end : live search function

// start : add wms layers


function add_wms_layers() {
    $.ajax({
        type: "GET",
        url: 'http://' + config.server.ipport + '/geoserver/wms?request=getCapabilities',
        dataType: "xml",
        success: function (xml) {
            var table = $('#table_wms_layers')[0];
            $('#table_wms_layers').empty();
            var tr = table.insertRow(-1);
            var th1 = document.createElement("th");
            th1.innerHTML = "Name";

            var th2 = document.createElement("th");
            th2.innerHTML = "Title";
            tr.appendChild(th1);
            tr.appendChild(th2);

            $(xml).find('Layer').find('Layer').each(function () {
                var name = $(this).children('Name').text();
                var title = $(this).children('Title').text();

                var tr = table.insertRow(-1);
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = name;

                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = title;
                tr.setAttribute('onclick', "addRowHandlers('" + name + "," + title + "')");
            });
        }
    });
}

var layer_name;
var layer_title;
function addRowHandlers(lyrName) {
    var i = 0;
    var t = $("#table_wms_layers")[0];
    layer_name = lyrName.split(",")[0];
    layer_title = lyrName.split(",")[1];
    $("#table_wms_layers tr").each(function () {

        var lyrVal = t.rows[i].cells[0].innerHTML;
        if (lyrVal == layer_name) {
            $(this).children('td').css('background-color', 'lightgrey');
        } else {
            $(this).children('td').css('background-color', 'white');
        }
        i = i + 1;
    });
}

var wmsGroupLayer;

var layer_wms;
function add_WMS_layer() {
    var name = layer_name.split(":");

    if (wmsGroupLayer == undefined) {
        wmsGroupLayer = new ol.layer.Group({
            title: "WMS Overlays",
            fold: 'open',
            layers: []
        });
        map.addLayer(wmsGroupLayer);
    }

    layer_wms = new ol.layer.Image({
        // title: name[1],
        title: layer_title,
        visible: true,
        source: new ol.source.ImageWMS({
            url: 'http://' + config.server.ipport + '/geoserver/' + config.workspace + '/wms',
            params: { 'LAYERS': layer_name, 'TILED': true },
            serverType: 'geoserver',
            transparent: true,
            transition: 0,
            crossOrigin: "anonymous"
        }),
    })
    // map.addLayer(layer_wms);
    wmsGroupLayer.getLayers().push(layer_wms);

    var url = 'http://' + config.server.ipport + '/geoserver/wms?request=getCapabilities';
    var parser = new ol.format.WMSCapabilities();

    $.ajax(url).then(function (response) {
        var result = parser.read(response);
        var Layers = result.Capability.Layer.Layer;
        var extent;
        for (var i = 0, len = Layers.length; i < len; i++) {
            var layerobj = Layers[i];
            if (layerobj.Name == layer_name) {
                if (layerobj.CRS[0] == config.viewProjection) {
                    extent = layerobj.BoundingBox[1].extent;
                } else if (layerobj.CRS[0] == "EPSG:4326") {
                    extent = ol.proj.transformExtent(layerobj.BoundingBox[0].extent, "EPSG:4326", config.viewProjection)
                } else {
                    extent = ol.proj.transformExtent(layerobj.BoundingBox[1].extent, layerobj.CRS[0], config.viewProjection)
                }
                // ol.proj.transformExtent(featExtent, layerProjection, config.viewProjection),
                map.getView().fit(
                    extent,
                    { duration: 1590, size: map.getSize() }
                );

            }
        }
    });
    var layerSwitcherControl = new ol.control.LayerSwitcher.renderPanel(map, $('#layerContainer')[0], { reverse: true });
    // legend();
}
// end : add wms layers

function getLegend(res) {
    $("#divLegendGraphics").empty();
    var no_layers = allLayers.length;
    for (i = 0; i < no_layers; i++) {
        var element = document.getElementById("divLegendGraphics");
        var head = document.createElement("p");
        var txt = document.createTextNode(allLayers[i].get('title'));
        head.appendChild(txt);
        element.appendChild(head);
        var img = new Image();
        img.src = allLayers[i].getSource().getLegendUrl(res);
        element.appendChild(img);
    }
}

// mapView.on('change:resolution', function (event) {
//     const resolution = event.target.getResolution();
//     getLegend(resolution);
// });

// end : general functions

// start : onload functions
$(function () {
    activeControl = "Layers";
    switch (config.theme) {
        case "red":
            $('.navbar').addClass('bg-danger');
            $('#left').addClass('border-danger');
            $('#right').addClass('border-danger');
            $('#middle').addClass('border-danger');
            $('#bottom').addClass('border-danger');
            $('table th').css('background', 'bg-danger bg-opacity-50 !important');
            break;
        case "green":
            $('.navbar').addClass('bg-success');
            $('#left').addClass('border-success');
            $('#right').addClass('border-success');
            $('#middle').addClass('border-success');
            $('#bottom').addClass('border-success');
            $('table th').css('background', 'bg-success bg-opacity-50 !important');
            break;
        case "blue":
            $('.navbar').addClass('bg-primary');
            $('#left').addClass('border-primary');
            $('#right').addClass('border-primary');
            $('#middle').addClass('border-primary');
            $('#bottom').addClass('border-primary');
            $('table th').css('background', 'bg-primary bg-opacity-50 !important');
            break;
        case "black":
            $('.navbar').addClass('bg-dark');
            $('#left').addClass('border-dark');
            $('#right').addClass('border-dark');
            $('#middle').addClass('border-dark');
            $('#bottom').addClass('border-dark');
            $('table th').css('background', 'bg-dark bg-opacity-50 !important');
            break;
        default:
            $('.navbar').addClass('bg-dark');
            $('#left').addClass('border-dark');
            $('#right').addClass('border-dark');
            $('#middle').addClass('border-dark');
            $('#bottom').addClass('border-dark');
            $('table th').css('background', 'bg-dark bg-opacity-50 !important');
    }

    allApps = (config.apps.view.concat(config.apps.query)).concat(config.apps.edit);
    for (i = 0; i < allApps.length; i++) {
        if (!(localStorage.getItem("applications").includes(allApps[i]))) {
            $('#' + allApps[i]).remove();
        }
    }

    var layerSwitcherControl = new ol.control.LayerSwitcher.renderPanel(map, $('#layerContainer')[0], { reverse: true });

    addMapLayerList("editing", 'editingLayer');

    add_wms_layers();

    getLegend(mapView.getResolution());

    $('#home').click(function () {
        map.getView().setCenter(config.mapview.center);
        map.getView().setZoom(config.mapview.zoom);
    });

    $('#fullScreen').click(function () {
        $("#fullScreen").toggleClass("clicked");
        var mapEle = document.getElementsByTagName("BODY")[0];
        if ($('#fullScreen').hasClass('clicked')) {
            $("#fullScreen").html('<i class="fa fa-times fa-lg" aria-hidden="true"></i>');
            if (mapEle.requestFullscreen) {
                mapEle.requestFullscreen();
            } else if (mapEle.msRequestFullscreen) {
                mapEle.msRequestFullscreen();
            } else if (mapEle.mozRequestFullscreen) {
                mapEle.mozRequestFullscreen();
            } else if (mapEle.webkitRequestFullscreen) {
                mapEle.webkitRequestFullscreen();
            }
        } else {
            $("#fullScreen").html('<i class="fa fa-arrows-alt fa-lg" aria-hidden="true"></i>');
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    $('#layers').click(function () {
        $("#layers").toggleClass("clicked");
        if ($('#layers').hasClass('clicked')) {
            deactivateControl("Legends");
            $("#left").children().css("display", "none");
            $("#left").children().appendTo("body");

            $("#left").append($("#divLayers"));
            $("#divLayers").css("display", "block");

            activeControl = "Layers";

            openLeftPane();
        } else {

            $("#left").children().css("display", "none");
            $("#left").children().appendTo("body");

            closeLeftPane();
            deactivateControl("Layers");
            activeControl = "";
        }
    })

    $('#legends').click(function () {
        $("#legends").toggleClass("clicked");
        if ($('#legends').hasClass('clicked')) {
            deactivateControl("Layers");
            $("#left").children().css("display", "none");
            $("#left").children().appendTo("body");

            $("#left").append($("#divLegend"));
            $("#divLegend").css("display", "block");

            activeControl = "Legends";
            openLeftPane();
        } else {
            $("#left").children().css("display", "none");
            $("#left").children().appendTo("body");
            closeLeftPane();
            deactivateControl("Legends");
            activeControl = "";
        }
    })

    $('#pan').click(function () {
        $("#pan").toggleClass("clicked");
        if ($('#pan').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            $("#map").css("cursor", "grab");
            activeControl = "Pan";
        } else {
            deactivateControl("Pan");
            activeControl = "";
        }
    });

    $('#zoomIn').click(function () {
        $("#zoomIn").toggleClass("clicked");
        if ($('#zoomIn').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            $("#map").css("cursor", "zoom-in");
            map.addInteraction(zoomInInteraction);
            activeControl = "ZoomIn";
        } else {
            deactivateControl("ZoomIn");
            activeControl = "";
        }
    });

    $('#zoomOut').click(function () {
        $("#zoomOut").toggleClass("clicked");
        if ($('#zoomOut').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            $("#map").css("cursor", "zoom-out");
            map.addInteraction(zoomOutInteraction);
            activeControl = "ZoomOut";
        } else {
            deactivateControl("ZoomOut");
            activeControl = "";
        }
    });


    $('#measureLength').click(function () {
        $("#measureLength").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#measureLength').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            map.removeInteraction(draw);
            addInteraction('LineString');
            activeControl = "MeasureLength";
        } else {
            deactivateControl("MeasureLength");
            activeControl = "";
        }
    });

    $('#measureArea').click(function () {
        $("#measureArea").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#measureArea').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            map.removeInteraction(draw);
            addInteraction('Polygon');
            activeControl = "MeasureArea";
        } else {
            deactivateControl("MeasureArea");
            activeControl = "";
        }
    });

    var printControl = new ol.control.Print();
    map.addControl(printControl);

    printControl.on('printing', function (e) {
        $('body').css('opacity', .5);
    });
    printControl.on('print', function (e) {
        $('body').css('opacity', 1);
        // Print success
        if (e.image) {
            if (e.pdf) {
                var pdf = new jsPDF({
                    orientation: e.orientation,
                    unit: e.print.unit,
                    format: e.format,
                });
                const margin = 0;

                const pdfWidth = pdf.internal.pageSize.width * (1 - margin);
                const pdfHeight = pdf.internal.pageSize.height * (1 - margin);

                // const x = pdf.internal.pageSize.width * (margin / 2);
                // const y = pdf.internal.pageSize.height * (margin / 2);

                const widthRatio = pdfWidth / e.print.imageWidth;
                const heightRatio = pdfHeight / e.print.imageHeight;
                const ratio = Math.min(widthRatio, heightRatio);

                const w = e.print.imageWidth * ratio;
                const h = e.print.imageHeight * ratio;

                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;

                pdf.addImage(e.image, 'JPEG', x, y, w, h);
                pdf.save('map.pdf');
            } else {
                // e.canvas.toBlob(function (blob) {
                //     saveAs(blob, 'map.' + e.imageType.replace('image/', ''));
                // }, e.imageType);
            }
        } else {
            console.warn('No canvas to export');
        }
    });
    printControl.on('error', function (e) {
        console.log(e);
    });

    $('#downloadMap').click(function () {
        $("#downloadMap").toggleClass("clicked");
        if ($('#downloadMap').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            $("#map").css("cursor", "pointer");

            $("#right").children().css("display", "none");
            $("#right").children().appendTo("body");

            $("#right").append($("#divPrint"));
            $("#divPrint").css("display", "block");

            openRightPane();
            activeControl = "downloadMap";
        } else {
            deactivateControl("downloadMap");
            $("#right").children().css("display", "none");
            $("#right").children().appendTo("body");
            closeRightPane();
            activeControl = "";
        }
    });

    $('#btnMapPlot').click(function () {
        // var imageType = $('#selectFormat').find(":selected").val();
        var imageType = 'image/pdf';
        // var orientation = $('#selectOrientation').find(":selected").val();
        var orientation = 'landscape'
        var format = $('#selectPageSize').find(":selected").val();
        // var size = $('#selectPageSize').find(":selected").val().split("-")[1];

        if (imageType == 'image/pdf') {
            imageType = 'image/jpeg';
            printControl.print({
                imageType: imageType,
                orientation: orientation,
                format: format,
                immediate: true,
                // size: size,
                pdf: true
            })
        } else {
            printControl.print({
                imageType: imageType,
                orientation: orientation,
                format: format,
                // size: size
            })
        }
    });

    $('#btnMapPlotCancel').click(function () {
        deactivateControl("downloadMap");
        $("#right").children().css("display", "none");
        $("#right").children().appendTo("body");
        closeRightPane();
        activeControl = "";
    });

    $('#featureInfo').click(function () {
        $("#featureInfo").toggleClass("clicked");
        if ($('#featureInfo').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            $("#map").css("cursor", "pointer");

            $("#featureInfoDiv").css("display", "block");
            $("#right").append($("#featureInfoDiv"));
            activeControl = "FeatureInfo";
        } else {
            deactivateControl("FeatureInfo");
            closeRightPane();
            activeControl = "";
        }
    });

    $('#attributeQuery').click(function () {
        $("#attributeQuery").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#attributeQuery').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            // addMapLayerList('selectLayer');
            addMapLayerList("attributeQuery", 'selectLayer');

            $("#right").children().css("display", "none");
            $("#right").children().appendTo("body");

            $("#right").append($("#attQueryDiv"));
            $("#attQueryDiv").css("display", "block");

            closeBottomPane();
            openRightPane();
            activeControl = "AttributeQuery";
        } else {
            deactivateControl("AttributeQuery");
            activeControl = "";
        }
    });

    $('#spatialQuery').click(function () {
        $("#spatialQuery").toggleClass("clicked");
        $("#map").css("cursor", "default");
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
        if ($('#spatialQuery').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            // addMapLayerList_spQry();
            addMapLayerList("spatialQuery", "buffSelectLayer");

            $("#right").children().css("display", "none");
            $("#right").children().appendTo("body");
            $("#bottom").children().css("display", "none");
            $("#bottom").children().appendTo("body");

            $("#spQueryDiv").css("display", "block");
            $("#right").append($("#spQueryDiv"));

            closeBottomPane();
            openRightPane();
            activeControl = "SpatialQuery";
        } else {
            deactivateControl("SpatialQuery");
            activeControl = "";
        }
    });

    $("#selectLayer").change(function () {
        $("#selectAttribute").empty();
        var value_layer = $("#selectLayer").val();
        getLayerProjection(value_layer);
        // console.log(layerProjection);
        $(document).ready(function () {
            $.ajax({
                type: "GET",
                url: "http://" + serverPort + "/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=" + value_layer,
                dataType: "xml",
                success: function (xml) {

                    var select = $('#selectAttribute');
                    select.append("<option class='ddindent' value=''></option>");
                    $(xml).find('xsd\\:sequence').each(function () {

                        $(this).find('xsd\\:element').each(function () {
                            var value = $(this).attr('name');
                            var type = $(this).attr('type');
                            if (value != 'geom' && value != 'the_geom') {
                                select.append("<option class='ddindent' value='" + type + "'>" + value + "</option>");
                            }
                        });

                    });
                }
            });
        });
    })

    $("#selectAttribute").change(function () {
        $('#selectOperator').empty();

        var operator = $("#selectOperator")[0];
        var value_type = $("#selectAttribute").val();
        operator.options[0] = new Option("", "");

        if (value_type == 'xsd:short' || value_type == 'xsd:int' || value_type == 'xsd:double' || value_type == 'xsd:long') {
            operator.options[1] = new Option('Greater than', '>');
            operator.options[2] = new Option('Less than', '<');
            operator.options[3] = new Option('Equal to', '=');
        }
        else if (value_type == 'xsd:string') {
            operator.options[1] = new Option('Like', 'Like');
            operator.options[2] = new Option('Equal to', '=');
        }
    })

    $('#attQryRun').click(function () {
        var layer = $("#selectLayer")[0];
        var attribute = $("#selectAttribute")[0];
        var operator = $("#selectOperator")[0];
        var txt = $("#enterValue")[0];

        if (layer) {
            if (layer.options.selectedIndex == 0) {
                showAlert("Select Layer", "alert-danger", true);
            } else if (attribute.options.selectedIndex == 0) {
                showAlert("Select Attribute", "alert-danger", true);
            } else if (operator.options.selectedIndex <= 0) {
                showAlert("Select Operator", "alert-danger", true);
            } else if (txt.value.length <= 0) {
                showAlert("Enter Value", "alert-danger", true);
            } else {
                $(".loader-container").css("display", "block");
                $("#map").css("cursor", "progress");

                var value_layer = layer.options[layer.selectedIndex].value;
                var value_attribute = attribute.options[attribute.selectedIndex].text;
                var value_operator = operator.options[operator.selectedIndex].value;
                var value_txt = txt.value;
                if (value_operator == 'Like') {
                    value_txt = "%25" + value_txt + "%25";
                }
                else {
                    value_txt = value_txt;
                }
                var url = "http://" + serverPort + "/geoserver/" + geoserverWorkspace + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=" + value_attribute + "+" + value_operator + "+'" + value_txt + "'&outputFormat=application/json"

                newpopulateQueryTable(url);
            }
            $("#map").css("cursor", "default");
            $('body').css('pointer-events', 'auto');
        }
    })

    $("#buffSelectLayer").change(function () {
        var valuelayer = $("#buffSelectLayer").val();
        getLayerProjection(valuelayer);
    })

    $("#srcCriteria").change(function () {
        if (queryGeoJSON) {
            queryGeoJSON.getSource().clear();
            map.removeLayer(queryGeoJSON);
        }

        if (yellowSelectionFeatureOverlay) {
            yellowSelectionFeatureOverlay.getSource().clear();
            map.removeLayer(yellowSelectionFeatureOverlay);
        }
        if ($('#spUserInput').hasClass('clicked')) { $('#spUserInput').toggleClass('clicked'); }
    })

    $('#spUserInput').click(function () {
        $('#spUserInput').toggleClass('clicked');
        if ($('#spUserInput').hasClass('clicked')) {
            if (queryGeoJSON) {
                queryGeoJSON.getSource().clear();
                map.removeLayer(queryGeoJSON);
            }

            if (yellowSelectionFeatureOverlay) {
                yellowSelectionFeatureOverlay.getSource().clear();
                map.removeLayer(yellowSelectionFeatureOverlay);
            }
            var srcCriteriaValue = $('#srcCriteria').find(":selected").val();

            if (srcCriteriaValue == 'pointMarker') {
                addInteractionForSpatialQuery('Point');

            }
            if (srcCriteriaValue == 'lineMarker') {
                addInteractionForSpatialQuery('LineString');
            }
            if (srcCriteriaValue == 'polygonMarker') {
                addInteractionForSpatialQuery('Polygon');
            }
        } else {
            coordList = '';
            markerFeature = undefined;
            map.removeInteraction(draw);
        }
    })

    $('#spQryRun').click(function () {

        var spLayer = $("#buffSelectLayer")[0];
        var spQueryType = $("#qryType")[0];
        var spQueryCriteria = $("#srcCriteria")[0];
        var bufferDistance = $("#bufferDistance")[0];

        if (spLayer.options.selectedIndex == 0) {
            showAlert("Select layer", "alert-danger", true);
        } else if (spQueryType.options.selectedIndex == -1) {
            showAlert("Select Query Type", "alert-danger", true);
        } else if (spQueryCriteria.options.selectedIndex == -1) {
            showAlert("Select Marker Type", "alert-danger", true);
        } else if ($('#qryType option:selected').text() == "Within Distance of" && bufferDistance.value <= 0) {
            showAlert("Enter Buffer Distance", "alert-danger", true);
        } else if (($('#qryType option:selected').text() == "Completely Within") && (!$('#srcCriteria option:selected').text() == 'Polygon Marker')) {
            showAlert("Select 'Polygon Marker' for 'Completely Within' search critria.", "alert-danger", true);
        } else if (!markerFeature) {
            showAlert("Marker feature not found.", "alert-danger", true);
        } else {
            $('body').css('pointer-events', 'none');
            $("#map").css("cursor", "progress");

            var layer = $("#buffSelectLayer")[0];
            var value_layer = layer.options[layer.selectedIndex].value;

            var srcCriteria = $("#srcCriteria")[0];
            var value_src = srcCriteria.options[srcCriteria.selectedIndex].value;
            var coordList = '';
            var url;
            var markerType = '';
            if (markerFeature) {

                var cloneMarkerFeature = markerFeature.clone();

                if (value_src == 'pointMarker') {
                    if (config.viewProjection == layerProjection) {
                        coordList = cloneMarkerFeature.getGeometry().getCoordinates()[0] + " " + cloneMarkerFeature.getGeometry().getCoordinates()[1];
                    } else {
                        var newCoord = ol.proj.transform(cloneMarkerFeature.getGeometry().getCoordinates(), config.viewProjection, layerProjection);
                        coordList = newCoord[0] + " " + newCoord[1];
                    }
                    markerType = 'Point';
                }
                if (value_src == 'lineMarker') {
                    var coordArray = cloneMarkerFeature.getGeometry().getCoordinates();
                    if (config.viewProjection == layerProjection) {
                        for (i = 0; i < coordArray.length; i++) {
                            if (i == 0) {
                                coordList = coordArray[i][0] + " " + coordArray[i][1];
                            } else {
                                coordList = coordList + ", " + coordArray[i][0] + " " + coordArray[i][1];
                            }
                        }
                    } else {
                        for (i = 0; i < coordArray.length; i++) {
                            var newCoord = ol.proj.transform(coordArray[i], config.viewProjection, layerProjection);
                            if (i == 0) {
                                coordList = newCoord[0] + " " + newCoord[1];
                            } else {
                                coordList = coordList + ", " + newCoord[0] + " " + newCoord[1];
                            }
                        }
                    }
                    markerType = 'LineString';
                }
                if (value_src == 'polygonMarker') {
                    var coordArray = cloneMarkerFeature.getGeometry().getCoordinates()[0];
                    // for (i = 0; i < coordArray.length; i++) {
                    //     if (i == 0) {
                    //         coordList = coordArray[i][0] + " " + coordArray[i][1];
                    //     } else {
                    //         coordList = coordList + ", " + coordArray[i][0] + " " + coordArray[i][1];
                    //     }
                    // }
                    if (config.viewProjection == layerProjection) {
                        for (i = 0; i < coordArray.length; i++) {
                            if (i == 0) {
                                coordList = coordArray[i][0] + " " + coordArray[i][1];
                            } else {
                                coordList = coordList + ", " + coordArray[i][0] + " " + coordArray[i][1];
                            }
                        }
                    } else {
                        for (i = 0; i < coordArray.length; i++) {
                            var newCoord = ol.proj.transform(coordArray[i], config.viewProjection, layerProjection);
                            if (i == 0) {
                                coordList = newCoord[0] + " " + newCoord[1];
                            } else {
                                coordList = coordList + ", " + newCoord[0] + " " + newCoord[1];
                            }
                        }
                    }
                    coordList = "(" + coordList + ")";
                    markerType = 'Polygon';
                }

                var value_attribute = $('#qryType option:selected').text();
                if (value_attribute == 'Within Distance of') {
                    var dist = $("#bufferDistance")[0];
                    var value_dist = Number(dist.value);
                    var distanceUnit = $("#distanceUnits")[0];
                    var value_distanceUnit = distanceUnit.options[distanceUnit.selectedIndex].value;

                    url = "http://" + serverPort + "/geoserver/" + geoserverWorkspace + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=DWITHIN(geom," + markerType + "(" + coordList + ")," + value_dist + "," + value_distanceUnit + ")&outputFormat=application/json";
                } else if (value_attribute == 'Intersecting') {
                    url = "http://" + serverPort + "/geoserver/" + geoserverWorkspace + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=INTERSECTS(geom," + markerType + "(" + coordList + "))&outputFormat=application/json";
                } else if (value_attribute == 'Completely Within') {
                    url = "http://" + serverPort + "/geoserver/" + geoserverWorkspace + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=WITHIN(geom," + markerType + "(" + coordList + "))&outputFormat=application/json";
                }
                newpopulateQueryTable(url);
                coordList = '';
            }
        }

        $("#map").css("cursor", "default");
        $('body').css('pointer-events', 'auto');
    })

    var mapInteractions = map.getInteractions();
    for (var x = 0; x < mapInteractions.getLength(); x++) {
        var mapInteraction = mapInteractions.item(x);
        if (mapInteraction instanceof ol.interaction.DoubleClickZoom) {
            map.removeInteraction(mapInteraction);
            break;
        }
    }

    $("#qryType").change(function () {
        var value_attribute = $('#qryType option:selected').text();
        var buffDivElement = $("#bufferDiv")[0];

        if (value_attribute == 'Within Distance of') {
            buffDivElement.style.display = "block";
            $('#lblsrcCriteria').text("from");
            $('#pointMarker').attr("disabled", false);
            $('#lineMarker').attr("disabled", false);
        } else if (value_attribute == 'Intersecting') {
            buffDivElement.style.display = "none";
            $('#lblsrcCriteria').text("with");
            $('#pointMarker').attr("disabled", false);
            $('#lineMarker').attr("disabled", false);
        } else if (value_attribute == 'Completely Within') {
            buffDivElement.style.display = "none";
            $('#lblsrcCriteria').text("");
            $('#pointMarker').attr("disabled", true);
            $('#lineMarker').attr("disabled", true);
            $("#srcCriteria").val("polygonMarker");
        }
    })

    $('#spQryClear').click(function () {
        if (queryGeoJSON) {
            queryGeoJSON.getSource().clear();
            map.removeLayer(queryGeoJSON);
        }

        if (yellowSelectionFeatureOverlay) {
            yellowSelectionFeatureOverlay.getSource().clear();
            map.removeLayer(yellowSelectionFeatureOverlay);
        }
        coordList = '';
        markerFeature = undefined;
        $("attListDivTest").css("display", "none");
        closeBottomPane();
    })

    $('#attQryClear').click(function () {
        if (queryGeoJSON) {
            queryGeoJSON.getSource().clear();
            map.removeLayer(queryGeoJSON);
        }

        if (yellowSelectionFeatureOverlay) {
            yellowSelectionFeatureOverlay.getSource().clear();
            map.removeLayer(yellowSelectionFeatureOverlay);
        }
        coordList = '';
        markerFeature = undefined;
        $("attListDivTest").css("display", "none");
        closeBottomPane();
    })

    $('#attributeUpdateCancelButton').click(function () {
        yellowSelectionFeatureOverlay.getSource().clear();
        map.removeLayer(yellowSelectionFeatureOverlay);
        $('#attributeUpdateTable').empty();
        modifiedFeatureList = [];
        closeRightPane();
        editgeojson.getSource().refresh();
        if (activeControl == "AddFeature") {
            map.addInteraction(addFeatureInteraction);
            map.addInteraction(snap_edit);
        }
    })

    $('#attributeUpdateSaveButton').click(function () {
        clones = [];

        var feature = modifiedFeatureList[0];
        var featureProperties = feature.getProperties();
        delete featureProperties.boundedBy;

        var table = $('#attributeUpdateTableDiv').children()[0];
        for (var i = 1; i < table.rows.length; i++) {
            if (i != 0) {
                if (table.rows[i].cells[1].innerHTML != '') {
                    featureProperties[table.rows[i].cells[0].innerHTML] = table.rows[i].cells[1].innerHTML;
                }
            }
        }

        if (editTask != 'insert') {
            $('#attributeUpdateTableDiv').children().each(function () {
                featureProperties[this.children[1].id] = this.children[1].value
            });
        }
        var clone = feature.clone();
        clone.setId(feature.getId());
        if (editTask != 'delete') {
            clone.setProperties(featureProperties);
        }
        clones.push(clone)
        if (editTask == 'insert') {
            transactWFS('insert', clone);
        } else if (editTask == 'update') {
            transactWFS('update', clone);
        } else if (editTask == 'delete') {
            transactWFS('delete', clone);
        }
        modifiedFeatureList = [];
        yellowSelectionFeatureOverlay.getSource().clear();
        map.removeLayer(yellowSelectionFeatureOverlay);
        setTimeout(function () { editgeojson.getSource().refresh(); }, 1000);
        if (activeControl == "AddFeature") {
            map.addInteraction(addFeatureInteraction);
            map.addInteraction(snap_edit);
        }
        $('#attributeUpdateTable').empty();
        modifiedFeatureList = [];
        closeRightPane();
    })

    $('#logout').click(function () {
        localStorage.setItem('status', 'loggedOut');
        window.location.replace(window.location.href.replace("map.html", "index.html"));
    })

    $('#settings').click(function () {
        $("#settings").toggleClass("clicked");
        $("#map").css("cursor", "default");
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
        if ($('#settings').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            if (activeControl == "AddFeature" || activeControl == "ModifyFeature" || activeControl == "DeleteFeature" || activeControl == "ModifyAttribute") {
                deactivateControl("StartEditing");
            }
            $("#right").children().css("display", "none");
            $("#right").children().appendTo("body");
            $("#bottom").children().css("display", "none");
            $("#bottom").children().appendTo("body");

            $("#settingsDiv").css("display", "block");
            $("#settingsDiv").removeClass("d-none");
            $("#right").append($("#settingsDiv"));

            closeBottomPane();
            openRightPane();
            activeControl = "Settings";
        } else {
            deactivateControl("Settings");
            activeControl = "";
        }
    });

    $('#startEditing').click(function () {
        $("#startEditing").toggleClass("clicked");
        $("#map").css("cursor", "default");
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
        if ($('#startEditing').hasClass('clicked')) {
            if(!(activeControl == "Layers" || activeControl == "Legends")){
                deactivateControl(activeControl);
            }
            $("#attQueryDiv").appendTo('body');
            $("#spQueryDiv").appendTo('body');
            $("#attQueryDiv").css("display", "none");
            $("#spQueryDiv").css("display", "none");
            $("#attListDivTest").appendTo('body');
            $("#attListDivTest").css("display", "none");
            $("#settingsDiv").css("display", "none");
            $("#settingsDiv").appendTo('body');

            closeBottomPane();
            closeRightPane();

            editLayer = $('#editingLayer').find(":selected").val();

            if (editLayer) {
                if (editLayer.length > 0) {
                    if (mapView.getZoom() > 19) {
                        $("#editingTools").css("display", "block");
                        if (editgeojson) {
                            editgeojson.getSource().clear();
                            map.removeLayer(editgeojson);
                        }

                        editgeojson = new ol.layer.Vector({
                            title: "Edit Layer",
                            source: new ol.source.Vector({
                                format: new ol.format.GeoJSON(),
                                url: function (extent) {
                                    return 'http://' + config.server.ipport + '/geoserver/' + geoserverWorkspace + '/ows?service=WFS&' +
                                        'version=1.0.0&request=GetFeature&typeName=' + editLayer + '&' +
                                        'outputFormat=application/json&srsname=' + config.viewProjection + '&' +
                                        'bbox=' + extent.join(',') + ',' + config.viewProjection;
                                },
                                strategy: ol.loadingstrategy.bbox
                            }),
                            style: cyanSelectionFeatureStyle,
                        });
                        map.addLayer(editgeojson);
                        activeControl = "StartEditing";
                    } else {
                        showAlert("You must zoom to scale 1:1000 or higher to start editing.", "alert-danger", true);
                        $("#startEditing").toggleClass("clicked");
                    }
                } else {
                    showAlert("First select editing layer in settings.", "alert-danger", true);
                    $("#startEditing").toggleClass("clicked");
                }
            } else {
                showAlert("First select editing layer in settings.", "alert-danger", true);
                $("#startEditing").toggleClass("clicked");
            }
        } else {
            deactivateControl(activeControl);
            deactivateControl("StartEditing");
            activeControl = "";
        }
    });

    $('#addFeature').click(function () {
        $("#addFeature").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#addFeature').hasClass('clicked')) {

            $('#ModifyFeature').prop('disabled', true);
            $('#DeleteFeature').prop('disabled', true);
            $('#ModifyAttribute').prop('disabled', true);

            if (modifiedFeatureList) {
                if (modifiedFeatureList.length > 0) {
                    var answer = confirm('Save edits?');
                    if (answer) {
                        saveEdits(editTask);
                        modifiedFeatureList = [];
                    } else {
                        modifiedFeatureList = [];
                        yellowSelectionFeatureOverlay.getSource().clear();
                        map.removeLayer(yellowSelectionFeatureOverlay);
                    }

                }
            }
            editTask = 'insert';
            addFeature();
            $("#right").append($("#attributeUpdateDiv"));
            $("#attributeUpdateDiv").css("display", "block");
            activeControl = "AddFeature";
        } else {
            deactivateControl("AddFeature");
            activeControl = "";
        }
    });

    $('#ModifyFeature').click(function () {
        $("#ModifyFeature").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#ModifyFeature').hasClass('clicked')) {

            $('#addFeature').prop('disabled', true);
            $('#DeleteFeature').prop('disabled', true);
            $('#ModifyAttribute').prop('disabled', true);

            if (modifiedFeatureList) {
                if (modifiedFeatureList.length > 0) {
                    var answer = confirm('Save edits?');
                    if (answer) {
                        saveEdits(editTask);
                        modifiedFeatureList = [];
                    } else {
                        modifiedFeatureList = [];
                        yellowSelectionFeatureOverlay.getSource().clear();
                        map.removeLayer(yellowSelectionFeatureOverlay);
                    }
                }
            }
            selectedFeatureOverlay.getSource().clear();
            map.removeLayer(selectedFeatureOverlay);
            map.on('click', modifyFeature);
            editTask = 'update';
            activeControl = "ModifyFeature";
        } else {
            deactivateControl("ModifyFeature");
            closeRightPane();
            activeControl = "";
        }
    });

    $('#DeleteFeature').click(function () {
        $("#DeleteFeature").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#DeleteFeature').hasClass('clicked')) {

            $('#addFeature').prop('disabled', true);
            $('#ModifyFeature').prop('disabled', true);
            $('#ModifyAttribute').prop('disabled', true);

            if (modifiedFeatureList) {
                if (modifiedFeatureList.length > 0) {
                    var answer = confirm('Save edits?');
                    if (answer) {
                        saveEdits(editTask);
                        modifiedFeatureList = [];
                    } else {
                        modifiedFeatureList = [];
                        yellowSelectionFeatureOverlay.getSource().clear();
                        map.removeLayer(yellowSelectionFeatureOverlay);
                    }
                }
            }
            selectedFeatureOverlay.getSource().clear();
            map.removeLayer(selectedFeatureOverlay);
            editTask = 'delete';
            map.on('click', selectFeatureToDelete);
            activeControl = "DeleteFeature";
        } else {
            deactivateControl("DeleteFeature");
            activeControl = "";
        }
    });

    $('#ModifyAttribute').click(function () {
        $("#ModifyAttribute").toggleClass("clicked");
        $("#map").css("cursor", "default");
        if ($('#ModifyAttribute').hasClass('clicked')) {

            $('#addFeature').prop('disabled', true);
            $('#ModifyFeature').prop('disabled', true);
            $('#DeleteFeature').prop('disabled', true);

            if (modifiedFeatureList) {
                if (modifiedFeatureList.length > 0) {
                    var answer = confirm('Save edits?');
                    if (answer) {
                        saveEdits(editTask);
                        modifiedFeatureList = [];
                    } else {
                        modifiedFeatureList = [];
                        yellowSelectionFeatureOverlay.getSource().clear();
                        map.removeLayer(yellowSelectionFeatureOverlay);
                    }
                }
            }
            selectedFeatureOverlay.getSource().clear();
            map.removeLayer(selectedFeatureOverlay);
            editTask = 'update';

            map.on('click', selectFeatureAttributeUpdate);
            activeControl = "ModifyAttribute";
        } else {
            deactivateControl("ModifyAttribute");
            closeRightPane();
            activeControl = "";
        }
    });

    $('#addWMSLayer').click(function () {
        $("#map").css("cursor", "default");
        add_WMS_layer();
    });
})

// end : onload functions
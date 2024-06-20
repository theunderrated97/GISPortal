var config = {
    'theme': 'black', //blue, black, green, red
    'mapview': { 'center': [8969017.771583688, 2673639.593678366], 'zoom': 4.5, 'maxzoom': 25 },
    'workspace': 'gis',
    'server': { 'ip': 'localhost', 'serverport': '8085', 'ipport': 'localhost:8085' },
    'viewProjection': 'EPSG:3857',
    'layers': [
        // baselayers
        { 'internal_name': 'nil', 'title': 'World Imagery', 'attributeQuery': false, 'spatialQuery': false, 'editing': false, 'visible': false, 'layergroup': 'Base Layers', 'minZoom': '', 'maxZoom': '', 'type': 'base', 'cql': '', 'source': new ol.source.XYZ({ url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', crossOrigin: "anonymous" }) },
        { 'internal_name': 'nil', 'title': 'OSM Online', 'attributeQuery': false, 'spatialQuery': false, 'editing': false, 'visible': false, 'layergroup': 'Base Layers', 'minZoom': '', 'maxZoom': '', 'type': 'base', 'cql': '', 'source': new ol.source.OSM() },
        { 'internal_name': 'nil', 'title': 'None', 'attributeQuery': false, 'spatialQuery': false, 'editing': false, 'visible': true, 'layergroup': 'Base Layers', 'minZoom': '', 'maxZoom': '', 'type': 'base', 'cql': '', 'source': '' },

        // Admin Boundaries
        { 'internal_name': 'gis:india_districts', 'title': 'District Boundary', 'attributeQuery':true, 'spatialQuery':true, 'editing':false, 'visible': true, 'layergroup': 'Admin Boundary', 'minZoom': '6', 'maxZoom': '25', 'type': 'image', 'cql': '', 'source': '' },
        { 'internal_name': 'gis:india_states', 'title': 'State Boundary', 'attributeQuery':true, 'spatialQuery':true, 'editing':false, 'visible': true, 'layergroup': 'Admin Boundary', 'minZoom': '0', 'maxZoom': '10', 'type': 'image', 'cql': '', 'source': '' },
        // { 'internal_name': 'topp:states', 'title': 'USA Population', 'attributeQuery':true, 'spatialQuery':true, 'editing':false, 'visible': true, 'layergroup': 'Admin Boundary', 'minZoom': '0', 'maxZoom': '10', 'type': 'image', 'cql': '', 'source': '' },
        
        // landbase layers
        // { 'internal_name': 'gis:ind_building', 'title': 'Buildings', 'attributeQuery': true, 'spatialQuery': true, 'editing': true, 'visible': true, 'layergroup': 'Landbase Layers', 'minZoom': '10', 'maxZoom': '25', 'type': 'tile', 'cql': '', 'source': '' },
        { 'internal_name': 'gis:india_roads', 'title': 'Roads', 'attributeQuery': true, 'spatialQuery': true, 'editing': true, 'visible': true, 'layergroup': 'Landbase Layers', 'minZoom': '10', 'maxZoom': '25', 'type': 'tile', 'cql': '', 'source': '' },
        { 'internal_name': 'gis:india_cities', 'title': 'City', 'attributeQuery': true, 'spatialQuery': true, 'editing': true, 'visible': true, 'layergroup': 'Landbase Layers', 'minZoom': '10', 'maxZoom': '25', 'type': 'image', 'cql': '', 'source': '' },

    ],
    'pages': { 'a0': [1189, 841], 'a1': [841, 594], 'a2': [594, 420], 'a3': [420, 297], 'a4': [297, 210], 'a5': [210, 148] },
    'apps': { 
        'view' : ['home', 'fullScreen', 'layers', 'legends', 'addWMS', 'pan', 'zoomIn', 'zoomOut', 'featureInfo', 'measureLength', 'measureArea', 'downloadMap'],
        'query' : ['inpt_search', 'attributeQuery', 'spatialQuery'] ,
        'edit' : ['settings', 'startEditing', 'addFeature', 'ModifyFeature', 'DeleteFeature', 'ModifyAttribute']
    },
    'search': [
        { 'layer_name': 'india_districts', 'external_name': 'District', 'attributes': 'dist_name,state_name' },
        { 'layer_name': 'india_cities', 'external_name': 'City', 'attributes': 'city_name,city_name' },
        { 'layer_name': 'india_states', 'external_name': 'State', 'attributes': 'state_name,state_name' },
    ]
}
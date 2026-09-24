/*
 * 爆破模式地图控制器
 *
 * main.js 仍负责页面通用地图能力；本文件只维护爆破模式自己的地图层、点位和模式切换。
 * 文件通过 index.ejs 以普通 script 加载，所以这里可以复用 main.js 暴露的 Leaflet map 实例。
 */

var bpMode = false;
var bpLayer = null;
var bpPointLayers = [];
var bpRegionLayers = [];
var bpRoleLayer = null;
var bpRoleLine = null;
var bpState = null;
var bpSelectedPointKeys = {};
var bpSelectedRoleKey = null;
var bpCampView = '进攻';
// PC main.js does not declare this legacy map-selection state; keep it global for shared handlers.
var clickMap = '0';

var BP_DEFAULT_MAP = 'htzz';
// 爆破模式可拖拽视野在瓦片边界外额外保留的空间，数值越大可移动范围越大。
var BP_VIEW_BOUNDS_PADDING = 200;
var bpCurrentConfig = null;
var bpMarkerPlayer = null;
var bpMarkerPlayerIndex = 0;
var bpTxPlayerLoading = false;
var bpTxPlayerCallbacks = [];
var bpPopupPositionHandler = null;
var bpPopupMoveEndHandler = null;
var bpPopupRequestId = 0;
var bpPopupDelayTimer = null;
var bpPopupDragOffset = {x: 0, y: 0};
var bpPopupDragState = null;
var markerPop = $('.marker-pop-ctn').first();
var markerName = markerPop.find('.marker-name');
var addressName = markerPop.find('.address-name');

function updateBpMarkerPopupPosition() {
    if (!currClickMarker || !markerPop || !markerPop.length || !markerPop.hasClass('show') || !map) return;
    var mapElement = document.getElementById('MapContainer');
    var rootElement = document.querySelector('.m-index');
    if (!mapElement || !rootElement || !map.latLngToContainerPoint) return;

    var mapRect = mapElement.getBoundingClientRect();
    var rootRect = rootElement.getBoundingClientRect();
    var point = map.latLngToContainerPoint(currClickMarker.getLatLng());
    var width = markerPop.outerWidth() || 750;
    var height = markerPop.outerHeight() || 635;
    // 大于 2048px 时 MapContainer 会被 CSS scale(1.15) 放大，Leaflet
    // 返回的是未缩放的容器坐标，需要换算成屏幕上的实际坐标。
    var layoutWidth = mapElement.offsetWidth || mapElement.clientWidth || mapRect.width;
    var layoutHeight = mapElement.offsetHeight || mapElement.clientHeight || mapRect.height;
    var scaleX = layoutWidth ? mapRect.width / layoutWidth : 1;
    var scaleY = layoutHeight ? mapRect.height / layoutHeight : 1;
    var pointX = mapRect.left - rootRect.left + point.x * scaleX;
    var pointY = mapRect.top - rootRect.top + point.y * scaleY;
    // 弹层固定放在点位右侧，预留出点位图标的间距，避免遮挡被点击的点位。
    var left = pointX + 24 + bpPopupDragOffset.x;
    var top = pointY - height / 2 + bpPopupDragOffset.y;
    var maxLeft = Math.max(12, rootElement.clientWidth - width - 12);
    var maxTop = Math.max(12, rootElement.clientHeight - height - 12);

    markerPop.css({
        left: Math.max(12, Math.min(left, maxLeft)) + 'px',
        top: Math.max(12, Math.min(top, maxTop)) + 'px',
        right: 'auto',
        bottom: 'auto',
        transform: 'none'
    });
}

function bindBpMarkerPopupDrag() {
    if (!markerPop.length) return;
    markerPop.off('mousedown.bpPopupDrag').on('mousedown.bpPopupDrag', function (event) {
        if (!bpMode || event.which !== 1 || $(event.target).closest('.marker-preview-ctn, .btn-close-marker-pop, .btn-pop-floor').length) return;

        var rootElement = document.querySelector('.m-index');
        var rootRect = rootElement ? rootElement.getBoundingClientRect() : null;
        var rootScaleX = rootElement && rootElement.clientWidth ? rootRect.width / rootElement.clientWidth : 1;
        var rootScaleY = rootElement && rootElement.clientHeight ? rootRect.height / rootElement.clientHeight : 1;
        bpPopupDragState = {
            startX: event.clientX,
            startY: event.clientY,
            offsetX: bpPopupDragOffset.x,
            offsetY: bpPopupDragOffset.y,
            scaleX: rootScaleX || 1,
            scaleY: rootScaleY || 1
        };
        markerPop.addClass('bp-dragging');
        event.preventDefault();
        event.stopPropagation();

        $(document).off('mousemove.bpPopupDrag mouseup.bpPopupDrag')
            .on('mousemove.bpPopupDrag', function (moveEvent) {
                if (!bpPopupDragState) return;
                bpPopupDragOffset.x = bpPopupDragState.offsetX + (moveEvent.clientX - bpPopupDragState.startX) / bpPopupDragState.scaleX;
                bpPopupDragOffset.y = bpPopupDragState.offsetY + (moveEvent.clientY - bpPopupDragState.startY) / bpPopupDragState.scaleY;
                updateBpMarkerPopupPosition();
                moveEvent.preventDefault();
            })
            .on('mouseup.bpPopupDrag', function () {
                bpPopupDragState = null;
                markerPop.removeClass('bp-dragging');
                $(document).off('mousemove.bpPopupDrag mouseup.bpPopupDrag');
            });
    });
}

function bindBpMarkerPopupPosition() {
    if (!map) return;
    if (!bpPopupPositionHandler) {
        bpPopupPositionHandler = function () {
            updateBpMarkerPopupPosition();
        };
    }
    map.off('move', bpPopupPositionHandler);
    map.off('zoom', bpPopupPositionHandler);
    map.on('move', bpPopupPositionHandler);
    map.on('zoom', bpPopupPositionHandler);
}

function unbindBpMarkerPopupPosition() {
    if (!map || !bpPopupPositionHandler) return;
    map.off('move', bpPopupPositionHandler);
    map.off('zoom', bpPopupPositionHandler);
}

function cancelBpMarkerPopupOpen() {
    bpPopupRequestId += 1;
    if (map && bpPopupMoveEndHandler) {
        map.off('moveend', bpPopupMoveEndHandler);
    }
    bpPopupMoveEndHandler = null;
    if (bpPopupDelayTimer) {
        window.clearTimeout(bpPopupDelayTimer);
        bpPopupDelayTimer = null;
    }
    bpPopupDragState = null;
    markerPop.removeClass('bp-dragging');
    $(document).off('mousemove.bpPopupDrag mouseup.bpPopupDrag');
}

function showBpMarkerPopup(point, requestId) {
    if (!bpMode || requestId !== bpPopupRequestId || !markerPop || !markerPop.length) return;

    var markerTitle = point && (point.role_x !== undefined || point.role_y !== undefined)
        ? point.name
        : point && point.point_name;
    markerName.html(escapeBpHtml(markerTitle || ''));
    addressName.html(escapeBpHtml(point.name || ''));
    renderBpMarkerMedia(point);
    markerPop.addClass('show');
    bindBpMarkerPopupPosition();
    updateBpMarkerPopupPosition();
}

function showBpMarkerPopupAfterMove(point, target, afterMove) {
    cancelBpMarkerPopupOpen();
    var requestId = bpPopupRequestId;
    bpPopupMoveEndHandler = function () {
        if (map) map.off('moveend', bpPopupMoveEndHandler);
        bpPopupMoveEndHandler = null;
        var complete = function () {
            bpPopupDelayTimer = null;
            if (!bpMode || requestId !== bpPopupRequestId) return;
            if (typeof afterMove === 'function') afterMove();
            showBpMarkerPopup(point, requestId);
        };
        bpPopupDelayTimer = window.setTimeout(complete, 250);
    };
    map.on('moveend', bpPopupMoveEndHandler);
    map.flyTo(target, Math.max(map.getZoom(), bpCurrentConfig.info.initZoom));
}

function renderBpRoleAfterMove(point, markerPos, rolePos) {
    if (!bpMode || !rolePos) return;
    bpRoleLine = L.polyline([
        [markerPos.y, markerPos.x],
        [rolePos.y, rolePos.x]
    ], {
        color: '#EAEBEB',
        weight: 2,
        dashArray: '8, 8',
        interactive: false
    }).addTo(map);
    bpRoleLayer = createBpPoint({
        type: 'role-marker',
        name: point.role_name || '',
        icon: point.role_icon,
        x: point.role_x,
        y: point.role_y
    });
}

function clearBpMarkerMedia($scope) {
    var hasScope = !!($scope && $scope.length);
    var $markerPops = hasScope
        ? $scope.first()
        : $('.marker-pop-ctn');
    if (bpMarkerPlayer && typeof bpMarkerPlayer.pause === 'function') {
        bpMarkerPlayer.pause();
    }
    if (bpMarkerPlayer && typeof bpMarkerPlayer.destroy === 'function') {
        bpMarkerPlayer.destroy();
    }
    bpMarkerPlayer = null;
    $markerPops.each(function () {
        var $markerPop = $(this);
        var $preview = $markerPop.find('.marker-preview-ctn').first();
        $preview.find('.marker-pop-video, .marker-pop-video-ctn').remove();
        $markerPop.find('.marker-pop-desc').remove();
        $preview.find('.marker-preview').attr('src', '').hide();
        $preview.hide();
    });
}

function initBpMarkerPlayer(containerId, vid, width, height, assignGlobal) {
    if (typeof window.Txplayer !== 'function') return;
    var player = new window.Txplayer({
        containerId: containerId,
        vid: vid,
        width: width || '600',
        height: height || '400',
        autoplay: true
    });
    if (assignGlobal !== false) bpMarkerPlayer = player;
    return player;
}

function loadBpTxPlayer(callback) {
    if (typeof window.Txplayer === 'function') {
        callback();
        return;
    }
    bpTxPlayerCallbacks.push(callback);
    if (bpTxPlayerLoading) return;
    bpTxPlayerLoading = true;
    var script = document.createElement('script');
    script.src = '//vm.gtimg.cn/tencentvideo/txp/js/txplayer.js';
    script.onload = function () {
        bpTxPlayerLoading = false;
        var callbacks = bpTxPlayerCallbacks.splice(0);
        callbacks.forEach(function (render) { render(); });
    };
    script.onerror = function () {
        bpTxPlayerLoading = false;
        bpTxPlayerCallbacks.length = 0;
    };
    document.head.appendChild(script);
}

function getBpMarkerImageUrl(imageName) {
    var image = String(imageName || '').trim();
    if (!image) return '';
    if (/^(?:https?:)?\/\//i.test(image) || image.charAt(0) === '/') return image;
    if (/\.(?:jpg|jpeg|png|gif|webp)(?:\?.*)?$/i.test(image)) {
        return getBpAssetRoot() + image;
    }
    return getBpAssetRoot() + image + '.jpg';
}

function renderBpMarkerMedia(point, $scope) {
    if (!bpMode) return;
    var $markerPop = $scope && $scope.length ? $scope : $('.marker-pop-ctn').first();
    var $preview = $markerPop.find('.marker-preview-ctn').first();
    if (!$preview.length) return;

    clearBpMarkerMedia($markerPop);
    $preview.find('.marker-pop-video, .marker-pop-video-ctn').remove();
    $preview.find('.marker-preview').attr('src', '').hide();

    var vid = point && point.vid ? String(point.vid).trim() : '';
    var img = getBpMarkerImageUrl(point && point.img);
    var pointDesc = point && point.point_desc ? String(point.point_desc).trim() : '';
    if (vid) {
        var containerId = 'marker-pop-video-' + (++bpMarkerPlayerIndex);
        $('<div>', {
            'id': containerId,
            'class': 'marker-pop-video-ctn'
        }).appendTo($preview);
        $preview.show();
        loadBpTxPlayer(function () {
            if ($('#' + containerId).length && bpMode && document.body.contains($markerPop[0])) {
                initBpMarkerPlayer(containerId, vid);
            }
        });
    } else if (img) {
        $preview.find('.marker-preview').attr('src', img).show();
        $preview.show();
    } else {
        $preview.hide();
    }

    if ((vid || img) && pointDesc) {
        $('<div>', {
            'class': 'marker-pop-desc'
        }).text(pointDesc).appendTo($markerPop);
    }
}

var BP_MAP_CONFIGS = {
    htzz: {
        key: 'htzz',
        title: '航天中转站',
        info: htzzzInfo,
        points: selectPoint_htzzz,
        regions: selectRegion_htzzz,
        tileExtension: 'png'
    },
    lswdz: {
        key: 'lswdz',
        title: '蓝水屋电站',
        info: lswdzInfo,
        points: selectPoint_lswdz,
        regions: selectRegion_lswdz,
        tileExtension: 'png'
    },
    smezy: {
        key: 'smezy',
        title: '萨米尔山庄',
        info: smezyInfo,
        points: selectPoint_smezy,
        regions: selectRegion_smezy,
        tileExtension: 'png'
    }
};

function getBpConfig(mapKey) {
    return BP_MAP_CONFIGS[String(mapKey || '').toLowerCase()] || BP_MAP_CONFIGS[BP_DEFAULT_MAP];
}

function getBpTileRoot() {
    // handover 页面位于 dist/m/index.html，其他构建产物位于根目录。
    var folder = 'map_' + (bpCurrentConfig ? bpCurrentConfig.key : BP_DEFAULT_MAP);
    if (window.location.pathname.indexOf('/m/') > -1) {
        return '../ossweb-img/img/' + folder + '/';
    }
    return 'img/' + folder + '/';
}

function getBpAssetRoot() {
    if (window.location.pathname.indexOf('/m/') > -1) {
        return '../ossweb-img/img/bp/';
    }
    return 'img/bp/';
}

function getBpTileExtension(coords) {
    var extension = bpCurrentConfig && bpCurrentConfig.tileExtension;
    if (extension === 'mixed') {
        return coords.z === 1 && !(coords.x === 0 && coords.y === 0) ? 'png' : 'jpg';
    }
    return extension === 'png' ? 'png' : 'jpg';
}

function getBpMapPos(posX, posY) {
    var x = Number(posX);
    var y = Number(posY);
    var info = bpCurrentConfig.info;
    var bj = info.bj || 128;
    var xScale = info.width / bj;
    var yScale = info.height / bj;

    return {
        x: bj - (info.centerX - x) / xScale,
        y: -bj - (info.centerY + y) / yScale
    };
}

function getBpWorldPos(mapX, mapY) {
    var info = bpCurrentConfig.info;
    var bj = info.bj || 128;
    var xScale = info.width / bj;
    var yScale = info.height / bj;

    return {
        x: info.centerX - (bj - Number(mapX)) * xScale,
        y: -(Number(mapY) + bj) * yScale - info.centerY
    };
}

function handleBpMapClick(event) {
    if (!bpMode || !bpCurrentConfig || !event.latlng) return;

    // 地图点击会关闭点位弹窗，先销毁腾讯视频播放器，避免视频继续播放。
    cancelBpMarkerPopupOpen();
    clearBpMarkerMedia();
    clearBpPointActiveState();
    clearBpRoleLayer();
    var mapX = event.latlng.lng;
    var mapY = event.latlng.lat;
    var worldPos = getBpWorldPos(mapX, mapY);
    console.log( Number(worldPos.x.toFixed(0)), Number(worldPos.y.toFixed(0)));
    $('.bp-nav-ctn').removeClass('show')
    $('.marker-pop-ctn').removeClass('show')
    unbindBpMarkerPopupPosition();

    // console.log('爆破地图点击坐标', {
    //     map: bpCurrentConfig.key,
    //     mapX: Number(mapX.toFixed(3)),
    //     mapY: Number(mapY.toFixed(3)),
    //     x: Number(worldPos.x.toFixed(3)),
    //     y: Number(worldPos.y.toFixed(3)),
    //     config: 'X=' + worldPos.x.toFixed(3) + ',Y=' + worldPos.y.toFixed(3) + ',Z=0'
    // });
}

function parseBpPosition(value, axis) {
    if (value === undefined || value === null) return value;
    if (typeof value === 'number') return value;

    var text = String(value);
    var marker = axis === 'x' ? 'X=' : 'Y=';
    var start = text.indexOf(marker);
    if (start > -1) {
        start += marker.length;
        var end = text.indexOf(',', start);
        return Number(text.slice(start, end > -1 ? end : text.length));
    }
    return Number(text);
}

function clearBpLayers(list) {
    list.forEach(function (layer) {
        if (layer && layer.remove) layer.remove();
    });
    list.length = 0;
}

function clearBpRoleLayer() {
    if (bpRoleLayer && bpRoleLayer.remove) bpRoleLayer.remove();
    bpRoleLayer = null;
    if (bpRoleLine && bpRoleLine.remove) bpRoleLine.remove();
    bpRoleLine = null;
}

function clearBpPointActiveState() {
    $('.bp-point-marker.act').removeClass('act');
}

function removeMainLayerList(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (layer) {
        if (layer && layer.remove) layer.remove();
    });
    list.length = 0;
}

function clearMainMapLayers() {
    removeMainLayerList(cacheMarker);
    removeMainLayerList(markerList);
    removeMainLayerList(warMark);
    removeMainLayerList(borderList);
    removeMainLayerList(poiList);
    if (typeof clearRegions === 'function') clearRegions();

    if (currLayer && currLayer.remove) currLayer.remove();
    currLayer = null;
}

function createBpTileLayer() {
    // 爆破地图的最低级资源从 z=1 开始，且 2x2 首级瓦片按 256 坐标拼成完整地图。
    var info = bpCurrentConfig.info;
    var minZoom = Math.max(Number(info.minZoom) || 0, 1);
    var maxZoom = Math.max(Number(info.maxZoom) || 3, minZoom);
    // z=1/2/3 分别是 2x2、4x4、8x8 瓦片，256px 瓦片对应 256x256 的地图坐标。
    // 不使用配置中的较小边界，避免放大时视野越过实际瓦片范围而显示空白。
    var boundsW = 256;
    var boundsH = 256;
    var layer = L.tileLayer(getBpTileRoot() + '{z}_{x}_{y}.{ext}', {
        minZoom: minZoom,
        maxZoom: 8,
        maxNativeZoom: maxZoom,
        tileSize: 256,
        noWrap: true,
        bounds: L.latLngBounds(
            [0, 0],
            [-boundsH, boundsW]
        ),
        errorTileUrl: getBpTileRoot() + '1_0_0.' + getBpTileExtension({z: 1, x: 0, y: 0})
    });

    // Leaflet 的默认模板不支持按瓦片动态选择 jpg/png 扩展名。
    layer.getTileUrl = function (coords) {
        return getBpTileRoot() + coords.z + '_' + coords.x + '_' + coords.y + '.' + getBpTileExtension(coords);
    };
    layer.name = bpCurrentConfig.key;
    return layer;
}

function getBpViewBounds(layer) {
    var padding = Number(BP_VIEW_BOUNDS_PADDING) || 0;
    var bounds = layer && layer.options && layer.options.bounds;
    if (!bounds || !padding) return bounds;

    var northWest = bounds.getNorthWest();
    var southEast = bounds.getSouthEast();
    return L.latLngBounds(
        [northWest.lat + padding, northWest.lng - padding],
        [southEast.lat - padding, southEast.lng + padding]
    );
}

function createBpPoint(point) {
    var pos = getBpMapPos(point.x, point.y);
    var markerTypeClass = point.type === 'role-marker'
        ? 'bp-point-marker-role'
        : point.type === 'normal'
            ? 'bp-point-marker-normal'
            : 'bp-point-marker-skill';
    var iconName = String(point.icon || 'icon_djjs').replace(/[^a-zA-Z0-9_-]/g, '');
    var iconUrl = getBpAssetRoot() + (iconName || 'icon_djjs') + '.png';
    var fallbackIconUrl = getBpAssetRoot() + 'icon_djjs.png';
    var marker = L.marker([pos.y, pos.x], {
        icon: L.divIcon({
            className: 'map-icon bp-point-marker ' + markerTypeClass,
            html: '<div class="map-icon-bg"><img src="' + iconUrl + '" alt="" onerror="this.onerror=null;this.src=\'' + fallbackIconUrl + '\';" /></div>',
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        }),
        zIndexOffset: 500
    });

    marker.addTo(map);

    marker.on('click', function (event) {
        if (event && event.originalEvent && L.DomEvent && L.DomEvent.stopPropagation) {
            L.DomEvent.stopPropagation(event.originalEvent);
        }
        clearBpPointActiveState();
        if (marker.getElement()) $(marker.getElement()).addClass('act');
        clearBpRoleLayer();
        var rolePos = null;
        if (point.role_x !== undefined && point.role_y !== undefined && point.role_icon) {
            rolePos = getBpMapPos(point.role_x, point.role_y);
        }
        currClickMarker = marker;
        marker.myIcon = marker.getIcon();
        bpPopupDragOffset = {x: 0, y: 0};
        markerPop.removeClass('show');
        clearBpMarkerMedia();
        unbindBpMarkerPopupPosition();
        showBpMarkerPopupAfterMove(point, [pos.y, pos.x], function () {
            renderBpRoleAfterMove(point, pos, rolePos);
        });
    });
    return marker;
}

// 爆破模式区域与常规地图 selectRegion_* 一致，只显示名称，不绘制区域边界。
function createBpRegion(region) {
    if (!region || region.name === undefined) return null;

    var x = region.labelX !== undefined ? region.labelX : region.x;
    var y = region.labelY !== undefined ? region.labelY : region.y;
    if (x === undefined || y === undefined) return null;

    var pos = getBpMapPos(parseBpPosition(x, 'x'), parseBpPosition(y, 'y'));
    return L.marker([pos.y, pos.x], {
        icon: L.divIcon({
            className: 'map-region-name',
            html: '<div class="region-item">' + region.name + '</div>'
        }),
        interactive: false
    }).addTo(map);
}

function generateBpPoints(points) {
    clearBpPointActiveState();
    clearBpLayers(bpPointLayers);
    clearBpRoleLayer();
    (Array.isArray(points) ? points : []).forEach(function (point) {
        if (point && point.x !== undefined && point.y !== undefined) {
            bpPointLayers.push(createBpPoint(point));
        }
    });
    return bpPointLayers.slice();
}

function generateBpRegions(regions) {
    clearBpLayers(bpRegionLayers);
    (Array.isArray(regions) ? regions : []).forEach(function (region) {
        var layer = createBpRegion(region);
        if (layer) bpRegionLayers.push(layer);
    });
    return bpRegionLayers.slice();
}

function generateBpMap(options) {
    if (!map) {
        throw new Error('爆破模式地图尚未初始化');
    }

    var config = options || {};
    bpCurrentConfig = getBpConfig(config.mapKey || (bpCurrentConfig && bpCurrentConfig.key));
    var info = bpCurrentConfig.info;
    clearBpLayers(bpPointLayers);
    clearBpLayers(bpRegionLayers);
    clearBpRoleLayer();
    if (bpLayer && bpLayer.remove) bpLayer.remove();

    bpLayer = createBpTileLayer();
    bpLayer.addTo(map);
    // main.js 的通用地图处理仍会读取 currLayer.name；爆破图层也同步为当前图层。
    currLayer = bpLayer;
    map.options.minZoom = bpLayer.options.minZoom;

    // 先清除旧地图边界，确保 htzzzInfo.initX/initY 能作为初始中心生效。
    // Leaflet 的 setView 会主动把中心限制到 maxBounds；爆破地图在低缩放级别
    // 下视口可能已经覆盖整个边界，此时直接 setView 会导致 initX/initY 看起来无效。
    map.setMaxBounds(null);
    map.setView(
        config.center || [info.initX, info.initY],
        config.zoom === undefined ? Math.max(Number(info.initZoom) || 0, bpLayer.options.minZoom) : config.zoom
    );
    // 直接挂载边界而不调用 setMaxBounds，避免其立即把初始中心校正到边界中心。
    map.options.maxBounds = getBpViewBounds(bpLayer);
    map.on('moveend', map._panInsideMaxBounds, map);

    // 区域文字默认显示；点位由菜单独立调用 generateBpPoints() 后再显示。
    generateBpRegions(config.regions || bpCurrentConfig.regions);
    return bpLayer;
}

function refreshBpMap(options) {
    return generateBpMap(options);
}

function saveBpMainState() {
    return {
        mapScaleInfo: mapScaleInfo,
        poiInfo: poiInfo,
        mapIcons: mapIcons,
        allNavList: allNavList,
        navTypeList: navTypeList,
        isWar: isWar,
        isFloor: isFloor,
        outFloor: outFloor,
        currLayerName: currLayer && currLayer.name,
        currMap: currMap,
        clickMap: clickMap,
        currLv: currLv,
        currWarMap: currWarMap,
        currWarType: currWarType,
        currFloorIndex: currFloorIndex,
        currFloorRegion: currFloorRegion,
        currMapFloor: currMapFloor,
        isZj: isZj,
        // 页面有两个同步显示的地图名称，只读取一个，避免 jQuery 把集合文本拼接起来。
        mapTitle: $('.curr-map-name').first().text(),
        mapLevel: $('.curr-map-lv').text()
    };
}

function setBpUi(active) {
    $('.m-index').toggleClass('bp-mode', active);
    $('.curr-map-ctn').toggleClass('bp-mode', active);
    $('.marker-pop-ctn').toggleClass('bp-mode', active);
    $('.nav-ctn').toggleClass('bp-mode', active);
    $('.btn-bp-change').toggleClass('bp-hidden', active);
    $('.btn-war-change2').toggleClass('bp-hidden', !active).css('display', active ? 'flex' : '');
    $('.btn-war-change')
        .toggleClass('bp', active)
        .toggleClass('war', !active && isWar)
        .toggleClass('fh', !active && !isWar);
    $('.btn-floor-mod, .btn-view-change, .type-change-ctn, .select-region-ctn, .curr-random, .curr-map-lv, .war-lv-change-ctn, .map-floor')
        .toggleClass('bp-hidden', active);
    $('.btn-bp-change .bp-change-text').text(active ? '退出爆破' : '爆破模式');
}

function setBpMapMenuActive(mapKey) {
    var key = String(mapKey || '').toLowerCase();
    $('.bp-map-item').removeClass('act');
    $('.bp-map-item[data-map="' + key + '"]').addClass('act');
}

function enterBpMode(options) {
    options = typeof options === 'string' ? {mapKey: options} : (options || {});
    if (bpMode) return true;
    if (!map) {
        console.warn('爆破模式需要在地图初始化完成后进入');
        return false;
    }

    bpCurrentConfig = getBpConfig(options.mapKey || BP_DEFAULT_MAP);
    setBpMapMenuActive(bpCurrentConfig.key);
    bpSelectedPointKeys = {};
    bpSelectedRoleKey = null;
    bpState = saveBpMainState();
    clearMainMapLayers();
    bpMode = true;
    window.bpMode = true;
    isWar = false;
    isFloor = false;
    window.occupy = false;

    $('.curr-map-name').text(bpCurrentConfig.title);
    setBpUi(true);
    map.on('click', handleBpMapClick);
    generateBpMap(options);
    renderBpPointList();
    return true;
}

// 切换爆破地图；点位和区域仍由各自的生成方法独立管理。
function switchBpMap(mapKey, options) {
    options = options || {};
    var config = getBpConfig(mapKey);
    var mapOptions = Object.assign({}, options, { mapKey: config.key });

    if (!bpMode) return enterBpMode(mapOptions);

    cancelBpMarkerPopupOpen();
    clearBpMarkerMedia();
    markerPop.removeClass('show');
    unbindBpMarkerPopupPosition();
    bpCurrentConfig = config;
    setBpMapMenuActive(config.key);
    bpSelectedPointKeys = {};
    bpSelectedRoleKey = null;
    $('.curr-map-name').text(config.title);
    $('.curr-map-lv').text('爆破');
    generateBpMap(mapOptions);
    renderBpPointList();
    return true;
}

function escapeBpHtml(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getBpPointListType() {
    var $active = $('.bp-btns-item.act');
    if (!$active.length) return null;
    return $active.hasClass('bp-btn-role') ? 'role' : 'normal';
}

function getBpCampFilter() {
    return bpCampView;
}

function setBpCampView(camp) {
    var value = camp === '防守' ? '防守' : '进攻';
    bpCampView = value;
    $('.btn-view-change-bp').toggleClass('g', value === '进攻').toggleClass('f', value === '防守');
}

function isBpCampPoint(point) {
    var camp = getBpCampFilter();
    return !camp || !point.camp || String(point.camp).indexOf(camp) > -1;
}

function getBpPointEntries(type) {
    var points = bpCurrentConfig && Array.isArray(bpCurrentConfig.points)
        ? bpCurrentConfig.points
        : [];
    var groups = {};
    var entries = [];

    points.forEach(function (point) {
        if (!point || point.name === undefined) return;
        var pointType = point.type || 'normal';
        if (type && pointType !== type) return;
        if (pointType === 'role' && !getBpRolePointEntries({items: [point]}).length) return;
        var key = pointType + ':' + String(point.name);
        if (!groups[key]) {
            groups[key] = { name: String(point.name), type: pointType, icon: point.icon, items: [] };
            entries.push(groups[key]);
        }
        groups[key].items.push(point);
    });
    return entries;
}

function getBpEntryMapPoints(entry) {
    var result = [];
    function hasCoordinate(value) {
        return value !== undefined && value !== null && String(value).trim() !== '' && isFinite(Number(value));
    }
    function collect(points) {
        (Array.isArray(points) ? points : []).forEach(function (point) {
            if (!point) return;
            if (hasCoordinate(point.x) && hasCoordinate(point.y)) result.push(point);
            if (Array.isArray(point.points)) collect(point.points);
        });
    }
    collect(entry && entry.items);
    return result;
}

// 返回菜单中的全部叶子点位。技能点可能暂时没有坐标，仍需要保留在列表中。
function getBpEntryPoints(entry) {
    var result = [];
    function collect(points) {
        (Array.isArray(points) ? points : []).forEach(function (point) {
            if (!point) return;
            if (Array.isArray(point.points) && point.points.length) collect(point.points);
            else result.push(point);
        });
    }
    collect(entry && entry.items);
    return result;
}

function getBpEntryKey(type, entry) {
    return (type || entry.type || '') + ':' + entry.name;
}

function getBpSelectedMapPoints() {
    var result = [];
    ['normal', 'role'].forEach(function (type) {
        getBpPointEntries(type).forEach(function (entry) {
            if (type === 'normal') {
                if (bpSelectedPointKeys[getBpEntryKey(type, entry)]) {
                    result = result.concat(getBpEntryMapPoints(entry));
                }
                return;
            }
            var roleKey = getBpEntryKey(type, entry);
            if (!bpSelectedPointKeys[roleKey]) return;
            getBpRolePointEntries(entry).forEach(function (skill) {
                if (bpSelectedPointKeys[roleKey + ':' + skill.name]) {
                    result = result.concat(getBpEntryMapPoints(skill).map(function (point) {
                        return Object.assign({}, point, {
                            role_name: entry.name,
                            role_icon: entry.icon
                        });
                    }));
                }
            });
        });
    });
    return result;
}

function getBpRolePointEntries(entry) {
    var groups = {};
    var entries = [];
    getBpEntryPoints(entry).forEach(function (point) {
        if (!isBpCampPoint(point)) return;
        var name = point.point_name || point.name || '未命名点位';
        if (!groups[name]) {
            groups[name] = { name: name, icon: point.icon || entry.icon, items: [] };
            entries.push(groups[name]);
        }
        groups[name].items.push(point);
    });
    return entries;
}

function getBpEntryPrice(entry) {
    var pricedPoint = (entry && Array.isArray(entry.items) ? entry.items : []).find(function (point) {
        return point && point.price !== undefined && point.price !== null && String(point.price).trim() !== '';
    });
    return pricedPoint ? String(pricedPoint.price).trim() : '';
}

function renderBpPointItems($container, entries, className, onClick) {
    entries.forEach(function (entry, index) {
        var icon = entry.icon ? 'img_' + String(entry.icon).replace(/[^a-zA-Z0-9_-]/g, '') + '_s' : '';
        var entryKey = entry.key || getBpEntryKey('', entry);
        var hasMapPoints = getBpEntryMapPoints(entry).length > 0;
        var selectedClass = hasMapPoints && bpSelectedPointKeys[entryKey] ? ' act' : '';
        var price = getBpEntryPrice(entry);
        var nameClass = price ? '' : ' no-price';
        $container.append(
            '<div class="bp-point-item ' + className + selectedClass + '" data-index="' + index + '">' +
                '<div class="bp-point-item-icon ' + icon + '"></div>' +
                '<div class="bp-point-item-name' + nameClass + '">' + escapeBpHtml(entry.name) + '</div>' +
                (price ? '<div class="bp-point-item-price">' + escapeBpHtml(price) + '</div>' : '') +
                (entry.items.length > 1 ? '<div class="bp-point-item-count">' + entry.items.length + '</div>' : '') +
            '</div>'
        );
    });
    $container.find('.' + className.split(' ').join('.')).off('click.bpPoint').on('click.bpPoint', function () {
        onClick(entries[Number($(this).attr('data-index'))], $(this));
    });
}

function updateBpPointListMask() {
    var pointList = document.querySelector('.bp-point-list');
    if (!pointList) return;

    var scrollHeight = pointList.scrollHeight - pointList.clientHeight;
    var hasOverflow = scrollHeight > 1;
    var isAtBottom = hasOverflow && scrollHeight - pointList.scrollTop <= 10;
    $('.bp-nav-ctn').toggleClass('bot', isAtBottom);
}

function renderBpPointList(type) {
    if (type === undefined) type = getBpPointListType();
    var $list = $('.bp-point-list');
    var $normalList = $('.bp-normal-list');
    var $roleList = $('.bp-role-list');
    var $skillList = $('.bp-skill-list');
    if (!$list.length) return [];

    $normalList.empty();
    $roleList.empty();
    $skillList.empty();
    $('.bp-skill-title').hide();
    var entries = getBpPointEntries(type);
    var roleEntries = entries.filter(function (entry) { return entry.type === 'role'; });
    var normalEntries = entries.filter(function (entry) { return entry.type !== 'role'; });
    $normalList.toggle(type === null || type === 'normal');
    $roleList.toggle(type === null || type === 'role');

    function selectRole(entry, $item) {
            if (type === null) {
                $('.bp-btns-item').removeClass('act');
                $('.bp-btn-role').addClass('act');
                $normalList.hide();
                $roleList.show();
            }
            var roleKey = getBpEntryKey('role', entry);
            if (bpSelectedPointKeys[roleKey]) {
                delete bpSelectedPointKeys[roleKey];
                Object.keys(bpSelectedPointKeys).forEach(function (key) {
                    if (key.indexOf(roleKey + ':') === 0) delete bpSelectedPointKeys[key];
                });
                bpSelectedRoleKey = null;
                $item.removeClass('act');
                $skillList.empty();
                $('.bp-skill-title').hide();
                generateBpPoints(getBpSelectedMapPoints());
                return;
            }
            bpSelectedRoleKey = roleKey;
            Object.keys(bpSelectedPointKeys).forEach(function (key) {
                if (key.indexOf('role:') === 0) delete bpSelectedPointKeys[key];
            });
            bpSelectedPointKeys[roleKey] = true;
            $roleList.find('.bp-role-item').removeClass('act');
            $item.addClass('act');

            // 切换干员前清空上一个干员的技能卡片，避免重复追加 bp-point-item。
            $skillList.empty();
            var skills = getBpRolePointEntries(entry).map(function (skill) {
                return Object.assign({}, skill, { key: roleKey + ':' + skill.name });
            });
            skills.forEach(function (skill) {
                if (getBpEntryMapPoints(skill).length) bpSelectedPointKeys[skill.key] = true;
                else delete bpSelectedPointKeys[skill.key];
            });
            $('.bp-skill-title').show();
            renderBpPointItems($skillList, skills, 'bp-skill-item', function (skill, $skillItem) {
                if (!getBpEntryMapPoints(skill).length) return;
                var skillSelected = !!bpSelectedPointKeys[skill.key];
                if (skillSelected) delete bpSelectedPointKeys[skill.key];
                else bpSelectedPointKeys[skill.key] = true;
                $skillItem.toggleClass('act', !skillSelected);
                generateBpPoints(getBpSelectedMapPoints());
            });
            $skillList.find('.bp-skill-item').each(function (index) {
                var $skillItem = $(this);
                if (getBpEntryMapPoints(skills[index]).length) return;
                $skillItem
                    .off('mouseenter.bpNoData mouseleave.bpNoData')
                    .on('mouseenter.bpNoData', function () {
                        $skillItem.addClass('not-data');
                    })
                    .on('mouseleave.bpNoData', function () {
                        $skillItem.removeClass('not-data');
                    });
            });
            generateBpPoints(getBpSelectedMapPoints());
    }

    function selectNormal(entry, $item) {
            if (type === null) {
                $('.bp-btns-item').removeClass('act');
                $('.bp-btn-normal').addClass('act');
                $normalList.show();
                $roleList.hide();
            }
            var normalKey = getBpEntryKey('normal', entry);
            if (bpSelectedPointKeys[normalKey]) {
                delete bpSelectedPointKeys[normalKey];
                $item.removeClass('act');
            } else {
                bpSelectedPointKeys[normalKey] = true;
                $item.addClass('act');
            }
            generateBpPoints(getBpSelectedMapPoints());
    }

    var normalListEntries = normalEntries.map(function (entry) {
        return Object.assign({}, entry, { key: getBpEntryKey(type, entry) });
    });
    var roleListEntries = roleEntries.map(function (entry) {
        return Object.assign({}, entry, { key: getBpEntryKey('role', entry) });
    });

    renderBpPointItems($normalList, normalListEntries, 'bp-normal-item', function (entry, $item) {
        selectNormal(entry, $item);
    });
    renderBpPointItems($roleList, roleListEntries, 'bp-role-item', function (entry, $item) {
        selectRole(entry, $item);
    });

    // 切回干员分类时恢复之前选中的干员及其技能列表。
    if (bpSelectedRoleKey) {
        roleListEntries.some(function (entry, index) {
            if (entry.key !== bpSelectedRoleKey) return false;
            delete bpSelectedPointKeys[bpSelectedRoleKey];
            selectRole(entry, $roleList.find('.bp-role-item').eq(index));
            return true;
        });
    }
    updateBpPointListMask();
    return entries;
}

function resetBpChoose() {
    if (!bpMode) return;
    bpSelectedPointKeys = {};
    bpSelectedRoleKey = null;
    setBpCampView('进攻');
    $('.bp-btns-item').removeClass('act');
    $('.bp-skill-title').hide();
    $('.bp-skill-list').empty();
    renderBpPointList(null);
    generateBpPoints([]);
}

function exitBpMode() {
    if (!bpMode) return true;

    cancelBpMarkerPopupOpen();
    clearBpMarkerMedia();
    markerPop.removeClass('show');
    unbindBpMarkerPopupPosition();
    clearBpLayers(bpPointLayers);
    clearBpLayers(bpRegionLayers);
    clearBpRoleLayer();
    bpSelectedPointKeys = {};
    // map.off('click', handleBpMapClick);
    if (bpLayer && bpLayer.remove) bpLayer.remove();
    bpLayer = null;

    var state = bpState;
    bpMode = false;
    window.bpMode = false;
    if (!state) return false;

    mapScaleInfo = state.mapScaleInfo;
    poiInfo = state.poiInfo;
    mapIcons = state.mapIcons;
    allNavList = state.allNavList;
    navTypeList = state.navTypeList;
    isWar = state.isWar;
    isFloor = state.isFloor;
    outFloor = state.outFloor;
    currMap = state.currMap;
    clickMap = state.clickMap;
    currLv = state.currLv;
    currWarMap = state.currWarMap;
    currWarType = state.currWarType;
    currFloorIndex = state.currFloorIndex;
    currFloorRegion = state.currFloorRegion;
    currMapFloor = state.currMapFloor;
    isZj = state.isZj;

    $('.curr-map-name').text(state.mapTitle);
    $('.curr-map-lv').text(state.mapLevel);
    setBpUi(false);

    if (state.currLayerName) {
        addLayer(state.currLayerName);
    }
    initNav();
    if (state.isWar) {
        warInit(currWarMap, currWarType);
    } else {
        refreshMarker2('filter', mapIcons);
        bindOptionEvent();
    }
    bpState = null;
    bpCurrentConfig = null;
    return true;
}

function initBpMode() {
    bindBpMarkerPopupDrag();
    $('.btn-war-change2').addClass('bp-hidden');
    $('.btn-close-marker-pop').off('click.bpRole').on('click.bpRole', function () {
        if (!bpMode) return;
        cancelBpMarkerPopupOpen();
        clearBpPointActiveState();
        clearBpRoleLayer();
        clearBpMarkerMedia();
        markerPop.removeClass('show');
        unbindBpMarkerPopupPosition();
    });

    $('.bp-curr-mode-ctn').off('click.bpCamp').on('click.bpCamp', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setBpCampView(getBpCampFilter() === '防守' ? '进攻' : '防守');
        if (bpMode) {
            renderBpPointList();
            generateBpPoints(getBpSelectedMapPoints());
        }
    });

    $('.btn-view-change-bp .bp-view-change1').off('click.bpCamp').on('click.bpCamp', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setBpCampView('进攻');
        if (bpMode) {
            renderBpPointList();
            generateBpPoints(getBpSelectedMapPoints());
        }
    });

    $('.btn-view-change-bp .bp-view-change2').off('click.bpCamp').on('click.bpCamp', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setBpCampView('防守');
        if (bpMode) {
            renderBpPointList();
            generateBpPoints(getBpSelectedMapPoints());
        }
    });

    $('.btn-bp-change').off('click.bp').on('click.bp', function (event) {
        event.stopPropagation();
        if (bpMode) {
            exitBpMode();
        } else {
            enterBpMode(getQuery('bp') || BP_DEFAULT_MAP);
        }
    });

    // 三个模式入口分别处理点击，避免点击爆破或烽火地带时误进入全面战场。
    $('.btn-war-change .bp-change-text').off('click.bp').on('click.bp', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!bpMode) enterBpMode(getQuery('bp') || BP_DEFAULT_MAP);
    });

    $('.btn-war-change2').off('click.bpWar').on('click.bpWar', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (bpMode) exitBpMode();
        if (isWar) enterWarMap();
    });

    var queryMap = getQuery('bp');
    if (queryMap) enterBpMode(queryMap === '1' ? BP_DEFAULT_MAP : queryMap);
}

// 爆破地图菜单：data-map 对应 BP_MAP_CONFIGS 中的地图 key。
var bpMapChangeBtn = $('.btn-bp-change-map-ctn');
var bpMapList = bpMapChangeBtn.find('.map-list-ctn');

bpMapChangeBtn.off('mouseenter.bpMapMenu').on('mouseenter.bpMapMenu', function () {
    bpMapList.css({height: '1rem', width: '1.2rem'});
    bpMapChangeBtn.css('height', '1.5rem').addClass('hover');
    $('.curr-map-ctn').css('z-index', 7);
});

bpMapChangeBtn.off('mouseleave.bpMapMenu').on('mouseleave.bpMapMenu', function () {
    bpMapList.css({height: '0px', width: '1.3rem'});
    bpMapChangeBtn.css('height', '0.3rem').removeClass('hover');
    $('.curr-map-ctn').css('z-index', 6);
});

$('.bp-map-item').off('click.bpMap').on('click.bpMap', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $item = $(e.currentTarget);
    var mapKey = $item.attr('data-map');
    if (!mapKey || !BP_MAP_CONFIGS[String(mapKey).toLowerCase()]) return;

    switchBpMap(mapKey);
    setBpMapMenuActive(mapKey);
});

// 显示菜单栏
$('.btn-nav-state-bp').on('click', function () {
    $('.bp-nav-ctn').removeClass('bot').addClass('show');
    window.requestAnimationFrame(updateBpPointListMask);
})

// 关闭菜单栏
$('.btn-check-marker-bp').on('click', function () {
    $('.bp-nav-ctn').removeClass('show')
})

$('.bp-btns-item').off('click.bpPointType').on('click.bpPointType', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $item = $(e.currentTarget);
    if ($item.hasClass('bp-btn-normal')) {
        var normalEntries = getBpPointEntries('normal');
        normalEntries.forEach(function (entry) {
            if (getBpEntryMapPoints(entry).length) {
                bpSelectedPointKeys[getBpEntryKey('normal', entry)] = true;
            }
        });
        $('.bp-btns-item').removeClass('act');
        $item.addClass('act');
        renderBpPointList('normal');
        generateBpPoints(getBpSelectedMapPoints());
        return;
    }
    var wasActive = $item.hasClass('act');
    $('.bp-btns-item').removeClass('act');
    if (!wasActive) $item.addClass('act');
    renderBpPointList(wasActive ? null : ($item.hasClass('bp-btn-role') ? 'role' : 'normal'));
});

$('.bp-nav-ctn .reset-choose').off('click.bpReset').on('click.bpReset', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    resetBpChoose();
});

$('.bp-point-list').off('scroll.bpMask').on('scroll.bpMask', updateBpPointListMask);

window.bpModeApi = {
    enter: enterBpMode,
    switchMap: switchBpMap,
    exit: exitBpMode,
    generateMap: generateBpMap,
    generatePoints: generateBpPoints,
    generateRegions: generateBpRegions,
    renderPointList: renderBpPointList,
    resetChoose: resetBpChoose,
    getPoints: function () {
        return bpCurrentConfig ? bpCurrentConfig.points : [];
    },
    getRegions: function () {
        return bpCurrentConfig ? bpCurrentConfig.regions : [];
    },
    refresh: refreshBpMap,
    getMapPos: getBpMapPos,
    getWorldPos: getBpWorldPos
};

window.addEventListener('load', initBpMode);

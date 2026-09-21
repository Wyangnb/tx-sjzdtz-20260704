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
// PC main.js does not declare this legacy map-selection state; keep it global for shared handlers.
var clickMap = '0';

var BP_DEFAULT_MAP = 'htzz';
// 爆破模式可拖拽视野在瓦片边界外额外保留的空间，数值越大可移动范围越大。
var BP_VIEW_BOUNDS_PADDING = 200;
var bpCurrentConfig = null;
var bpMarkerPlayer = null;
var bpMarkerPlayerIndex = 0;

function clearBpMarkerMedia() {
    var $preview = $('.marker-preview-ctn');
    var $markerPop = $('.marker-pop-ctn');
    if (bpMarkerPlayer && typeof bpMarkerPlayer.pause === 'function') {
        bpMarkerPlayer.pause();
    }
    if (bpMarkerPlayer && typeof bpMarkerPlayer.destroy === 'function') {
        bpMarkerPlayer.destroy();
    }
    bpMarkerPlayer = null;
    $preview.find('.marker-pop-video, .marker-pop-video-ctn').remove();
    $markerPop.find('.marker-pop-desc').remove();
    $preview.find('.marker-preview').attr('src', '').hide();
    $preview.hide();
}

function initBpMarkerPlayer(containerId, vid) {
    if (typeof window.Txplayer !== 'function') return;
    bpMarkerPlayer = new window.Txplayer({
        containerId: containerId,
        vid: vid,
        width: '600',
        height: '400',
        autoplay: true
    });
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

function renderBpMarkerMedia(point) {
    if (!bpMode) return;
    var $preview = $('.marker-preview-ctn');
    if (!$preview.length) return;

    clearBpMarkerMedia();
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
        if (typeof window.Txplayer === 'function') {
            initBpMarkerPlayer(containerId, vid);
        } else {
            var script = document.createElement('script');
            script.src = '//vm.gtimg.cn/tencentvideo/txp/js/txplayer.js';
            script.onload = function () {
                if ($('#' + containerId).length && bpMode) initBpMarkerPlayer(containerId, vid);
            };
            document.head.appendChild(script);
        }
    } else if (img) {
        $preview.find('.marker-preview').attr('src', img).show();
        $preview.show();
    } else {
        $preview.hide();
    }

    if ((vid || img) && pointDesc) {
        $('<div>', {
            'class': 'marker-pop-desc'
        }).text(pointDesc).appendTo($('.marker-pop-ctn'));
    }
}

var BP_MAP_CONFIGS = {
    htzz: {
        key: 'htzz',
        title: '航天中转站',
        info: htzzzInfo,
        points: selectPoint_htzzz,
        regions: selectRegion_htzzz,
        tileExtension: 'mixed'
    },
    lswdz: {
        key: 'lswdz',
        title: '蓝水屋电站',
        info: lswdzInfo,
        points: selectPoint_lswdz,
        regions: selectRegion_lswdz,
        tileExtension: 'jpg'
    },
    smezy: {
        key: 'smezy',
        title: '萨米尔庄园',
        info: smezyInfo,
        points: selectPoint_smezy,
        regions: selectRegion_smezy,
        tileExtension: 'jpg'
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
    if (bpCurrentConfig && bpCurrentConfig.tileExtension === 'mixed') {
        return coords.z === 1 && !(coords.x === 0 && coords.y === 0) ? 'png' : 'jpg';
    }
    return 'jpg';
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
    clearBpMarkerMedia();
    clearBpPointActiveState();
    clearBpRoleLayer();
    var mapX = event.latlng.lng;
    var mapY = event.latlng.lat;
    var worldPos = getBpWorldPos(mapX, mapY);
    console.log( Number(worldPos.x.toFixed(0)), Number(worldPos.y.toFixed(0)));
    $('.bp-nav-ctn').removeClass('show')
    $('.marker-pop-ctn').removeClass('show')

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
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        }),
        zIndexOffset: 500
    }).addTo(map);

    marker.on('click', function (event) {
        if (event && event.originalEvent && L.DomEvent && L.DomEvent.stopPropagation) {
            L.DomEvent.stopPropagation(event.originalEvent);
        }
        clearBpPointActiveState();
        if (marker.getElement()) $(marker.getElement()).addClass('act');
        if (point.role_x !== undefined && point.role_y !== undefined && point.role_icon) {
            clearBpRoleLayer();
            var rolePos = getBpMapPos(point.role_x, point.role_y);
            bpRoleLine = L.polyline([
                [pos.y, pos.x],
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
        currClickMarker = marker;
        marker.myIcon = marker.getIcon();
        if (markerPop && markerPop.length) {
            markerName.html(escapeBpHtml(point.point_name || point.name || ''));
            addressName.html(point.name);
            renderBpMarkerMedia(point);
            markerPop.addClass('show');
        }
        map.flyTo([pos.y, pos.x], Math.max(map.getZoom(), bpCurrentConfig.info.initZoom));
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
        mapTitle: $('.curr-map-name').text(),
        mapLevel: $('.curr-map-lv').text()
    };
}

function setBpUi(active) {
    $('.m-index').toggleClass('bp-mode', active);
    $('.curr-map-ctn').toggleClass('bp-mode', active);
    $('.marker-pop-ctn').toggleClass('bp-mode', active);
    $('.btn-bp-change').toggleClass('bp-hidden', active);
    $('.btn-war-change2').toggleClass('bp-hidden', !active).css('display', active ? 'flex' : '');
    $('.btn-war-change').toggleClass('war', !active && isWar);
    if (active) $('.btn-war-change').removeClass('war');
    $('.btn-change-map-ctn, .btn-floor-mod, .btn-view-change, .type-change-ctn, .select-region-ctn, .nav-ctn, .curr-random, .curr-map-lv, .btn-nav-state')
        .toggleClass('bp-hidden', active);
    $('.btn-bp-change .bp-change-text').text(active ? '退出爆破' : '爆破模式');
    if (active && bpState && bpState.isWar) {
        $('.btn-war-change .war-change-text').text('全面战场');
    }
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
    var camp = $.trim($('.mode-change-text').first().text());
    return camp === '进攻' || camp === '防守' ? camp : '';
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
    function collect(points) {
        (Array.isArray(points) ? points : []).forEach(function (point) {
            if (!point) return;
            if (point.x !== undefined && point.y !== undefined) result.push(point);
            if (Array.isArray(point.points)) collect(point.points);
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
    getBpEntryMapPoints(entry).forEach(function (point) {
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
        var selectedClass = bpSelectedPointKeys[entryKey] ? ' act' : '';
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
                bpSelectedPointKeys[skill.key] = true;
            });
            $('.bp-skill-title').show();
            renderBpPointItems($skillList, skills, 'bp-skill-item', function (skill, $skillItem) {
                var skillSelected = !!bpSelectedPointKeys[skill.key];
                if (skillSelected) delete bpSelectedPointKeys[skill.key];
                else bpSelectedPointKeys[skill.key] = true;
                $skillItem.toggleClass('act', !skillSelected);
                generateBpPoints(getBpSelectedMapPoints());
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
    return entries;
}

function resetBpChoose() {
    if (!bpMode) return;
    bpSelectedPointKeys = {};
    bpSelectedRoleKey = null;
    $('.bp-btns-item').removeClass('act');
    $('.bp-skill-title').hide();
    $('.bp-skill-list').empty();
    renderBpPointList(null);
    generateBpPoints([]);
}

function exitBpMode() {
    if (!bpMode) return true;

    clearBpMarkerMedia();
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
    $('.btn-war-change2').addClass('bp-hidden');
    $('.btn-close-marker-pop').off('click.bpRole').on('click.bpRole', function () {
        if (!bpMode) return;
        clearBpPointActiveState();
        clearBpRoleLayer();
        clearBpMarkerMedia();
    });

    $('.bp-curr-mode-ctn').off('click.bpCamp').on('click.bpCamp', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $text = $('.mode-change-text').first();
        $text.text($.trim($text.text()) === '防守' ? '进攻' : '防守');
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

    // 爆破模式下切换到全面战场；移除常规模式的旧绑定，避免重复切换状态。
    $('.btn-war-change').off('click').on('click.bpWar', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (bpMode) {
            // 爆破模式是从战场进入时，退出爆破即可恢复战场，避免再次切回常规模式。
            var wasWarMode = !!(bpState && bpState.isWar);
            exitBpMode();
            if (!wasWarMode) enterWarMap();
            return;
        }
        enterWarMap();
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

$('.curr-map-name').on('click', function () {
    $('.bp-map-change').toggleClass('show')
})


// 爆破地图菜单：data-map 对应 BP_MAP_CONFIGS 中的地图 key。
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
    $('.bp-nav-ctn').addClass('show')
})

// 关闭菜单栏
$('.btn-check-marker-bp').on('click', function () {
    $('.bp-nav-ctn').removeClass('show')
})

$('.bp-btns-item').off('click.bpPointType').on('click.bpPointType', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $item = $(e.currentTarget);
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

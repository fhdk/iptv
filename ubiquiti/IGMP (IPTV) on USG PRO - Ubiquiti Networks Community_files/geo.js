(function($) {
    geoworks = {
        init: function() {

            var GeoWorkins = function( props ) {
                var app;
                app = {
                    setCookie: function( args ) { // name, value, expire
                        name = args.name;
                        value = args.value;
                        expire = args.expire;
                        var exdate=new Date();
                        exdate.setDate(exdate.getDate()+expire);
                        document.cookie = name+ "=" +encodeURI(value) + ((expire==null) ? "" : ";expires="+exdate.toGMTString()) + "; path=/";
                    },
                    getCookie: function( args ) { // name
                        name = args.name;
                        if (document.cookie.length > 0 ) {
                            c_start=document.cookie.indexOf(name + "=");
                            if (c_start != -1){
                                c_start=c_start + name.length+1;
                                c_end=document.cookie.indexOf(";",c_start);
                                if (c_end == -1) {
                                    c_end=document.cookie.length;
                                }
                                return decodeURI(document.cookie.substring(c_start,c_end));
                            }
                        }
                        return '';
                    },
                    getGeo: function( args ) {
                        var apiurl = 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCIIC80zCmxzDOeu4_2hGWyavYdVBEnKd8';
                        var geolocationCookie = app.getCookie({ name: 'geolocation' });
                        var location;

                        if ( !geolocationCookie ) {
                            $.when(
                                $.ajax({
                                    type: 'POST',
                                    url: apiurl,
                                    success: function(data) {
                                        location = data;
                                        JSONString = JSON.stringify(location);
                                        app.setCookie({ name: 'geolocation', value: JSONString, expire: 7 });
                                    }
                                })
                            ).done(function() {
                                args.callback( location );
                            }).fail(function() {
                                args.callback( false );
                            });

                        } else {
                            geodata = JSON.parse(geolocationCookie);
                            args.callback( geodata );
                        }
                    },
                    prepareForLocationInjection: function( params ) {

                        var forms = $(params.query);

                        if ( forms.length > 0 ) {

                            app.getGeo({
                                callback: function (location) {
                                    if (location) {
                                        var msgmeta = location.location;

                                        var lat = $('<input/>', {
                                            id: 'lia-message-latitude',
                                            name: 'action.location.latitude',
                                            value: msgmeta.lat,
                                            type: 'hidden'
                                        });

                                        var lng = $('<input/>', {
                                            id: 'lia-message-longitude',
                                            name: 'action.location.longitude',
                                            value: msgmeta.lng,
                                            type: 'hidden'
                                        });

                                        forms.prepend(lat);

                                        forms.prepend(lng);

                                        setInterval(function () {
                                            var quickreplyForm = $('form.lia-component-quickreply');
                                            quickreplyForm.each(function () {
                                                var self = $(this);
                                                var hasLocation = self.find('input#lia-message-longitude').length;
                                                if (hasLocation < 1) {
                                                    var lat = $('<input/>', {
                                                        id: 'lia-message-latitude',
                                                        name: 'action.location.latitude',
                                                        value: msgmeta.lat,
                                                        type: 'hidden'
                                                    });

                                                    var lng = $('<input/>', {
                                                        id: 'lia-message-longitude',
                                                        name: 'action.location.longitude',
                                                        value: msgmeta.lng,
                                                        type: 'hidden'
                                                    });
                                                    self.prepend(lat);
                                                    self.prepend(lng);
                                                }
                                            });
                                        }, 2000);

                                    } else {

                                    }
                                }
                            });

                        }

                    },
                    prepareGoogleMapsAndMarkers: function() {

                        var endpoint = '/ubnt/plugins/custom/ubiquiti/ubnt/v2activitymap';

                        var mapCanvas = document.getElementById( 'location-map-canvas' );

                        function CustomMarker( latlng, map, marker ) {
                            this.latlng = latlng;
                            this.marker = {};
                            this.marker['values'] = marker;
                            this.setMap( map );
                            this.themap = map;
                        }

                        CustomMarker.prototype = new google.maps.OverlayView();

                        CustomMarker.prototype.draw = function() {

                            var scope = this;

                            scope.marker['panes'] = scope.getPanes();

                            if ( !scope.div ) {

                                scope.div = document.createElement('div');

                                scope.marker['dom'] = scope.div;

                                scope.marker['dom'].className += 'map-marker';
                                scope.marker['dom'].style.position = 'absolute';
                                scope.marker['dom'].style.width = scope.marker['values']['width'] + 'px';
                                scope.marker['dom'].style.height = scope.marker['values']['height'] + 'px';

                                scope.marker['dom']['icon'] = document.createElement('div');
                                scope.marker['dom']['icon'].className += 'map-marker-icon';

                                scope.marker['dom']['icon']['dot'] = document.createElement('div');
                                scope.marker['dom']['icon']['dot'].className += 'map-marker-icon-dot';
                                scope.marker['dom']['icon'].appendChild( scope.marker['dom']['icon']['dot'] );

                                scope.marker['dom'].appendChild( scope.marker['dom']['icon'] );

                                if ( !scope.marker['values']['width'] ) {
                                    scope.marker['values']['width'] = 50;
                                }
                                if ( !scope.marker['values']['height'] ) {
                                    scope.marker['values']['height'] = 50;
                                }

                                scope.marker['panes'].overlayImage.appendChild( scope.marker['dom'] );

                            }

                            scope.marker['point'] = scope.getProjection().fromLatLngToDivPixel( scope.latlng );

                            setTimeout(function() {
                                scope.marker['dom'].className += ' has-loaded';
                            }, 1000);

                            if ( scope.marker['point'] ) {

                                scope.marker['dom'].style.left = ( scope.marker['point'].x - ( scope.marker['values']['width'] / 2 ) ) + 'px';
                                scope.marker['dom'].style.top = ( scope.marker['point'].y - ( scope.marker['values']['height'] / 2 ) ) + 'px';

                            }
                        };

                        CustomMarker.prototype.remove = function() {
                            if ( this.div ) {
                                if ( this.div.parentNode ) {
                                    this.div.parentNode.removeChild( this.div );
                                }
                                this.div = null;
                            }
                        };

                        CustomMarker.prototype.getPosition = function() {
                            return this.latlng;
                        };

                        function generateTheMap( markersDataSet, mapCanvas ) {
                            var markers = [];
                            var lastPostTime = 0;
                            var mapInitialCenter = new google.maps.LatLng(40, -20);
                            var refreshMarkerState;

                            var mapStyleConfig = [
                                {
                                    "featureType": "administrative",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "administrative",
                                    "elementType": "labels",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "administrative.country",
                                    "elementType": "geometry.stroke",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "administrative.province",
                                    "elementType": "geometry.stroke",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "landscape",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "landscape",
                                    "elementType": "geometry",
                                    "stylers": [
                                        {
                                            "color": "#00acff"
                                        },
                                        {
                                            "lightness": "64"
                                        },
                                        {
                                            "gamma": "1"
                                        },
                                        {
                                            "visibility": "on"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "landscape.natural",
                                    "elementType": "geometry.fill",
                                    "stylers": [
                                        {
                                            "color": "#fbfbfb"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "landscape.natural",
                                    "elementType": "labels",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "poi",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "road",
                                    "stylers": [
                                        {
                                            "color": "#cccccc"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "road",
                                    "elementType": "geometry.fill",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "road",
                                    "elementType": "geometry.stroke",
                                    "stylers": [
                                        {
                                            "color": "#00acff"
                                        },
                                        {
                                            "lightness": "88"
                                        },
                                        {
                                            "visibility": "on"
                                        },
                                        {
                                            "weight": "0.1"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "road",
                                    "elementType": "labels",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "transit",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "transit",
                                    "elementType": "labels.icon",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "transit.line",
                                    "elementType": "geometry",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "transit.line",
                                    "elementType": "labels.text",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "transit.station.airport",
                                    "elementType": "geometry",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "transit.station.airport",
                                    "elementType": "labels",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                },
                                {
                                    "featureType": "water",
                                    "elementType": "geometry",
                                    "stylers": [
                                        {
                                            "color": "#8dd6fb"
                                        },
                                        {
                                            "weight": 1
                                        }
                                    ]
                                },
                                {
                                    "featureType": "water",
                                    "elementType": "labels",
                                    "stylers": [
                                        {
                                            "visibility": "off"
                                        }
                                    ]
                                }
                            ];

                            var mapStyleObj = new google.maps.StyledMapType( mapStyleConfig, { name: 'The Map' } );
                            var mapOptions = {
                                scrollwheel: false,
                                navigationControl: true,
                                draggable: true,
                                zoom: 2,
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                center: mapInitialCenter,
                                disableDefaultUI: false,
                                minZoom: 2,
                                maxZoom: 9,
                                panControl: true,
                                zoomControl: true,
                                mapTypeControl: false,
                                scaleControl: true,
                                streetViewControl: false,
                                overviewMapControl: true,
                                zoomControlOptions: {
                                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                                }
                            };
                            var map = new google.maps.Map( mapCanvas, mapOptions );

                            map.mapTypes.set( 'map_style', mapStyleObj );
                            map.setMapTypeId( 'map_style' );

                            try {
                                populateMarkers( map, markersDataSet );
                            } catch ( err ) {
                                console.log( err.message );
                            }






                            google.maps.event.addListenerOnce( map, 'tilesloaded', function() {

                                refreshMarkerState = setInterval(function() {
                                    var markerZ = $('.map-marker:not(.map-marker-group)').parent();
                                    var markerGroupZ = $('.map-marker.map-marker-group').parent();
                                    var markerZCss = markerZ.css('z-index');
                                    var markerGroupZCss = markerGroupZ.css('z-index');
                                    if ( markerZCss < markerGroupZCss ) {
                                        markerZ.css( 'z-index', markerGroupZCss + 1 );
                                    }
                                }, 200);


                                // map.addListener('bounds_changed', function() {
                                //     populateMarkerGroups( markers );
                                //     console.log('bounds_changed');
                                // });

                                // map.addListener('dragend', function() {
                                //     populateMarkerGroups( markers );
                                //     console.log('dragend');
                                // });

                            });



                            function populateMarkers( map, data ) {

                                lastPostTime = data[0].time;

                                for( var i = 0; i < data.length; i++ ) {

                                    try {

                                        var latlng = new google.maps.LatLng( data[i]['lat'], data[i]['lon'] );
                                        var customMarker = new CustomMarker( latlng, map, {
                                            'id'        : data[i]['id'],
                                            'title'     : data[i]['title'],
                                            'content'   : data[i]['content'],
                                            'link'      : data[i]['link'],
                                            'thumb'     : data[i]['thumb']
                                        });

                                        var markerEvent = new google.maps.event.addListener(customMarker, 'click', function () {
                                            map.panTo( this.getPosition() );
                                        });

                                        markers.push( customMarker );

                                        if ( ( data.length - 1 ) == i ) {
                                            populateMarkerGroups( markers );

                                            setInterval(function() {
                                                requestNewMarkers( lastPostTime );
                                            }, 5000);
                                        }

                                    } catch ( err ) {
                                        console.log( err.message );
                                    }

                                }
                                if ( markers.length > 100 ) {
                                    $('#map-marker-count').text( markers.length );
                                }
                            }



                            function requestNewMarkers( theTime ) {

                                var lastPointTime = theTime;

                                lastPointTime = moment.parseZone(theTime).add(1, 'seconds').format();
                                var newMarkersUrl = endpoint + '?last_post_time=' + lastPointTime;

                                var gmapMarkers;
                                $.getJSON( newMarkersUrl ).done(function(data) {
                                    gmapMarkers = data['response'];
                                    var data = gmapMarkers['markers'];

                                    if ( data[0] ) {

                                        lastPostTime = data[0].time;

                                        for( var i = 0; i < data.length; i++ ) {
                                            var skip = false;
                                            for( var ei = 0; ei < markers.length; ei++ ) {
                                                if ( markers[ei].marker.values.id == data[i]['id'] ) {
                                                    skip = true;
                                                    break;
                                                }
                                            }

                                            if ( !skip ) {
                                                var latlng = new google.maps.LatLng(data[i].lat, data[i].lon);

                                                var customMarker = new CustomMarker(latlng, map, {
                                                    'id'        : data[i]['id'],
                                                    'title'     : data[i]['title'],
                                                    'content'   : data[i]['content'],
                                                    'link'      : data[i]['link'],
                                                    'thumb'     : data[i]['thumb']
                                                });

                                                markers.push(customMarker);


                                            }

                                            if ( ( data.length - 1 ) == i ) {
                                                populateMarkerGroups( markers );
                                            }

                                        }

                                    }

                                    if ( markers.length > 100 ) {
                                        $('#map-marker-count').text( markers.length );
                                    }
                                });
                            }


                            function populateMarkerGroups( markers ) {
                                //$('.map-marker.map-marker-group').remove();
                                var markerCluster = new MarkerClusterer(map, markers,
                                    {'styles' : [{
                                        'icon'      : '',
                                        'height'    : 30,
                                        'width'     : 30
                                    }]}
                                );
                            }

                        }

                        if ( mapCanvas ) {

                            google.maps.event.addDomListener( window, 'load', function() {
                                $.getJSON( endpoint ).done(function(data) {
                                    var markersJson = data['response'];
                                    generateTheMap( markersJson['markers'], mapCanvas );
                                });
                            });

                        }
                    },
                    init: function() {
                        app.prepareForLocationInjection({ query: '.lia-message-quick-reply, .lia-component-editor-form, .lia-component-editor, .CommentEditorForm' });
                        app.prepareGoogleMapsAndMarkers();
                    }
                };
                if ( props.name && typeof props.name === 'string' ) {
                    return app[props.name](props.args);
                } else {
                    return false;
                }
            };

            GeoWorkins({ name: 'init' });

        }
    };
    window.geoworks = geoworks;
    jQuery(document).ready(function() {
        geoworks.init();
    });
})(jQuery);

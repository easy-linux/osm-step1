import Map from "ol/Map";
import Tile from "ol/layer/Tile";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import { Icon, Style } from "ol/style";
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';

const init = () => {
  const container = document.getElementById('popup');
  const content = document.getElementById('popup-content');
  const closer = document.getElementById('popup-closer');

  const overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });

  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };


  const map = new Map({
    target: "map",
    layers: [
      new Tile({
        source: new OSM(),
      }),
    ],
    controls: [],
    view: new View({
      center: fromLonLat([12.506465092175558, 41.916117241881494]),
      zoom: 4,
    }),
  });

  const Marker = new Feature({
    type: "icon",
    geometry: new Point(fromLonLat([12.506465092175558, 41.916117241881494])),
  });

  const style = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: "images/icon.png",
    }),
  });

  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: [Marker],
    }),
    style: function(feature){
        return style;
    },
  });

  map.addOverlay(overlay);

  map.on('singleclick', function (evt) {
    var coordinate = evt.coordinate;
    //var hdms = toStringHDMS(toLonLat(coordinate));
    var clickOnFeature = false;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        if(!clickOnFeature){
            if(feature){
              content.innerHTML = '<p>Маркер с <strong>любым</strong> <i>текстом</i></p>';
              overlay.setPosition(coordinate);
              clickOnFeature = true;
            }
        }
    });

    content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
    overlay.setPosition(coordinate);
  });

  map.addLayer(vectorLayer);
  map.render();
};

init();

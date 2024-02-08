# Добавляем OpenStreetMap карту на свой сайт

## Введение

Любой уважающий себя магазин, кафе, бассейн уже давно обзавелся собственным сайтом. Чтобы упростить клиентам поиск заведения на сайтах частенько есть схема проезда, а наиболее продвинутые интегрируют на сайт Google карты. 

Самые модные даже размещиют свое заведение на Google картах. Все бы хорошо, но есть одна проблемка, которую обычно обнаруживают когда уже слишком поздно. Карты от гугл не совсем бесплатны. Пользоваться ими в полном объеме можно в трех случаях - на платной основе или если сайт посещают очень мало пользователей и для разработчиков (тот тоже количесвто посещений заведомо маленькое). Если сайт посещаемый, то вариант ровно один - отгружать дензнаки. 

Что же делать? Использовать действительно бесплатный сервис OpenStreetMap. Это фактически народные карты, которые создавались и создаются энтузиастами по всему миру по тому же принципу как и википедия. Карты построенные на базе OSM выглядят по-другому, но для большинства пользователей это не важно. Важно иметь бесплатную карту на сайте, где точкой (или кучей точек) обозначено положение заведения и этого достаточно. В этом проекте мы разберемся как подготовить карту, разместить на ней маркер и добавить некторый текст, для показа пользователю после клика на маркере. 

## Установка требуемого окружения

Прежде всего нужно иметь установленный на компьютере nodejs. Можно и без ноды, но это не предмет нашего рассмотрения.
Для установки nodejs читайте документацию здесь:

https://github.com/easy-linux/node-install

Или смотрите ролик здесь:

[![](https://img.youtube.com/vi/gP4OPx2vBoc/0.jpg)](https://youtu.be/gP4OPx2vBoc)


## Установка необходимых пакетов

Поскольку наша цель максимальная простота и минимальное кодирование воспользуемся специальным пакетом для работы с картами OpenLayer. 
В таком случае все необходимые пакеты сводятся к трем - собственно webpack и Open Layer. Создаем папку где будет храниться наш проект и переходим в эту папку в термин

    //инициализируем папку как npm проект
    npm -y init
    //Устанавливаем пакеты
    npm install webpack webpack-cli -D
    npm install ol

Создаем папки и файлы:

    touch webpack.config.js
    touch index.html
    mkdir src dist
    touch src/main.js

Добавляем простейшую конфигурацию для webpack:
```javascript
//файл webpack.config.js
   
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
};
```

Как видим, точкой начала сборки является файл src/main.js, результирующий бандл будет находиться в папке dist

Создаем содержимое для файла index.html, он нам понадобится для тестирования приложения:
```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>OSM Example 1</title>
    <style>
      html {
        width: 100%;
        height: 100%;
      }
      body {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }
      .header{
          position: absolute;
          left: 50px;
          top: 50px;
          background-color: #fff;
          z-index: 2;
      }
      .map {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .ol-popup {
        position: absolute;
        background-color: white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 280px;
      }
      .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
      }
      .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
      }
      .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
      }
      .ol-popup-closer:after {
        content: "✖";
      }
    </style>
  </head>
  <body>
    <h1 class="header">OSM карта на сайте</h1>
    <div id="map" class="map"></div>

    <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>
    <script src="./dist/bundle.js"></script>
  </body>
</html>
```

Добавляем команду для сборки приложения в package.json:
    webpack -c ./webpack.config.js
    
В результате должно получиться следующее:

```json
{
  "name": "OSM1",
  "version": "1.0.0",
  "description": "",
  "main": "src/main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack -c ./webpack.config.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.28.0",
    "webpack-cli": "^4.6.0"
  },
  "dependencies": {
    "ol": "^6.5.0"
  }
}

```

И наконец-то пишем код в файл main.js:

```javascript
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
```

## Видео по vitejs

[![Видео здесь](https://img.youtube.com/vi/wIEauCguZGI/0.jpg)](https://www.youtube.com/watch?v=wIEauCguZGI)
[![Видео здесь](https://img.youtube.com/vi/t98Q9hliZZo/0.jpg)](https://www.youtube.com/watch?v=t98Q9hliZZo)
[![Видео здесь](https://img.youtube.com/vi/aMzCDR_MHF0/0.jpg)](https://www.youtube.com/watch?v=aMzCDR_MHF0)
[![Видео здесь](https://img.youtube.com/vi/TZN6dC7ZOs0/0.jpg)](https://www.youtube.com/watch?v=TZN6dC7ZOs0)


## Полезные видео по настройке webpack:


Минимальная конфигурация:

[![Видео здесь](https://img.youtube.com/vi/unEl3Hezwpw/0.jpg)](https://www.youtube.com/watch?v=unEl3Hezwpw)

Настройка горячей перезагрузки:

[![Видео здесь](https://img.youtube.com/vi/oOpzkF2nU0s/0.jpg)](https://www.youtube.com/watch?v=oOpzkF2nU0s)

Настройка сборки проекта с подгрузкой файлов css/scss/изображений:

[![Видео здесь](https://img.youtube.com/vi/3B-NGZmMe-Y/0.jpg)](https://www.youtube.com/watch?v=3B-NGZmMe-Y)

Модульный принцип конфигурации проекта:

[![Видео здесь](https://img.youtube.com/vi/fnUqyWyG5kk/0.jpg)](https://www.youtube.com/watch?v=fnUqyWyG5kk)

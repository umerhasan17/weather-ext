// import * as config from './config'

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget
} from '@jupyterlab/apputils';

import {
  Widget
} from '@lumino/widgets';


interface WeatherStackResponse {
  request: {
    type: string,
    query: string,
    language: string,
    unit: string
  };
  location: {
    name: string,
    country: string,
    region: string,
    lat: string,
    lon: string,
    timezone_id: string,
    localtime: string,
    localtime_epoch: number,
    utc_offset: string
  };
  current: {
    observation_time: string,
    temperature: number,
    weather_code: number,
    weather_icons: string
    weather_descriptions: string,
    wind_speed: number,
    wind_degree: number,
    wind_dir: string
    pressure: number,
    precip: number
    humidity: number,
    cloudcover: number,
    feelslike: number,
    uv_index: number,
    visibility: number
  };
}

interface WeatherStackErrorResponse {
  success: boolean,
  error: {
      code: number,
      type: string,
      info: string   
  }
}


const extension: JupyterFrontEndPlugin<void> = {
  id: 'weather_ext',
  autoStart: true,
  requires: [ICommandPalette],
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension weather_ext is activated!');
  
    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({content});
    widget.id = 'weather_ext';
    widget.title.label = 'Weather Extension Panel';
    widget.title.closable = true;

    const info = document.createElement('p');
    const displayContainer = document.createElement('div');
    info.className = 'error-message';

    async function getWeather(event: { preventDefault: () => void; }) {
      event.preventDefault();
      console.log('run getWeather()');
      info.innerHTML = '';
      displayContainer.innerHTML = '';
      const location = (<HTMLInputElement>document.getElementById('location')).value;
      /* validate input */ 
      if (!/^[a-zA-Z\s]*$/.test(location)) {
        info.innerHTML = 'Unrecognised input entered!';
      } else {
        const response = await fetch('http://www.mocky.io/v2/5e6544883400007b663389c3');
        // const response = await fetch('http://www.mocky.io/v2/5e653135340000a93c33899f');
        // const response = await fetch(`http://api.weatherstack.com/current?access_key=${api_key}&query=${location}`);

        const result = await response.json();
        
        function isValid(result: WeatherStackResponse | WeatherStackErrorResponse): result is WeatherStackResponse {
          return (result as WeatherStackResponse) !== undefined;
        }

        if (isValid(result)) {
          displayWeather(result as WeatherStackResponse);
        } else {
          const error = result as WeatherStackErrorResponse;
          info.innerHTML = error.error.info;
        }
      }
  
      content.node.appendChild(info) 
    }

    function displayWeather(data: WeatherStackResponse) {
      console.log(data);
      displayContainer.innerHTML = 
        `<div class="container">\
          <div class="widget">\
            <div class="details">\
              <div class="temperature">${data.current.temperature}&deg;C</div>\
              <div class="summary">\
                <p class="summaryText">${data.current.weather_descriptions[0]}</p>\
              </div>\
              <div class="location">${data.location.name}, ${data.location.country}</div>\
              <div class="details-elem">Precipitation: ${data.current.precip} mm</div>\
              <div class="details-elem">Wind: ${data.current.wind_speed} kph</div>\
            </div>\
            <div class="pictoFrame"></div>\
            <div class="pictoCloudBig"></div>
            <div class="pictoCloudFill"></div>
            <div class="pictoCloudSmall"></div>
            <img class="main-icon" src="${data.current.weather_icons[0]}"/>\
          </div>\
        </div>`;
      content.node.appendChild(displayContainer);
    }

    
    const weather = document.createElement('form');
    
    if (weather.addEventListener) {
      weather.addEventListener('submit', getWeather, false);
    } else {
      weather.attachEvent('onsubmit', getWeather);
    }

    const input = document.createElement('div');
    input.innerHTML = 
      '<div class="wrapper">\
        <span>Find the weather for <input class="input" id="location" placeholder="location" type="text" ><input class="submit-button" type="submit" value="Go"></span>\
      </div>';
    weather.appendChild(input);    

    content.node.appendChild(weather);

    // Add an application command
    const command: string = 'weather:open';
    app.commands.addCommand(command, {
      label: 'Find Weather',
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });
  
    // Add the command to the palette.
    palette.addItem({command, category: 'Widgets'});
  }
};


export default extension;

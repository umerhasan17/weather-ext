import * as config from './config';

import {WeatherStackResponse, WeatherStackErrorResponse} from './weatherstack_interfaces';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget
} from '@jupyterlab/apputils';

import {
  Widget
} from '@lumino/widgets';

async function activate (app: JupyterFrontEnd, palette: ICommandPalette) {
  console.log('JupyterLab extension weather_ext is activated!');

  // Create a blank content widget inside of a MainAreaWidget
  const content = new Widget();
  const widget = new MainAreaWidget({content});
  widget.id = 'weather_ext';
  widget.title.label = 'Weather Extension Panel';
  widget.title.closable = true;

  // Create elements for display.
  const info = document.createElement('p');
  const displayContainer = document.createElement('div');
  info.className = 'error-message';

  async function getWeather(event: { preventDefault: () => void; }) {
    // Prevents page refresh
    event.preventDefault();

    // Reset HTML elements. 
    info.innerHTML = '';
    displayContainer.innerHTML = '';

    const location = (<HTMLInputElement>document.getElementById('location')).value;
    /* Validate user input - checks if input is letters and spaces only.*/ 
    if (!/^[a-zA-Z\s]*$/.test(location)) {
      info.innerHTML = 'Unrecognised input entered!';
    } else {

      const api_key = config.WEATHERSTACK_API_KEY;

      /* Mock API link - useful debug comment*/
      // const response = await fetch('http://www.mocky.io/v2/5e6544883400007b663389c3');

      const response = await fetch(`http://api.weatherstack.com/current?access_key=${api_key}&query=${location}`);
      const result = await response.json();
      
      // Check if API returned correct response or improper response e.g. API couldn't parse input as location doesn't exist. 
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

  // Function creates tile for displaying the weather
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
  
  // Call function getWeather when form submitted
  if (weather.addEventListener) {
    weather.addEventListener('submit', getWeather, false);
  } else {
    weather.attachEvent('onsubmit', getWeather);
  }

  // Create the form 
  const input = document.createElement('div');
  input.innerHTML = 
    '<div class="wrapper">\
      <span>Find the weather for \
      <input class="input" id="location" placeholder="location" type="text">\
      <input class="submit-button" type="submit" value="Go"></span>\
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


const extension: JupyterFrontEndPlugin<void> = {
  id: 'weather_ext',
  autoStart: true,
  requires: [ICommandPalette],
  activate: activate
};


export default extension;

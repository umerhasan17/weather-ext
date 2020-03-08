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
  request: object;
  location: object;
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


/** 
 * Initialization data for the weather_ext extension.
 */
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

    async function getWeather(event: { preventDefault: () => void; }) {
      event.preventDefault();
      console.log('run getWeather()');
      const test = document.createElement('p');
      const location = (<HTMLInputElement>document.getElementById('location')).value;
      /* validate input */ 
      if (!/^[a-zA-Z]+$/.test(location)) {
        test.innerHTML = 'unrecognised input entered!';
      }
    
      const response = await fetch('http://www.mocky.io/v2/5e653135340000a93c33899f');
      // const response = await fetch(`http://api.weatherstack.com/current?access_key=${api_key}&query=${location}`);
      const data = await response.json() as WeatherStackResponse;

      console.log(location);
      console.log(data);
      console.log(`This is the type of data: ${typeof(data)}`);
    
      console.log(data.current.temperature);
    
      test.innerHTML = 'get weather function was run';
      content.node.appendChild(test) 
    }
    
    const weather = document.createElement('form');
    
    if (weather.addEventListener) {
      weather.addEventListener('submit', getWeather, false);
    } else {
      weather.attachEvent('onsubmit', getWeather);
    }
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'location';
    weather.appendChild(input);
    
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Go';
    weather.appendChild(submit);
    
    // document.body.append(weather);
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

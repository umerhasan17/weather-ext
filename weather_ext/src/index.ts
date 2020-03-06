import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget
} from '@jupyterlab/apputils';

import {
  Widget
} from '@lumino/widgets';


/** 
 * Initialization data for the weather_ext extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'weather_ext',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension weather_ext is activated!');
  
    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({content});
    widget.id = 'weather_ext';
    widget.title.label = 'Weather Extension Panel';
    widget.title.closable = true;
  
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
    palette.addItem({command, category: 'Tutorial'});
  }
};


export default extension;

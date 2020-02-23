import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the weather_ext extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'weather_ext',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension weather_ext is activated!');
  }
};

export default extension;

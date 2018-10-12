import app from './server';
import * as moment from 'moment';
import { SERVER_PORT, STORAGE_DATE_FORMAT_ID } from '../constants';
// import opn from 'opn';
import { window, ExtensionContext } from 'vscode';
import Logger from '../Logger';
var pjson = require('../../package.json');

// TODO: Should be singleton
export default new class HttpServer {
  serverInstance;

  create = (context: ExtensionContext) => {
    const logger = new Logger(context);
    const data = {
      version: pjson.version,
      days: Object.keys(logger.allData())
        .reverse()
        .map(e => ({ label: e, url: moment(e).format('D-M-Y') })),
    };
    app.get('/', (req, res) => {
      res.render('home', data);
    });
    app.get('/:date', (req, res) => {
      res.render('home', {
        ...data,
        currentDay: logger.getDataFromDay(
          moment(req.params.date).format(STORAGE_DATE_FORMAT_ID)
        ),
      });
    });
    this.serverInstance = app.listen(SERVER_PORT, () => {
      window.showInformationMessage(
        `Server started at http://localhost:${SERVER_PORT}!`
      );
      // opn(`http://localhost:${SERVER_PORT}`);
    });
  };
  stop = () => {
    this.serverInstance.close(() => {
      window.showInformationMessage(`Server stopped!`);
    });
  };
}();

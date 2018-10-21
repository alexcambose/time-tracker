import app from './server';
import * as moment from 'moment';
import {
  SERVER_PORT,
  STORAGE_DATE_FORMAT_ID,
  URL_DATE_FORMAT_ID,
} from '../constants';
// import opn from 'opn';
import { window, ExtensionContext } from 'vscode';
import Logger from '../Logger';
import { TimeType } from '../enums';
var pjson = require('../../package.json');

// TODO: Should be singleton
export default new class HttpServer {
  serverInstance;

  create = (context: ExtensionContext) => {
    const logger = new Logger(context);
    let data = {
      version: pjson.version,
      days: Object.keys(logger.allData() || {})
        .reverse()
        .map(e => ({ label: e, url: moment(e).format(URL_DATE_FORMAT_ID) })),
    };
    console.log(logger.allData());
    app.get('/', (req, res) => {
      res.render('home', data);
    });
    app.get('/:date', (req, res) => {
      const todayData = logger
        .getDataFromDay(moment(req.params.date).format(STORAGE_DATE_FORMAT_ID))
        .filter(
          e =>
            e.type !== TimeType.WorkSessionStart &&
            e.type !== TimeType.WorkSessionStop
        );
      console.log(todayData);
      data.days = data.days.map(e => ({
        ...e,
        active: e.url === req.params.date,
      }));

      res.render('home', {
        ...data,
        currentDay: todayData,
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

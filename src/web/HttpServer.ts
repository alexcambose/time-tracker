import app from './server';
import * as moment from 'moment';
import 'moment-duration-format';
import { SERVER_PORT, URL_DATE_FORMAT_ID } from '../constants';
// import opn from 'opn';
import { window, ExtensionContext } from 'vscode';
import Logger from '../Logger';
import { TimeType } from '../enums';
var pjson = require('../../package.json');
import 'advmap';

// TODO: Should be singleton
export default new class HttpServer {
  serverInstance;

  create = (context: ExtensionContext) => {
    const logger = new Logger(context);
    let data = {
      version: pjson.version,
      days: Object.keys(logger.allData() || {})
        .reverse()
        .map(e => ({ label: e, url: e })),
    };
    console.log(
      logger.allData(),
      moment('21/10/2018').format(URL_DATE_FORMAT_ID)
    );
    app.get('/', (req, res) => {
      res.render('home', data);
    });
    app.get('/:date(*)', (req, res) => {
      let todayData: any = logger.getDataFromDay(req.params.date);

      todayData = todayData
        .advmap(
          (e, n1) => {
            return { ...e, duration: n1 ? n1.startTime - e.startTime : 0 };
          },
          { nextParamsCount: 1 }
        )
        .filter(
          e =>
            e.type !== TimeType.WorkSessionStart &&
            e.type !== TimeType.WorkSessionStop
        );

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

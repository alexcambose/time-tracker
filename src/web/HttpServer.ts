import app from './server';
import { SERVER_PORT } from '../constants';
// import opn from 'opn';
import { window } from 'vscode';

export default new class HttpServer {
  serverInstance;

  create = () => {
    this.serverInstance = app.listen(SERVER_PORT, () => {
      console.log('a');
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

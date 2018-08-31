'use strict';

const electron = require('electron');
const path = require("path");
const { app, BrowserWindow, remote, Menu } = electron;

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1024,
        height: 600,
          webPreferences: {
            experimentalFeatures: true,
          },
          frame: false,
          transparent: true,
          show: false
    });
    
    let url = 'file://' + __dirname + '/../www/index.html';
    let args = process.argv.slice();
    let port = '8100', address = 'localhost'
    let devMode = false;
    args.forEach(function (val, i) {
      if (val === 'test') devMode = true;
      if(devMode){
        if (val === '-p' || val === '--port')  port = `${args[i+1]}`
        if (val === '-h' || val === '--host') address =`${args[i+1]}`
        url = `http://${address}:${port}`;
        console.log('Connected to: ', url)
      }
    });

    win.loadURL(url);

    win.webContents.on('did-finish-load', () => {
        win.show();
    });
    win.setMenuBarVisibility(false)

    const selectionMenu = Menu.buildFromTemplate([
      { role: 'copy' },
      { type: 'separator' },
      { role: 'selectall' },
    ])

    const inputMenu = Menu.buildFromTemplate([
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'selectall' },
    ])

    win.webContents.on('context-menu', (e, props) => {
      const { selectionText, isEditable } = props;
      if (isEditable) {
        inputMenu.popup(win);
      } else if (selectionText && selectionText.trim() !== '') {
        selectionMenu.popup(win);
      4}
    })

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (process.platform !== 'linux') {
        app.commandLine.appendSwitch('enable-transparent-visuals');
        app.commandLine.appendSwitch('disable-gpu');
    }
    if (win === null) {
        createWindow();
    }
});

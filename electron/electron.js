'use strict';

const electron = require('electron');
const { app } = electron;
const { BrowserWindow } = electron;

const { remote, Menu } = electron;

const path = require('path')

let win;
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1024,
        height: 600,
          webPreferences: {
            experimentalFeatures: true,
          },
          frame: false
    });


    var url = 'file://' + __dirname + '/../www/index.html';
    var Args = process.argv.slice();
    let port = '8100', address = 'localhost'
    let devMode = false;
    Args.forEach(function (val, i) {
      if (val === 'test') devMode = true;
      if(devMode){
        if (val === '-p' || val === '--port')  port = `${Args[i+1]}`
        if (val === '-h' || val === '--host') address =`${Args[i+1]}`
        url = `http://${address}:${port}`;
        console.log('Connected to: ', url)
      }
    });

    win.loadURL(url);

    win.setMenuBarVisibility(false)

    // const selectionMenu = Menu.buildFromTemplate([
    //   { role: 'copy' },
    //   { type: 'separator' },
    //   { role: 'selectall' },
    // ])

    // const inputMenu = Menu.buildFromTemplate([
    //   { role: 'undo' },
    //   { role: 'redo' },
    //   { type: 'separator' },
    //   { role: 'cut' },
    //   { role: 'copy' },
    //   { role: 'paste' },
    //   { type: 'separator' },
    //   { role: 'selectall' },
    // ])

    // window.webContents.on('context-menu', (e, props) => {
    //   const { selectionText, isEditable } = props;
    //   if (isEditable) {
    //     inputMenu.popup(window);
    //   } else if (selectionText && selectionText.trim() !== '') {
    //     selectionMenu.popup(window);
    //   4}
    // })

  //   win.webContents.openDevTools()


    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}


// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

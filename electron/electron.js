'use strict';
const electron = require('electron');
const {
    app } = electron;
const {
    BrowserWindow
} = electron;

const path = require('path')


//const {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} =  require('electron-spellchecker');

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
    Args.forEach(function (val, i) {
        if (val === 'test')
        if (val === '-p' || val === '--port')  port = `${Args[i+1]}`
        if (val === '-h' || val === '--host') address =`${Args[i+1]}`
        url = `http://${address}:${port}`;
    });
    console.log('Connected to: ', url)

    win.loadURL(url);

    win.setMenuBarVisibility(false)
    // win.webContents.openDevTools()

    // win.webContents.findInPage()

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
/**
	window.spellCheckHandler = new SpellCheckHandler();
	window.spellCheckHandler.attachToInput();

	// Start off as US English, America #1 (lol)
	window.spellCheckHandler.switchLanguage('en-US');

	let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
	let contextMenuListener = new ContextMenuListener((info) => {
	contextMenuBuilder.showPopupMenu(info);
	});
*/
    }
});

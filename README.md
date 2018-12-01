# Meaning
An entirely local and private markdown/note-taking app.
Uses Ionic 3 framework and electron. 

![Example](https://github.com/SyShock/Meaning/blob/master/output.gif?raw=true)

#### Features:
- Live-rendering
- ~~Spell-check~~
- Different edit modes: Edit only, Preview only
- Customizable theme, font color, font style, size
- ~~Optional typewritter sound-effect~~
- Optional line focusing
- Bookmarks (for folders)
- Supported platforms - Windows, MacOS, Linux, Android, iOS


### Keybinds:
- ctrl+b - side-menu
- ctrl+f - search in edit / search files(while side menu is opened)
- ctrl+s - save file
- ctrl+shift+s - save file as
- ctrl+o - open file
- github markdown hotkeys


##### Considering:
- D3 file visualization
- File encryption
- Cross-device synching with webRTC


#### To Do:
- [ ] spell-check
- [x] mobile view
- [x] fixed grid view in file explorer
- [ ] pdf export
- [ ] html export
- [x] find word in edit mode
- [x] multiple preview modes
- [ ] github markdown hotkeys
- [ ] typewritter sound-effect
- [x] add color-picker
- [ ] add more font styles
- [ ] add letter spacing
- [x] fix new lines being removed while saving
- [x] File tagging & search by tags
- [ ] app icon 
- [X] enable window dragging from the top part
- [ ] fix focus line breaking after copy-paste
- [ ] add help and cheatsheets: 
http://reu.dimacs.rutgers.edu/Symbols.pdf,
https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet


## Building from source
```
git clone https://github.com/syshock/meaning.git
cd meaning
npm install
ionic build --prod --release
npm run ebuild -- (-w for windows; -l for linux; -m for mac)
```

## Live development in electron
```
ionic serve --no-open
npm run electron -- test (optionally, -p <port>; -h <host address>)
```

## Live development for mobile
ADB daemon or the equivalent for Apple devices must be running.
Otherwise instead of `run`, use `emulate`.
```
ionic cordova plaform remove <platform - ios or android> //this is sometimes required
ionic cordova plaform add <platform - ios or android>
ionic cordova run <platform> --aot --livereload 
```
Then debug from `chrome://inspect` using chrome or electron

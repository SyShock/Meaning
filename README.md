# Meaning
An entirely local and private markdown/note-taking app.

Uses Ionic 3 framework and electron. 

#### Features:
- Live-rendering
- Spell-check
- Option for conditional rendering
- Different edit modes: Edit only, Preview only
- Customizable theme, font color, font style, size and letter spacing 
- Optional typewritter sound-effect
- Optional line focusing
- Bookmarks (for folders)
- Supported platforms - Windows, MacOS, Linux, Android, iOS
- Minimilistic UI


### Keybindings:
- ctrl+b - side-menu
- ctrl+f - search in edit / search files(while side menu is opened)
- ctrl+s - save file
- ctrl+shift+s - save file as
- ctrl+o - open file
- github markdown hotkeys


##### Considering:
- D3 file visualization
- File tagging & search by tags
- File entryption


#### To Do:
- [ ] spell-check
- [x] mobile view
- [ ] fixed grid view in file explorer
- [ ] tabbed settings
- [ ] pdf export
- [ ] html export
- [ ] find word in edit mode
- [ ] find file when side-tab is opened
- [x] multiple preview modes
- [ ] github markdown hotkeys
- [ ] optimize and clean up code
- [ ] typewritter sound-effect
- [ ] split edit view in different components
- [x] add color-picker
- [ ] add more font styles
- [ ] add letter spacing
- [?] fix bug with 'save as'
- [ ] add folder path for 'save as'
- [x] fix new lines being removed while saving
- [ ] backup file if app stops obruptly
- [ ] app icon 
- [ ] enable window dragging from the top part
- [ ] fade-out when on top 
- [ ] on window you cannot go back when selecting a bookmark
- [ ] expand and contract animations for the side-menu
- [ ] add help and cheatsheets: 
http://reu.dimacs.rutgers.edu/Symbols.pdf , https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet


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
ionic serve --nobrowser
npm run electron -- test (optionally, -p <port>; -h <host address>)
```

## Live development for mobile
ADB daemon or the equivalent for Apple devices must be running.
And the mobile device must be hooked up.
Otherwise instead of `run`, use `emulate`.
```
ionic cordova plaform remove <platform - ios or android> //this is sometimes required
ionic cordova plaform add <platform - ios or android>
ionic cordova run <platform> --aot --livereload 
```
Then debug from `chrome://inspect` using chrome or even electron

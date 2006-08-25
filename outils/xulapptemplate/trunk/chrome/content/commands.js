/*
 * commands.js
 * 
 *  Copyright 3Liz (C) 2006
 *  http://www.3liz.com/
 */

//-------------------------------
// Command handler
// Implements nsIController
//-------------------------------

function nsCommandTable() {
  this._table = new Object();
}

nsCommandTable.prototype = 
{
  registerCommand : function ( command , controller ) {
    this._table[command] = controller;
  },

  registerCommands : function ( commands ) {
    for(var y in commands )
        this._table[y] = commands[y];
  },

  getCommand : function ( command ) {
   if(command in this._table)
     return  this._table[command];
  },

  // nsIController interface

  supportsCommand : function( command ) {
    return (command in this._table)
  },
   
  isCommandEnabled: function( aCommand ) {
    if(aCommand in this._table)
       return this._table[aCommand].isCommandEnabled(aCommand);
  },

  doCommand: function (aCommand) {
    if(aCommand in this._table) 
      this._table[aCommand].doCommand(aCommand);
  }
};

//-------------------------------
// Register Commands
//-------------------------------
function gRegisterGlobalCommands()
{
  var commandTable      = gApplication.getCommandTable();
  var windowControllers = window.controllers;
  
  commandTable.registerCommand('cmd_Exit'          ,gExitCommand );
  commandTable.registerCommand('cmd_Open'          ,gOpenFileCommand);

  windowControllers.appendController(commandTable);
}
//-------------------------------
// Exit
//-------------------------------
var gExitCommand = {

  isCommandEnabled: function(aCommand) {
    return true;
  },

  doCommand : function(aCommand)
  {
    if(goCloseWindow()) 
       window.close();
  }
}; 

//-------------------------------
// 'Open' command
//-------------------------------
var gOpenFileCommand =
{
  isCommandEnabled: function(aCommand) { 
    return true;
  },

  getDirPref : function( prefs ) {
    var dir   = null;
    try {
      dir = prefs.getComplexValue(this._dirPref,Components.interfaces.nsILocalFile);
    } catch (e) {}
    return dir;  
  },
  
  setDirPref : function(prefs,val) {
    prefs.setComplexValue(this._dirPref,Components.interfaces.nsILocalFile,val);
  },

  openFile : function(title) 
  {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var prefs           = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefBranch);

    this._dirPref = "app.filepicker.workdir";

    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window,title, nsIFilePicker.modeOpen);  

    var dir = this.getDirPref(prefs);    
    
    if(dir && dir.exists())
       fp.displayDirectory = dir;
       
    var ret = fp.show();
    if( ret == nsIFilePicker.returnOK ) 
    {
      var results = [];    
      var nsILocalFile = Components.interfaces.nsILocalFile;

      var file = fp.file;
      var dir  = file.parent.QueryInterface(nsILocalFile);

      this.setDirPref(prefs,dir); 
      
      return file;         
    }
    
    return null;  
  },

  doCommand : function(aCommand) 
  {
    if(gApplication.saveModified())
    {
       var file = this.openFile(
                    gApplication.getString("application.openfile"));
       if(file)
          gApplication.openDocument(file.path);
    } 
    gApplication.updateCommands();
  }
};

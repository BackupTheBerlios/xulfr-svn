/*
 * main.js
 */

//===================================================
// gApplication
// The global application object
//===================================================

var gApplication = {

  _commandTable :null,
  _stringBundle :null,

  getCommandTable : function () 
  {
    if(this._commandTable==null) 
       this._commandTable = new nsCommandTable();

    return this._commandTable;
  },
  
  // Met ? jour l'IU
  updateCommands : function()
  {
    goUpdateCommandset(document.getElementById("globalCommandSet"));
  },

  getString : function( aString, argArray ) 
  {
    if(this._stringBundle==null) 
       this._stringBundle = document.getElementById("app:strings");

    if(argArray)
      return this._stringBundle.getFormattedString(aString,argArray);
    else 
      return this._stringBundle.getString(aString);
  },

  openDocument : function( path ) 
  {
    alert("Opening document \n"+path);
  },
  
  saveModified : function () { 
    return true; 
  }
};

//===================================================
// Main window Event handler
//===================================================

function goStartup()
{
 dump("*** application startup\n");
 
 gRegisterGlobalCommands(); 
 gApplication.updateCommands();

} 

function goShutdown()
{
 dump("*** application shutdown\n");
}


function goCloseWindow()
{
  dump("*** application closeWindow\n");
  return true;
}


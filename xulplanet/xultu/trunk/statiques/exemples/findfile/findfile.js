try {

var RDFC = '@mozilla.org/rdf/container;1';
RDFC = Components.classes[RDFC].createInstance();
RDFC = RDFC.QueryInterface(Components.interfaces.nsIRDFContainer);

var RDFCUtils = '@mozilla.org/rdf/container-utils;1';
RDFCUtils = Components.classes[RDFCUtils].getService();
RDFCUtils = RDFCUtils.QueryInterface(Components.interfaces.nsIRDFContainerUtils);

var RDF = '@mozilla.org/rdf/rdf-service;1'
RDF = Components.classes[RDF].getService();
RDF = RDF.QueryInterface(Components.interfaces.nsIRDFService);

} catch (ex){}

function doFind()
{
  var recentlist=document.getElementById("find-text");
  var fldval=recentlist.value;

  addSearchedItem(fldval);

  var meter=document.getElementById('progmeter');
  meter.setAttribute("style","display: inline;");
  var searchtext=document.getElementById('find-text').value;
  alert("Searching for \""+searchtext+"\"");
}


var dsource;

function initSearchList()
{
  var recentlist=document.getElementById("find-text");
  var sources=recentlist.database.GetDataSources();
  var rootnode=RDF.GetResource("urn:findfile:recent");
  
  while (sources.hasMoreElements()){
    try {
      dsource=sources.getNext();
      dsource=dsource.QueryInterface(Components.interfaces.nsIRDFDataSource);
  
      RDFC.Init(dsource,rootnode);
    } catch (e) {
      try {
        RDFCUtils.MakeSeq(dsource,rootnode);
        RDFC.Init(dsource,rootnode);
      } catch (e2){}
    }
  }
}

function addSearchedItem(txt)
{
  var newnode=RDF.GetResource("urn:findfile:recent:item"+(RDFC.GetCount()+1));
  var labelprop=RDF.GetResource("http://www.example.com/recent#Label");
  var newvalue=RDF.GetLiteral(txt);
  
  dsource.Assert(newnode,labelprop,newvalue,true);
  RDFC.InsertElementAt(newnode,1,true);
  
  dsource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource).Flush();
}


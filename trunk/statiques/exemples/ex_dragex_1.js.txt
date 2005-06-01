var listObserver = { 
  onDragStart: function (evt,transferData,action){
    var txt=evt.target.getAttribute("elem");
    transferData.data=new TransferData();
    transferData.data.addDataForFlavour("text/unicode",txt);
  }
};

var boardObserver = {
  getSupportedFlavours : function () {
    var flavours = new FlavourSet();
    flavours.appendFlavour("text/unicode");
    return flavours;
  },
  onDragOver: function (evt,flavour,session){},
  onDrop: function (evt,dropdata,session){
    if (dropdata.data!=""){
      var elem=document.createElement(dropdata.data);
      evt.target.appendChild(elem);
      elem.setAttribute("left",""+evt.pageX);
      elem.setAttribute("top",""+evt.pageY);
      elem.setAttribute("label",dropdata.data);
    }
  }
};


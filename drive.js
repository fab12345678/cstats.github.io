var CLIENT_ID = '178544013672-2v1icerbbmgb0njjbno8br1b2vnf9047.apps.googleusercontent.com';
var API_KEY = 'AIzaSyB1PWEi2McNiYAIrbLY5Sk8S5bk6s4x0jw';
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
//https://www.googleapis.com/auth/drive.metadata.readonly
var SCOPES = 'https://www.googleapis.com/auth/drive.file';
var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');


//Global variables
var IDs={
  folder:null,
  data:null,
  pic:null,
  name:null
}

var routes=[];
var friendRoutes=[];


// On load, called to load the auth2 library and API client library.
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}


function listFiles(params,callback) {
  //Calls the callback with all files that match the paramenters
  var files;
  gapi.client.drive.files.list(params).then(function(response) {
    files = response.result.files;
    console.log("found matching files",files)
    callback(files);
  });
}


/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  console.log("init client")
  document.getElementById("loadinfo").innerText="initializing client";
  document.getElementById("progressBar").style.width="15%";
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    console.log("loading statistics")
    document.getElementById("loadinfo").innerText="loading statistics";
    document.getElementById("progressBar").style.width="30%";
    document.getElementById("authorize_button").style.display = 'none';
    //check if folder already exist
    var params={
      pageSize: 100,
      q:"mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'nextPageToken, files(id, name)'
   }
    listFiles(params,handleFolder);
    //handleFolder gets called;
  } else {
    console.log("waiting for client to sign in");
    document.getElementById("loadinfo").innerText="Please Sign in";
    document.getElementById("progressBar").style.width="40%";
    document.getElementById("authorize_button").style.display="block";
    authorizeButton.style.display = 'block';
  }
}

 // Sign in the user upon button click.
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

 // Sign out the user upon button click.
 //  From Example, not used
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}


function handleFolder(f){
  var id=null;
  for(var i=0;i<f.length;i++){
    if(f[i].name=="cstats")id=f[i].id;
  }

  if(id!=null){
    loadFolder(id);
  }else{
    createStats();
  }
}

function loadFolder(id){
  //on first setup, programs enters here to load files
  console.log("found folder");
  document.getElementById("loadinfo").innerText="folder found";
  document.getElementById("progressBar").style.width="60%";
  IDs.folder=id;
      var params={
      pageSize: 100,
      q:`'${id}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name)'
   }
 listFiles(params,handleFiles);

}

function updateFile(id,content) {
  var contentBlob = new  Blob([content], {
    'type': 'text/plain'
  });
  updateFileContent(id, contentBlob, function(response) {
    console.log("file updated: ",response);
  });
}

function updateFileContent(id, contentBlob, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.onreadystatechange = function() {
    if (xhr.readyState != XMLHttpRequest.DONE) {
      return;
    }
    callback(xhr.response);
  };
  xhr.open('PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media');
  xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
  xhr.send(contentBlob);
}


function handleFiles(f){
//get all IDs
  for (var i=0;i<f.length;i++){
    if(f[i].name==="data.json")IDs.data=f[i].id;
    if(f[i].name==="name.txt")IDs.name=f[i].id;
    if(f[i].name.indexOf("profilepic")>=0)IDs.pic=f[i].id;
  }

  //data file
  if(IDs.data!=null){
    console.log("found file");
    document.getElementById("loadinfo").innerText="loading file";
    document.getElementById("progressBar").style.width="95%";
    readFile(IDs.data,resp=>{
        if(resp.result==undefined){
          console.log(resp);
          document.getElementById("loadinfo").innerText="invalid file";
        }else{
          console.log("file loaded");
          routes=resp.result;
          Array.from(document.getElementsByClassName("top_box")).forEach(e=>e.style.display="block");
          document.getElementById("loadinginfo").style.height=0;
          document.getElementById("loadinginfo").style.opacity=0;
          document.getElementById("loadinginfo").style.margin=0;
        }
        normalizeData();
        refreshRouteStats();
      });
  }else{
    createFile(IDs.folder,"data.json",JSON.stringify(routes),function(res){IDs.data=res;});
  }

  if(IDs.name==null){
    createFile(IDs.folder,"name.txt","Stranger",function(res){IDs.name=res;});
  }else{
   readName(IDs.name);
 }
  //user profile pic
  if(IDs.pic!=null){
    readPic(IDs.pic);
  }

}


function readFile(id,cb){
  var request = gapi.client.drive.files.get({
    fileId: id,
    alt: 'media'
  });
  request.execute(function(resp) {
    cb(resp);
  });
}

//read the user name, a file named name.txt needs to exist in the cstats foler
function readName(id){
 var request = gapi.client.drive.files.get({
    fileId: id,
    alt: 'media'
  });
  request.then(function(raw) {
  setName(raw.body);
  });
}

//read the picture
function readPic(id){
  setPic("https://docs.google.com/uc?id="+id);
}

//for new users, set everything up
function createStats(){
  console.log("creating folder")
var fileMetadata = {
  'name' : 'cstats',
  'mimeType' : 'application/vnd.google-apps.folder',
};
gapi.client.drive.files.create({
  resource: fileMetadata,
}).then(function(response) {
  switch(response.status){
    case 200:
      var folder = response.result;
      console.log('Created Folder Id: ', folder.id);
      createFile(folder.id,"data.json","[]",function(){
        console.log("init normally")
        //then init normally
        loadFolder(folder.id);
      });
      break;
    default:
      console.log('Error creating the folder, '+response);
      break;
    }
});
}

//create a file
function createFile(parentId,name,content,cb){
  console.log("creating file")
  //Creates a file in the Folder with the parent id
var fileContent = content;
var file = new Blob([fileContent], {type: 'text/plain'});

var metadata = {
    'name': name, // Filename at Google Drive
    'mimeType': 'text/plain', // mimeType at Google Drive
    'parents': [parentId], // Folder ID at Google Drive
};

var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
var form = new FormData();
form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
form.append('file', file);

var xhr = new XMLHttpRequest();
xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
xhr.responseType = 'json';
xhr.onload = () => {
    console.log("Created File",xhr.response.id); // Retrieve uploaded file ID.
    cb(xhr.response.id);
};
xhr.send(form);
}


//function to load a new Data.json file
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    // files is a FileList of File objects. List some properties.
    var reader=new FileReader();
    reader.onload=function(){
      routes=JSON.parse(reader.result);
      addRoute();
    };
    reader.readAsText(files[0]);
}
document.getElementById('fileSelector').addEventListener('change', handleFileSelect, false);



//function to load a new Data.json file
function handlePicSelect(evt) {
    document.getElementById("pictureChangeButton").innerText="Uploading";
    var files = evt.target.files; // FileList object
    // files is a FileList of File objects. List some properties.
    var reader=new FileReader();
    reader.onload=function(){
      var image_location = reader.result;

      deleteFile(IDs.pic);
      //_-----Copied From https://stackoverflow.com/questions/33842963/how-to-upload-an-image-from-an-url-to-google-drive
      var request22 = new XMLHttpRequest();
      request22.open('GET', image_location, true);
      request22.responseType = 'blob';
      request22.onload = function() {
          var fileData = request22.response;
          const boundary = '-------314159265358979323846';
          const delimiter = "\r\n--" + boundary + "\r\n";
          const close_delim = "\r\n--" + boundary + "--";
          var reader = new FileReader();
          reader.readAsDataURL(fileData);
          reader.onload =  function(e){
              var contentType = fileData.type || 'application/octet-stream';
              var fileName="profilepic."+image_location.match(/data:image[/](\w+);/)[1];

              var metadata = {
                  'name': fileName,
                  'mimeType': contentType,
                  'parents':[IDs.folder]
              };
              var data = reader.result;

              var multipartRequestBody =
                  delimiter +  'Content-Type: application/json\r\n\r\n' +
                  JSON.stringify(metadata) +
                  delimiter +
                  'Content-Type: ' + contentType + '\r\n';

              //Transfer images as base64 string.
              if (contentType.indexOf('image/') === 0) {
                  var pos = data.indexOf('base64,');
                  multipartRequestBody += 'Content-Transfer-Encoding: base64\r\n' + '\r\n' +
                      data.slice(pos < 0 ? 0 : (pos + 'base64,'.length));
              } else {
                  multipartRequestBody +=  + '\r\n' + data;
              }
              multipartRequestBody += close_delim;

              var request = gapi.client.request({
                  'path': '/upload/drive/v3/files',
                  'method': 'POST',
                  'params': {'uploadType': 'multipart'},
                  'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                  },
                  'body': multipartRequestBody
              });

              request.execute(function(file){
                  if(file.id){
                    document.getElementById("pictureChangeButton").innerText="Done";
                      console.log("picture updated",JSON.stringify(file))
                  }
              });

          };
      };
      request22.send();

    setPic(reader.result);

    };
    reader.readAsDataURL(files[0]);
    //make quadratic
    //upload to Chrome
}
document.getElementById('picSelector').addEventListener('change', handlePicSelect, false);

function deleteFile(fileId) {
  if(fileId!=undefined){
    var request = gapi.client.drive.files.delete({
      'fileId': fileId
    });
    request.execute(function(resp) { });
  }
}

function openChangeNameBox(){
  var newName=window.prompt("Enter new name")
  if(newName==null||newName==""){

  }else{
    updateFile(IDs.name,newName);
    setName(newName)
  }
}



//function to post a new route to the data
function addRoute(r){
  if(r!=undefined)routes.push(r);
  updateFile(IDs.data,JSON.stringify(routes));
  refreshRouteStats();
}



//updates the routes feed
function showRoutes(routes,page,label,num){
  var feed;
  if(page=="history"){
    feed=document.getElementsByClassName("feed")[0].getElementsByTagName("UL")[0];
  }else if(page=="sport"){
    feed=document.getElementsByClassName("feed")[1].getElementsByTagName("UL")[0];
  }else if(page=="boulder"){
    feed=document.getElementsByClassName("feed")[2].getElementsByTagName("UL")[0];
  }


  routes=routes.reverse();

  feed.innerHTML="";
    var template = document.getElementById("template_route");
    var template_label=document.getElementById("template_grade_p");
    var template_more_button=document.getElementById("template_more_button");
    var currentgrade="0";


    for(var i=0;i<num&&i<routes.length;i++){
      //place the new grade paragragh
      if(label&&routes[i].grade!=currentgrade){
        var clon2=template_label.content.cloneNode(true);
        currentgrade=routes[i].grade;
        clon2.getElementById("grade").innerText=currentgrade;
        clon2.getElementById("num").innerText=count(routes,currentgrade);
        clon2.class="route_grade_p";
        feed.appendChild(clon2);
      }

      //place the route_min field
      var clon = template.content.cloneNode(true);
      var color=getColor(routes[i].style);

      clon.getElementById("id").innerText=routes[i].id;
      clon.getElementById("name").innerText=routes[i].name;
      clon.getElementById("grade").innerText=routes[i].grade;
      clon.getElementById("grade").style.border="2px solid"+color;
      clon.getElementById("date").innerText=routes[i].date;
      feed.appendChild(clon);

      //count the number of ascents made with a specific grade
      function count(routes,grade){
        var count=0;
        for (var i=0;i<routes.length;i++){
          if(routes[i].grade==grade){
            count++;
          }
        }
        return count;
      }
    }
    if(num<routes.length){
      var clon3=template_more_button.content.cloneNode(true);
      clon3.getElementById("hiddenNum").innerText=num;
      clon3.getElementById("hiddenScreen").innerText=page;
      feed.appendChild(clon3);
    }

}
function showMoreRoutes(elem){
  var num=parseInt(getChildByID(elem,"hiddenNum").innerText)*2;
  var page=getChildByID(elem,"hiddenScreen").innerText;
  refreshRouteStats(page,num)
}

//set the user name
function setName(yourname){
  var randomHellomsgs=["Welcome","Hi","Hello","Welcome back"];
  document.getElementById("yourname").innerText=randomHellomsgs[Math.floor(Math.random()*randomHellomsgs.length)]+" "+yourname;
  document.getElementById("yourname").setAttribute("n",yourname);
}

//set the profile pic
function setPic(path){
  document.getElementsByClassName("profilepic")[0].src=path;

}

//sort an array by a specific parameter
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

//helper function
function getChildByID(elem,id){
  if(elem!=undefined){
   for (var i=0;i<elem.childNodes.length;i++){
     if(elem.childNodes[i].id==id)return elem.childNodes[i];
   }
}
  console.log("not found: "+id)
}

//helper function
function getChildByClass(elem,cl){
  for (var i=0;i<elem.childNodes.length;i++){
    if(elem.childNodes[i].className==cl)return elem.childNodes[i];
  }
  console.log("not found")
}

//opens the detail screen when clicking on a .route_min li
function fold_unfold_route(elem){
  var id=getChildByID(elem,"id").innerText;
  var route=routes.find(e=>e.id==id);
    if(route==undefined)return;

    var a= getChildByID(elem,"stars").style.display;
  if( a==""||a=="none" ){ //bad
      //UNFOLD
      elem.style.height="200px";
      var grade=getChildByID(elem,"grade")
      var stars=getChildByID(elem,"stars");
      var area=getChildByID(elem,"area");
      var notes=getChildByID(elem,"notes");
      var attempts=getChildByID(elem,"attempts");
      var pic=getChildByID(elem, "edit_img");
      stars.style.display="block";
      area.style.display="block";
      notes.style.display="block";
      attempts.style.display="block";
      stars.src="pics/stars"+route.stars+".png";
      area.innerText=route.area;
      notes.innerText=route.notes;
      attempts.innerText=getStyleInfo(route.style,route.attempts);
      pic.style.display="block";

      grade.style.left="2%";
    	grade.style.top="25%";
    	grade.style.width="70px";
    	grade.style.lineHeight="70px";
    	grade.style.height="70px";
    }else{
      //FOLD
      elem.style.height="50px";
      getChildByID(elem,"stars").style.display="none";
      getChildByID(elem,"area").style.display="none";
      getChildByID(elem,"notes").style.display="none";
      getChildByID(elem,"attempts").style.display="none";
      getChildByID(elem,"edit_img").style.display="none";

      var grade=getChildByID(elem,"grade")

      grade.style.top="10%";
      grade.style.left="60%";
      grade.style.width="40px";
      grade.style.lineHeight="40px";
      grade.style.height="40px";
    }
}

function getStyleInfo(style,attempts){
  var routeInfoP="";
  if(style=="redpoint" &&!(!attempts||attempts==""||attempts=="")){
    var ending="";
    if(attempts[attempts.length-1]=="1")ending="st go";
    else if(attempts[attempts.length-1]=="2")ending="nd go";
    else if(attempts[attempts.length-1]=="3")ending="rd go";
    else ending="th go"
    routeInfoP=attempts+ending;
  }else{
    routeInfoP=style;
  }
  return routeInfoP;
}


//edits a route opened -> redirect user to add_screen
function editRoute(elem){
  var id=getChildByID(elem.parentNode,"id").innerText;
  var route=routes.find(e=>e.id==id);
  showAdd(route,true)
};




function refreshRouteStats(page,num){
  if(page==undefined){
    //show all, first setup
    refreshRouteStats("history",30);
    //total count
   document.getElementById("totalascents").innerText=routes.length;
  //sport, only sport routes, sorted by grade
    refreshRouteStats("sport",30);
  //bouldering, only boulders, sorted by grade;
    refreshRouteStats("boulder",30);
  }else{
    switch(page){
      case "history":
      var rr=getRoutesByDate();
      showRoutes(rr,page,false,num);
      break;
      case "sport":
      var rr=getSportRoutes();
      showRoutes(rr,page,true,num)
      showDiagram(rr,"sportclimbingcanvas");
      //profile screen informations
      document.getElementById("bestsportroute").innerText=rr[0]==undefined?"-":rr[0].grade;
      var r=rr.filter(e=>e.style=="flash");
      document.getElementById("bestFlashSport").innerText=r[0]==undefined?"-":r[0].grade;
      var r=rr.filter(e=>e.style=="onsight");
      document.getElementById("bestOnsightSport").innerText=r[0]==undefined?"-":r[0].grade;
      document.getElementById("totalAscentsSports").innerText=rr.length;
      document.getElementById("avrGradeSport").innerText=getAverage(rr);

      break;
      case "boulder":
      var rr=getBoulders();
      showRoutes(rr,page,true,num)
      showDiagram(rr,"boulderingcanvas");
      //profile screen informations
      document.getElementById("bestboulder").innerText=rr[0]==undefined?"-":rr[0].grade;
      var r=rr.filter(e=>e.style=="flash");
      document.getElementById("bestFlashBoulder").innerText=r[0]==undefined?"-":r[0].grade;
      var r=rr.filter(e=>e.style=="onsight");
      document.getElementById("bestOnsightBoulder").innerText=r[0]==undefined?"-":r[0].grade;
      document.getElementById("totalAscentsBoulder").innerText=rr.length;
      document.getElementById("avrGradeBoulder").innerText=getAverage(rr);

      break;
      break;
    }
  }
}


function getSportRoutes(){
  return getRoutesByDate().filter(r=>r.type=="sport").sort(dynamicSort("grade"));
}

function getRoutesByDate(){
  return routes.sort(dynamicSort("grade")).sort((a,b)=>{
  a = a.date.split('.').reverse().join('');
  b = b.date.split('.').reverse().join('');
  if (a < b) {
      return -1;
  } else if (a > b) {
      return 1;
  } else {
      return 0;
  }
});
}

function getBoulders(){
  return getRoutesByDate().filter(r=>r.type=="boulder").sort(dynamicSort("grade"));

}



function opensearchfield(e){
  if(e.src.endsWith("lupe.png")){
   //open search field
    document.getElementById("searchfield").style.display="inline-flex";

    document.getElementById("searchResultsNum").style.display="inline-flex";
    document.getElementById("recentAscentsTitle").style.display="none";
    e.src="pics/close.png";
    document.getElementsByClassName("top_box")[0].style.height="0";
    document.getElementsByClassName("top_box")[0].style.opacity="0";

    document.getElementById("searchfield").focus();
  }else{
    //close search field
    document.getElementById("searchfield").style.display="none";
    document.getElementById("searchfield").value="";
    document.getElementById("searchResultsNum").style.display="none";
    document.getElementById("recentAscentsTitle").style.display="inline-flex";
    document.getElementsByClassName("top_box")[0].style.height="32vh";
    document.getElementsByClassName("top_box")[0].style.opacity="1";

    e.src="pics/lupe.png";
    refreshRouteStats();//way too much
  }
}

document.getElementById("searchfield").addEventListener("keyup",e=>{
  var results;
  if(e.target.value==""){
    results=routes.sort((a,b)=>{
    a = a.date.split('.').reverse().join('');
    b = b.date.split('.').reverse().join('');
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
  });
  }else{
  results=(routes.filter(r=>r.name.toLowerCase().indexOf(e.target.value.toLowerCase())>=0));
  results=results.concat(routes.filter(r=>r.area.toLowerCase().indexOf(e.target.value.toLowerCase())>=0));
  results=results.concat(routes.filter(r=>r.notes.toLowerCase().indexOf(e.target.value.toLowerCase())>=0));
  if(e.target.value>1900&&e.target.value<=new Date().getFullYear())results=results.concat(routes.filter(r=>r.date.indexOf(e.target.value)>=0));
  if(e.target.value<=5)results=results.concat(routes.filter(r=>r.stars==e.target.value));
}
  document.getElementById("searchResultsNum").value=results.length;
  showRoutes(results,"history",false, results.length);
});

//returns the color for the circle
function getColor(str){
  switch(str){
    case "redpoint":return "#ea6161";
    case "flash":return "#e3ca71";
    case "onsight":return "#3f4b60";
  }
}


function normalizeData(){
  //function to change the database

}


//Average Grade function

function getAverage(routesArr){
  var sum=0;
  var sumG=0;
  for(var i=0;i<routesArr.length;i++){
    var index=climbinggrades.indexOf(routesArr[i].grade);
    if(index>=0){
      sumG+=index;
      sum++;
    }
  }
  return climbinggrades[Math.ceil(sumG/sum)];
}
//create forfriends file

function createForFriends(){
//creates Minimalistic information file for fiends
  var obj={
    name:"no name",
    last20:[],
    best50sport:[],
    best50boulder:[]
  };
  obj.name=document.getElementById("yourname").getAttribute("n");
  obj.last20=routes.sort((a,b)=>{
    a = a.date.split('.').reverse().join('');
    b = b.date.split('.').reverse().join('');
    if (a < b) {
        return 1;
    } else if (a > b) {
        return -1;
    } else {
        return 0;
    }
  }).slice(0,20);
  obj.best50sport=routes.filter(r=>r.type=="sport").sort(dynamicSort("grade")).reverse().slice(0,50);
  obj.best50boulder=routes.filter(r=>r.type=="boulder").sort(dynamicSort("grade")).reverse().slice(0,50);
  return obj;
}

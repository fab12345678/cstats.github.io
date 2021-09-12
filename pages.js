var historyActive=false;
var boulderingActive=false;
var sportActive=false;
var addActive=false;
var profileActive=true;

var grey="#928b8b";
var blue="#3f4b60";
var red="#ea6161";
var green="#74c77e";
var yellow="#e3ca71";

var climbinggrades=["3a","3a+","3b","3b+","3c","3c+",
					"4a","4a+","4b","4b+","4c","4c+",
					"5a","5a+","5b","5b+","5c","5c+",
					"6a","6a+","6b","6b+","6c","6c+",
					"7a","7a+","7b","7b+","7c","7c+",
					"8a","8a+","8b","8b+","8c","8c+",
					"9a","9a+","9b","9b+","9c","9c+",
					"10a","10a+","10b","10b+","10c","10c+",
					]


//global new Route, for add screen
newRoute=new Route();
newRoute.id=undefined;
newRoute.name="";
newRoute.grade="";
newRoute.style="redpoint"; //"redpoint", "flash" , "onsight"
newRoute.stars=3;
newRoute.attempts="";
newRoute.date=getDate();
newRoute.area="";
newRoute.notes="";





function switchToHistory(scroll){
  if(!historyActive){
    historyActive=true;
    leaveSportClimbing();
    leaveBouldering();
		leaveProfile();
    document.getElementsByClassName("nav_pics")[1].src="pics/history_colored.png";
    if(!scroll)document.getElementById("scrollcontainer").scrollLeft=1*(document.body.clientWidth|window.innerWidth);
  }
	closeAdd();
}

function switchToBouldering(scroll){
	if(!boulderingActive){
		boulderingActive=true;
		leaveSportClimbing();
		leaveProfile();
		leaveHistory();
		document.getElementsByClassName("nav_pics")[3].src="pics/bouldering_colored.png";
		if(!scroll)document.getElementById("scrollcontainer").scrollLeft=3*(document.body.clientWidth|window.innerWidth);
	}
	closeAdd();
}

function leaveHistory(){
	document.getElementsByClassName("nav_pics")[1].src="pics/history.png";
	historyActive=false;
}



function leaveBouldering(){
  document.getElementsByClassName("nav_pics")[3].src="pics/bouldering.png";
  boulderingActive=false;
}

function switchToSportClimbing(scroll){
	if(!sportActive){
		sportActive=true;
		leaveBouldering();
		leaveProfile();
		leaveHistory();

		document.getElementsByClassName("nav_pics")[2].src="pics/sportclimbing_colored.png";
		if(!scroll)document.getElementById("scrollcontainer").scrollLeft=2*(document.body.clientWidth|window.innerWidth);
	}
	closeAdd();

}

function leaveSportClimbing(){
  document.getElementsByClassName("nav_pics")[2].src="pics/sportclimbing.png";
  sportActive=false;
}

function switchtoProfile(scroll){
	profileActive=true;
	leaveSportClimbing();
	leaveBouldering();
	leaveHistory();
	document.getElementsByClassName("nav_pics")[0].src="pics/profile_colored.png";

	if(!scroll)document.getElementById("scrollcontainer").scrollLeft=0*(document.body.clientWidth|window.innerWidth);
	closeAdd();
}

function leaveProfile(scroll){
	document.getElementsByClassName("nav_pics")[0].src="pics/profile.png";
	profileActive=false;
}


//Scroll Event Horizontal
document.getElementById("scrollcontainer").addEventListener("scroll",(e)=>{
  var i=document.getElementById("scrollcontainer").scrollLeft/(document.body.clientWidth|window.innerWidth);
  var tol=.1;

  if(i>3-tol&&i<3+tol){
		switchToBouldering(true);
  }else if(i>2-tol&&i<2+tol){
		switchToSportClimbing(true);
  }else if(i>1-tol&&i<1+tol){
		switchToHistory(true);
  }else if(i>-tol&&i<+tol){
		switchtoProfile(true);
  }

  var bottomline=document.getElementById("bottomline");
  bottomline.style.left=20*i+"%";
  var a, b, ii;
  switch(Math.floor(i)){
		case 0:    a=blue;    b=grey;    ii=i;    break;
    case 1:    a=grey;    b=red;    ii=i-1;    break;
    case 2:    a=red;    b=green;    ii=i-2;    break;
    case 3:    a=green;    b=green;    ii=i-3;    break;
  }
  bottomline.style.backgroundColor=lerpColor(a,b,ii);
});


function lerpColor(a, b, amount) {
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}


function openAdd(){
	//If add is already open, use it as save button
	if(document.getElementById("addPopUp").style.display=="block"){
		save();
	}else{
		newRoute=Object.assign({},newRoute);
		newRoute.id=1|1+Math.max.apply(Math, routes.map(function (o){return o.id==undefined?0:o.id}));
		newRoute.name="";
		newRoute.grade="";
		newRoute.attempts="";
		newRoute.date=getDate();
		newRoute.notes="";
		showAdd(newRoute, false);
		history.pushState({"unused_obj":0},"notitle","");
	}
}

function changeAddButtonStyle(style){
	if(style=="normal"){
		var addButton=document.getElementById("newAscent");
		addButton.style.height="100%";
		addButton.style.borderRadius="0";
		getChildByID(addButton, "pic").src="pics/plus.png";
	}else{
		var addButton=document.getElementById("newAscent");
		addButton.style.height="150%";
		addButton.style.borderRadius="10px 0 0 0";
		getChildByID(addButton, "pic").src="pics/save.png";
	}
}

window.onpopstate=function(event){
closeAdd();
}

function showAdd(route, edit){
	var addPopUp=document.getElementById("addPopUp");
	addPopUp.style.display="block";
	addPopUp.scrollTop=0;
	changeAddButtonStyle("save");

	if(edit){
		getChildByID(getChildByID(addPopUp,"step0"),"plus-edit-pic").src="pics/stift_white.png";
		getChildByID(getChildByID(addPopUp,"step0"),"title").innerText="Edit Ascent"
		getChildByID(getChildByID(addPopUp,"step0"),"deletePic").style.display="block";

	}else{
		getChildByID(getChildByID(addPopUp,"step0"),"plus-edit-pic").src="pics/plus.png";
		getChildByID(getChildByID(addPopUp,"step0"),"title").innerText="New Ascent"
		getChildByID(getChildByID(addPopUp,"step0"),"deletePic").style.display="none";
	}


		newRoute=route;

		//fill in the information
		document.getElementById("add_name").value=route.name;
		setGrade(document.getElementById("add_grade"),route.grade==""?getAverage(routes):route.grade);
		document.getElementById("add_attempts").value=route.attempts;
		document.getElementById("add_date").value=route.date;
		document.getElementById("add_area").value=route.area;
		document.getElementById("add_notes").value=route.notes;

		document.getElementById("innerBox_rp").style.display="none";
		document.getElementById("innerBox_rp").style.display="none";
		document.getElementById("innerBox_rp").style.display="none";
		changeSaveColor(route.style);
		switch(route.style){
			case "redpoint":
			document.getElementById("innerBox_rp").style.display="block";
			break;
			case "onsight":
			document.getElementById("innerBox_os").style.display="block";
			break;
			case "flash":
			document.getElementById("innerBox_f").style.display="block";
			break;
		}
		switch (route.type){
			case "sport":
			document.getElementById("add_type_pic_boulder").style.opacity=.4;
			document.getElementById("add_type_pic_sport").style.opacity=1;
			break;
			case "boulder":
				document.getElementById("add_type_pic_boulder").style.opacity=1;
				document.getElementById("add_type_pic_sport").style.opacity=.4;
			break;
		}
}

//Add Wizard Actions
function next(){
	showAdd(step+1);
	switch (step){
		case 1: //Type
		var d=document.getElementById("add_name");
		d.value="";
		d.focus();
		break;
		case 2: //name
		newRoute.name=document.getElementById("add_name").value;
		var d=document.getElementById("add_grade");
		d.value="";
		d.focus();
		break;
		case 3: //grade
		newRoute.grade=document.getElementById("add_grade").value;
		var d=document.getElementById("add_attempts");
		d.value="";
		d.focus();
		break;
		case 4: //attempts
		newRoute.attempts=document.getElementById("add_attempts").value;
		var d=document.getElementById("add_date");
		d.value=getDate();
		d.focus();
		break;
		case 5: //date
		newRoute.date=document.getElementById("add_date").value;
		break;
		case 6: //stars

		document.getElementById("add_area").focus();
		if(newRoute.stars==undefined)newRoute.stars=3;
		break;
		case 7: //area
		newRoute.area=document.getElementById("add_area").value;
		var d=document.getElementById("add_notes");
		d.focus();
		d.value="";
		break;
		case 8: //notes
		newRoute.notes=document.getElementById("add_notes").value;
		addRoute(newRoute);
		closeAdd();

		break;
		case 9: //congratulations
		break;
	}
	step++;
}
function previous(){
	step--;
	showAdd(step);
}

function cancel(){
	closeAdd();
}

function delAscent(){
	deleteRoute(newRoute.id);
	addRoute();
	closeAdd();
}

function deleteRoute(id){
	var todeleteindex=-1;
	for(var i=0;i<routes.length;i++){
		if(routes[i].id==id)todeleteindex=i;
	}
	if(todeleteindex>=0){
		routes.splice(todeleteindex,1);
	}
}


function save(){
	//edited a route, delete the old one
	deleteRoute(newRoute.id);
	newRoute.name=document.getElementById("add_name").value;
	newRoute.grade=getGrade(document.getElementById("add_grade"));
	newRoute.attempts=document.getElementById("add_attempts").value;
	newRoute.date=document.getElementById("add_date").value;
	newRoute.area=document.getElementById("add_area").value;
	newRoute.notes=document.getElementById("add_notes").value;
	addRoute(newRoute);
	closeAdd();
}

function closeAdd(){
	document.getElementById("addPopUp").style.display="none";
	changeAddButtonStyle("normal");

}

function changeSaveColor(style){
	var color;
	switch(style){
		case "redpoint":color=red;break;
		case "flash":color=yellow;break;
		case "onsight":color=blue;break;
	}

	document.getElementsByClassName("circle")[0].style.borderColor=color;
	document.getElementById("newAscent").style.backgroundColor=color;
	document.getElementById("newAscent").style.backgroundColor=color;
	document.getElementById("step0").style.borderColor=color;
	getChildByID(document.getElementById("step0"),"plus-edit-pic").style.backgroundColor=color;
}

function changeStyle(elem){
	style=elem.getAttribute("v");
	changeSaveColor(style);
	Array.from(document.getElementsByClassName("inner_customradio")).forEach(e=>e.style.display="none")
	switch(style){
		case "redpoint":
		document.getElementById("innerBox_rp").style.display="block";
		if(document.getElementById("add_attempts").value==1)document.getElementById("add_attempts").value=2;
		break;
		case "onsight":
		document.getElementById("innerBox_os").style.display="block";
		document.getElementById("add_attempts").value=1;
		break;
		case "flash":
		document.getElementById("innerBox_f").style.display="block";
		document.getElementById("add_attempts").value=1;
		break;
	}
	newRoute.style=style;
}

function step4_radio_change(elem){
	//check if its a number
	if(elem.value.match(/^-{0,1}\d+$/)){
	if(elem.value=="1")changeStyle({getAttribute:function(v){return "onsight"}});
	else changeStyle({getAttribute:function(v){return "redpoint"}});
	}

}

function step6_hoverStars(event, elem){
	var s=Math.floor(-.5+5*event.clientX/elem.width);
	newRoute.stars=s;
	elem.src="pics/stars"+s+".png";
}


function changeType(elem){
	type=elem.getAttribute("v");
	newRoute.type=type;
	switch (type){
		case "sport":
		document.getElementById("add_type_pic_boulder").style.opacity=.4;
		document.getElementById("add_type_pic_sport").style.opacity=1;
		break;
		case "boulder":
			document.getElementById("add_type_pic_boulder").style.opacity=1;
			document.getElementById("add_type_pic_sport").style.opacity=.4;
		break;
	}
}


function setType(elem){
}

//event listeners - for changing between inputs with enter
document.getElementById("add_name").addEventListener("keyup",e=>{
if (event.keyCode==13) {
	next();
}});
document.getElementById("add_grade").addEventListener("keyup",e=>{
if (event.keyCode==13) {
	next();
}});
document.getElementById("add_attempts").addEventListener("keyup",e=>{
if (event.keyCode==13) {
	next();
}});

document.getElementById("add_date").addEventListener("keyup",e=>{
if (event.keyCode==13) {
	next();
}});
document.getElementById("add_area").addEventListener("keyup",e=>{
if (event.keyCode==13) {
	next();
}});
document.getElementById("add_notes").addEventListener("keyup",e=>{
if (event.keyCode==13) {
	next();
}});





//DATE FORMAT: NOTE: support different ones
function isValidDate(date){
	var nums;
	if(date.indexOf(".")>=0)nums=date.split(".");
	if(date.indexOf("/")>=0)nums=date.split("/");
	if(nums.length<3)return false;
	if(new Date(nums[1]+"."+nums[0]+"."+nums[2])=="Invalid Date")return false;
	return true;
}

//get todays Date
function getDate(){
	var d=new Date();
	var day=d.getDate();
	var month=1+d.getMonth();
	var year=d.getFullYear();
	return(day>9?"":"0")+day+"."+(month>9?"":"0")+month+"."+year;
}


//get the current Grade selected in gradeSlider
function getGrade(gradeSlider){
	if(gradeSlider.scrollLeft==0)return "";
	return climbinggrades[Math.round(gradeSlider.scrollLeft*5/gradeSlider.offsetWidth-1)];
}

//set the current Grade on gradeSlider
function setGrade(gradeSlider, grade){
	var pos=climbinggrades.indexOf(grade);
	gradeSlider.scrollLeft=(gradeSlider.offsetWidth/5)*(pos+1);
}

//gets called when a element of the gradeSlider is clicked
function changeGrade(elem){
	setGrade(document.getElementById("add_grade"),elem.innerText);
}

/*
var color_f="#e3ca71"; //gelb
var color_os="#3f4b60"; //blau
var color_rp="#ea6161"; //rot
*/
//calculate everything
function showDiagram(routes,canvasName){
	if(routes.length<5)return;
var canvasArray=Array.from(document.getElementsByClassName(canvasName));
//count the number of routes
var gc=new Array(climbinggrades.length).fill(0);
var gc_rp=new Array(climbinggrades.length).fill(0);
var gc_f=new Array(climbinggrades.length).fill(0);
var gc_os=new Array(climbinggrades.length).fill(0);

for(var i=0;i<routes.length;i++){
	switch(routes[i].style){
		case "redpoint":
		gc_rp[climbinggrades.indexOf(routes[i].grade)]+=1;
		break;
		case "flash":
		gc_f[climbinggrades.indexOf(routes[i].grade)]+=1;
		break;
		case "onsight":
		gc_os[climbinggrades.indexOf(routes[i].grade)]+=1;
		break;
	}
	if(routes[i].style!=undefined&&routes[i].style!="0"){
		gc[climbinggrades.indexOf(routes[i].grade)]+=1;
	}
}
var max=Math.max(...gc);
var highestnonzero=gc.length;
for (var i=gc.length-1;i>=0;i--){
	if(gc[i]>0){
		highestnonzero=i;
		break;
	}
}
highestnonzero++;
if(climbinggrades[highestnonzero].indexOf("+")>=0)highestnonzero++;
//round the maxgrade
var hnz=highestnonzero;

//change the scale
var ulchildren=document.getElementsByClassName("gradescale")[canvasName=="sportclimbingcanvas"?0:1].childNodes; //ugly!!!!!!!!!!!!!!!!!!!!
for(var i=ulchildren.length-1;i>=0;i--){
	if(ulchildren[i].tagName=="LI"){
		ulchildren[i].innerText=climbinggrades[hnz];
		hnz-=2;
	}
}

var num_middle_points=20;
var points_rp=[];
points_rp.push([1,0])
for (var i=0;i<16;i++){
	points_rp.push([1-(i+1)/16,gc_rp[highestnonzero-i]/max])
}
points_rp.reverse();
points_rp=calcMiddlepoints(points_rp,num_middle_points);
points_rp.unshift([0,0]);

var points_f=[];
points_f.push([1,0])
for (var i=0;i<16;i++){
	points_f.push([1-(i+1)/16,(gc_rp[highestnonzero-i]+gc_f[highestnonzero-i])/max])
}
points_f.reverse();
points_f=calcMiddlepoints(points_f,num_middle_points);
points_f.unshift([0,0]);

var points_os=[];
points_os.push([1,0])
for (var i=0;i<16;i++){
	points_os.push([1-(i+1)/16,(gc_rp[highestnonzero-i]+gc_f[highestnonzero-i]+gc_os[highestnonzero-i])/max])
}
points_os.reverse();
points_os=calcMiddlepoints(points_os,num_middle_points);
points_os.unshift([0,0]);


//drawing of surfaces and lines
canvasArray.forEach(canvas=>{
	var ctx=canvas.getContext("2d");
	ctx.fillStyle='#ededed';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	var cw=canvas.width;
	var ch=canvas.height-20;
	var l=points_rp.length;

	ctx.globalAlpha = 0.4;
	//onsight routes
	ctx.beginPath();
	ctx.moveTo(points_os[0][0]*cw,10+(1-points_os[0][1])*ch);
	for(var i=1;i<l;i++){
		ctx.lineTo(points_os[i][0]*cw,10+(1-points_os[i][1])*ch);
	}
	for(var i=l-1;i>=0;i--){
		ctx.lineTo(points_f[i][0]*cw,10+(1-points_f[i][1])*ch);
	}
	ctx.fillStyle="#3f4b60";
	ctx.fill();

	//flash routes
	ctx.beginPath();
	ctx.moveTo(points_f[0][0]*cw,10+(1-points_f[0][1])*ch);
	for(var i=1;i<l;i++){
		ctx.lineTo(points_f[i][0]*cw,10+(1-points_f[i][1])*ch);
	}
	for(var i=l-1;i>=0;i--){
		ctx.lineTo(points_rp[i][0]*cw,10+(1-points_rp[i][1])*ch);
	}
	ctx.fillStyle="#e3ca71";
	ctx.fill();

	//redpoint routes
	ctx.beginPath();
	ctx.moveTo(points_rp[0][0]*cw,10+(1-points_rp[0][1])*ch);
	for(var i=1;i<l;i++){
	ctx.lineTo(points_rp[i][0]*cw,10+(1-points_rp[i][1])*ch);
	}
	ctx.fillStyle="#ea6161";
	ctx.fill();



	//lines
	ctx.globalAlpha=1;
	ctx.strokeWeight=2;
	ctx.strokeStyle="#3f4b60";
	ctx.beginPath();
	ctx.moveTo(points_os[0][0]*cw,10+(1-points_os[0][1])*ch);
	for(var i=1;i<l;i++){
	ctx.lineTo(points_os[i][0]*cw,10+(1-points_os[i][1])*ch);
	}
	ctx.stroke();
	ctx.strokeStyle="#e3ca71";
	ctx.beginPath();
	ctx.moveTo(points_f[0][0]*cw,10+(1-points_f[0][1])*ch);
	for(var i=1;i<l;i++){
	ctx.lineTo(points_f[i][0]*cw,10+(1-points_f[i][1])*ch);
	}
	ctx.stroke();
	ctx.strokeStyle="#ea6161";
	ctx.beginPath();
	ctx.moveTo(points_rp[0][0]*cw,10+(1-points_rp[0][1])*ch);
	for(var i=1;i<l;i++){
	ctx.lineTo(points_rp[i][0]*cw,10+(1-points_rp[i][1])*ch);
	}
	ctx.stroke();

	});

}

function cosineInterpolate(y1,y2,mu)
{
  var mu2 = (1-Math.cos(mu*Math.PI))/2.0;
   return(y1*(1-mu2)+y2*mu2);
}


function CubicInterpolate(y0,y1,y2,y3,mu)
{

   var mu2 = mu*mu;
   var a0 = y3 - y2 - y0 + y1;
   var a1 = y0 - y1 - a0;
   var a2 = y2 - y0;
   var a3 = y1;

	var res=(a0*mu*mu2+a1*mu2+a2*mu+a3);

   return res>0?res:0;
}
//calculates the middlepoints using linear algebra. Maybe a better one?
function calcMiddlepoints(points,iterations){

	var np=[];
	for(var i=1;i<points.length-2;i++){
		for(var j=0;j<iterations;j++){
			var step=j/iterations;

			var xnew=points[i][0]+step*(-points[i][0]+points[i+1][0]);
			var ynew=CubicInterpolate(points[i-1][1],points[i][1],points[i+1][1],points[i+2][1],step)

			//var ynew=cosineInterpolate(points[i][1],points[i+1][1],step)
			np.push([xnew,ynew]);
		}
	}
return np;
}







//linear function mapping
function map(value, istart, istop, ostart, ostop){
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

//sort multidimensional array by an index
function dynamicSortindex(index) {
    return function (a,b) {
        var result = (a[index] < b[index]) ? -1 : (a[index] > b[index]) ? 1 : 0;
        return result;
    }
}

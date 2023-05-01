const app = document.getElementById('root')
var selectedID = -1
var MaxImages = 0
// IP Address of Computer running PP
const host = '192.168.0.157'
// Network Port in PP Prefs
const port = '1025'
// Width of thumbnails
const tnsize='300'
var presuuid
const container = document.createElement('div')
var currentPlaylistuuid
var currentPressIndex

container.setAttribute('class', 'container')
app.appendChild(container)



GetCurrentPlaylist()


// Functions


function GetCurrentPlaylist() {
	
	let addy='http://'+host +':'+ port+'/v1/playlist/active?chunked=false'
	let request = new XMLHttpRequest()
	request.open('GET',  addy , true)
	request.addEventListener("load",ProcessDefaultPlaylist,false)
	request.send()
	
}



function ProcessDefaultPlaylist(e) {

  let request = e.target
  let data = JSON.parse(request.response)
  currentPlaylistuuid=data.presentation.playlist.uuid
  currentPressIndex = data.presentation.item.uuid
  ReadPlayList(currentPlaylistuuid)
  
}

function ReadPlayList(uuid) {

	let addy='http://'+host +':'+ port+'/v1/playlist/'+uuid
	let request = new XMLHttpRequest()
	request.open('GET',  addy , true)
	request.addEventListener("load",ProcessPlaylist,false)
	request.send()
}

function ProcessPlaylist(e) {
	let request = e.target
	let data = JSON.parse(request.response)
	data.items.forEach(pres => {
	if (pres.type != 'header') {
	let newbutton=document.createElement('button')
	newbutton.setAttribute('class','sidebtn')
	newbutton.textContent = pres.id.name
	newbutton.id=pres.id.uuid
	newbutton.addEventListener("click",mySidebarBtnClicked,false)
	document.getElementById('mySidebar').appendChild(newbutton)
	}
})
}


function GetImage(slideid) {
	
	return 'http://'+host +':'+ port+'/v1/presentation/'+presuuid+'/thumbnail/'+slideid+'?quality='+tnsize
}


function imgClicked(e) {
		selectImage(e.target)
}	


function selectImage(i) {
	Array.prototype.forEach.call( document.images, function( img ) {
   img.setAttribute('class','unselected')
	});
	i.setAttribute('class','selected')
	let s = i.id
	let addy3='http://'+host +':'+ port+'/v1/presentation/'+presuuid+'/trigger/'+s
	let req  = new XMLHttpRequest()
	req.open ("GET", addy3, true)
	req.send()
	selectedID=s
	
}

function LoadPresentation(uuid) {
	container.innerHTML=''
	let addy='http://'+host +':'+ port+'/v1/presentation/'+uuid
	let request = new XMLHttpRequest()
	request.open('GET',  addy , true)
	request.addEventListener("load",ProcessResponse,false)
	request.send()
}


function TriggerPres(uuid) {
	let addy='http://'+host +':'+ port+'/v1/presentation/'+uuid+'/trigger'
	let request = new XMLHttpRequest()
	request.open('GET',  addy , false)
}




function ProcessResponse (e) {
  // Begin accessing JSON data here
  let request = e.target
  let data = JSON.parse(request.response)
  let slidID = -1
  if (request.status >= 200 && request.status < 400) {
  let thepres=data.presentation
  //Make sure the pres we are going to be showing is triggered!
  TriggerPres(thepres.id.uuid)
  
    presuuid=thepres.id.uuid
	thepres.groups.forEach(group => {
		  group.slides.forEach(slide => {
		  //const card = document.createElement('div')
		  //card.setAttribute('class', 'card')

		  const h1 = document.createElement('h1')
		  h1.textContent = group.name

		  const p = document.createElement('img')
		  //p.textContent = slide.text
		  slidID=slidID+1
		  p.src=GetImage(slidID)
		  p.setAttribute('class','unselected')
		  p.addEventListener("click",imgClicked,false)
		  p.id=slidID
		  MaxImages=slidID
		  //card.appendChild(p)
		  container.appendChild(p)
		  //card.appendChild(h1)
		  })
	})
  } else {
    alert('Something went wrong')
  }
  selectedID=-1;
}

//sidebar

function mySidebarBtnClicked(e) {
	LoadPresentation (e.target.id);
	closeNav();
}


function Navigate(i) {
	let e=parseInt(selectedID) + parseInt(i);
	if (e > MaxImages) {e=MaxImages;}
	if (e < 0){e=0;}
	selectImage(document.images[e])
	document.images[e].scrollIntoView()
}


function openNav() {
  let sbwidth="300px"
  if(document.getElementById("mySidebar").style.width == sbwidth) {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
  }
  else {
  document.getElementById("mySidebar").style.width = sbwidth;
  document.getElementById("main").style.marginLeft = sbwidth;
  }
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
}	
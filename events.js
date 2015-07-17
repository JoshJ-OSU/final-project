//clears the children of the node
function clearElement (e) {
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}


function closeEV() {
  var ev = document.getElementById('event-viewer-wrapper');
  ev.style.top = "100%";
}


function clearEVForm() {
  document.getElementById('ev-eventDesc').value = "";
  document.getElementById('ev-date').value = "";
  document.getElementById('ev-time').value = "";
}

function clearEVErrors() {
  document.getElementById('ev-eventDesc-error').textContent = "";
  document.getElementById('ev-date-error').textContent = "";
  document.getElementById('ev-time-error').textContent = "";
}

function getEventById(eId) {
  for(var i = 0; i < events.length; i++) {
    if (events[i].eventId === eId) {
      return events[i];
    } 
  }
  return null;
}


function openEditEV(eId) {
  e = getEventById(eId);
  
  if (e === null) {
    printError("Could not find event");
    return;
  }
  
  clearEVErrors();
  
  var descIn = document.getElementById('ev-eventDesc');
  var dateIn = document.getElementById('ev-date');
  var timeIn = document.getElementById('ev-time');
  
  descIn.value = e.eventDesc;
  dateIn.value = e.eventYear + '-' + (e.eventMonth < 10 ? '0' : '') + e.eventMonth + '-' + (e.eventDay < 10 ? '0' : '') + e.eventDay;
  timeIn.value = e.eventTime;

  var target = document.getElementById('ev-buttons');
  clearElement(target);
  
  var editButton = document.createElement('button');
  editButton.textContent = "Edit Event";
  editButton.setAttribute("onclick", "editEvent(" + e.eventId + ')')
  
  var deleteButton = document.createElement('button');
  deleteButton.textContent = "Delete Event";
  deleteButton.setAttribute("onclick", "deleteEvent(" + e.eventId + ')');
  
  target.appendChild(editButton);
  target.appendChild(deleteButton);
  
  var ev = document.getElementById('event-viewer-wrapper');
  ev.style.top = "0px";
}


function checkEVForm() {
  var returnValue = true;
 
  var descIn = document.getElementById('ev-eventDesc');
  var dateIn = document.getElementById('ev-date');
  var timeIn = document.getElementById('ev-time');
  
  clearEVErrors();
  
  if (descIn.value.trim() === "") {
    document.getElementById('ev-eventDesc-error').textContent = "Description Required!";
    returnValue = false;
  }
  
  if (isNaN(new Date(dateIn.value).valueOf()) === true) {
    document.getElementById('ev-date-error').textContent = "Valid Date Required: Try YYYY-MM-DD";
    returnValue = false;
  }
  
  if (isNaN(new Date('January 1, 1970 ' + timeIn.value).valueOf()) === true || timeIn.value.trim() === "") {
    document.getElementById('ev-time-error').textContent = "Valid Time Required: Try HH:MM";
    returnValue = false;
  }
  
  return returnValue;
}

function editEvent(eId) {
  e = getEventById(eId);
  if (e === null) {
    printError("Could not find event")
    return;
  }
  
  if (checkEVForm() === false) {
    return;
  }
  
  var descIn = document.getElementById('ev-eventDesc').value;
  var dateIn = document.getElementById('ev-date').value;
  var timeIn = document.getElementById('ev-time').value;
  
  closeEV();
  
  var req = new XMLHttpRequest();
    if(!req){
      printError("Could not create CalendarEvents request");
      return;
    }
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      response = JSON.parse(this.responseText);
      
      if (!(response.error == undefined)) {
        printError(response.error);
        return;
      }
      
      if (response.editSuccess == 1) {
        loadMonth(currentMonth, currentYear);
        return;
      }
    }
  }
  
  req.open('GET', 'calendar.php?eventId=' + e.eventId + '&desc=' + descIn + '&date=' + dateIn + '&time=' + timeIn + "&action=editEvent");
  req.send();
}


function deleteEvent(eId) {
  var r = window.confirm("Are you sure you want to delete this event?")
  
  if (r === false)
    return;
    
  closeEV();
  
  var req = new XMLHttpRequest();
    if(!req){
      printError("Could not create CalendarEvents request");
      return;
    }
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      response = JSON.parse(this.responseText);
      
      if (!(response.error == undefined)) {
        printError(response.error);
        return;
      }
      
      if (response.deleteSuccess == 1) {
        loadMonth(currentMonth, currentYear);
        return;
      }
    }
  }
  
  req.open('GET', 'calendar.php?eventId=' + eId + '&action=deleteEvent');
  req.send();
}


function openNewEV(date) {
  clearEVErrors();
  
  var descIn = document.getElementById('ev-eventDesc');
  var dateIn = document.getElementById('ev-date');
  var timeIn = document.getElementById('ev-time');
  
  descIn.value = "Enter Description Here";
  var now = new Date();
  dateIn.value = date;
  var str = now.getHours() + ':' + (now.getMinutes() < 10 ? "0" : '') + now.getMinutes();
  timeIn.value = str;
  console.log(str);

  var target = document.getElementById('ev-buttons');
  clearElement(target);
  
  var newButton = document.createElement('button');
  newButton.textContent = "Submit New Event";
  newButton.setAttribute("onclick", "newEvent()");
  
  target.appendChild(newButton);
  
  var ev = document.getElementById('event-viewer-wrapper');
  ev.style.top = "0px";
}


function newEvent() {
  if (checkEVForm() === false) {
    return;
  }
  
  var descIn = document.getElementById('ev-eventDesc').value;
  var dateIn = document.getElementById('ev-date').value;
  var timeIn = document.getElementById('ev-time').value;
  
  closeEV();
  
  var req = new XMLHttpRequest();
    if(!req){
      printError("Could not create CalendarEvents request");
      return;
    }
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      response = JSON.parse(this.responseText);
      
      if (!(response.error == undefined)) {
        printError(response.error);
        return;
      }
      
      if (response.newSuccess == 1) {
        loadMonth(currentMonth, currentYear);
        return;
      }
    }
  }
  
  req.open('GET', 'calendar.php?desc=' + descIn + '&date=' + dateIn + '&time=' + timeIn + "&action=newEvent");
  req.send();
}
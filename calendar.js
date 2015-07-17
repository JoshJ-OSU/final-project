var monthNames = ["Empty", "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];

var currentMonth;
var currentYear;

var events = [];
 
 
//function provided by http://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
//By c_harm, edited by Steve Tauber.  Returns the number of days in a given month (accounting for leap years too).
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();  //returns the largest date available given month and year
}


//given the month, day, and year, returns the day of the week 
//(sunday = 0, monday = 1, etc)
function getDayOfWeek(month, day, year) {
  return new Date(year, month - 1, day).getDay();
}


//given the month and year, returns the number of rows to build for the calendar
function calendarRowsToBuild(month, year) {
  var cellsNeeded = (getDaysInMonth(month, year) + getDayOfWeek(month, 1, year));
  return Math.floor((cellsNeeded - 1) / 7) + 1;
}


//builds a calendar grid including dates given a month (1-12) and year (4 digit)
function buildCalendarGrid(month, year) {
  
  //where to place the new rows
  var tableBody = document.getElementById("calendar-days");
  
  //determine the number of rows to build
  var numRows = calendarRowsToBuild(month, year);
  
  //for each row
  for (var i = 0; i < numRows; i++) {
    document.createElement('tr');
    var newRow = document.createElement('tr');
    
    //create 7 cells per row (one for each day of week)
    for (var j = 0; j < 7; j++) {
      var newCell = document.createElement('td');
      
      // determine if cell can be represented as a date of the month
      if (printDate(month, year, i, j)) {
        newCell.setAttribute('id', 'date-' + printDate(month, year, i, j));
        
        var top = document.createElement('div');
        top.setAttribute('class', 'date-top');
        
        var numDiv = document.createElement('div');
        numDiv.setAttribute('class', 'date');
        numDiv.textContent = printDate(month, year, i, j);
        
        var addDiv  = document.createElement('div');
        addDiv.setAttribute('class','addDiv');
        addDiv.textContent = '+';
        addDiv.setAttribute('onclick','openNewEV("' + year + '-' + (month < 10 ? '0' : '') + month + '-' + (printDate(month, year, i, j) < 10 ? '0' : '') + printDate(month, year, i, j) + '")');
        
        var eventDiv = document.createElement('div');
        eventDiv.setAttribute('class', 'events');
        eventDiv.setAttribute('id', 'events-' + printDate(month,year, i, j));
        
        top.appendChild(numDiv);
        top.appendChild(addDiv);
        newCell.appendChild(top);
        newCell.appendChild(eventDiv);
      } else {
        newCell.setAttribute('class', 'empty-cell');
      }
      
      newRow.appendChild(newCell);
      
    }
    tableBody.appendChild(newRow);
  }
}

//given the current month/year, it translates the calendar row/col to a numeric date.
//invalid values are passed as 0
function printDate(month, year, row, col) {
  var n = (row * 7 + 1 - getDayOfWeek(month, 1, year)) + col
  if ((n >= 1) && (n <= getDaysInMonth(month, year))) {
    return n;
  } else {
    return 0;
  }
}

//given month and year, fills the month-div by creating a month/year title as
//well as buttons to browse the calendar.
function buildCalendarTitle(month, year) {
  var monthDiv = document.getElementById('month-div');
  
  var prevMonth = createMonthButton(month - 1, year);
  prevMonth.textContent = "Previous Month";
  var nextMonth = createMonthButton(month + 1, year);
  nextMonth.textContent = "Next Month";
  
  var monthTitleWrap = document.createElement('div');
  var monthTitle = document.createElement('h1');
  monthTitle.textContent = monthNames[month] + ' ' + year;
  monthTitleWrap.appendChild(monthTitle);
  
  
  monthDiv.appendChild(prevMonth);
  monthDiv.appendChild(monthTitleWrap);
  monthDiv.appendChild(nextMonth);
}


//creates a button that takes the user to the month and year
function createMonthButton (month, year) {
  var d = new Date(year, month - 1);
  var m = d.getMonth() + 1;
  var y = d.getFullYear();
  var newButton = document.createElement('button');
  
  newButton.setAttribute('onclick', 'loadMonth(' + m + ', ' + y + ')');
  
  return newButton;
}


//clears the children of the node
function clearElement (e) {
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

//clears month-div and calendar-days on document
function clearCalendar() {
  var monthDiv = document.getElementById("month-div");
  var calendarDays = document.getElementById("calendar-days");
  clearElement(monthDiv);
  clearElement(calendarDays);
}

//clears the calendar then rebuilds it to the given month/year
function loadMonth(month, year) {
  currentMonth = month;
  currentYear = year;
  
  clearCalendar();
  buildCalendar(month, year);
}

//creates the title and the calendar grid
function buildCalendar(month, year) {
  buildCalendarTitle(month, year);
  buildCalendarGrid(month, year);
  populateCalendarEvents(month, year);
}


function printEvent(e) {
  var target = document.getElementById('events-' + e.eventDay);
  
  var newEvent = document.createElement('div');
  newEvent.textContent = e.eventTime.substring(0,5) + ' - ' + e.eventDesc;
  newEvent.setAttribute("onclick", "openEditEV(" + e.eventId + ')')
  
  target.appendChild(newEvent);
}

function printError(str) {
  var target = document.getElementById('error-div');
  var newEntry = document.createElement('p');
  
  newEntry.textContent = str;
  target.appendChild(newEntry);
}

function viewEvent(id) {
  buildEventForm()
}

/**************
* AJAX calls
**************/

/*Request events from database*/
function populateCalendarEvents(month, year){
  var username = "Josh";
  var req = new XMLHttpRequest();
  if(!req){
    printError("Could not create CalendarEvents request");
    return;
  }
  var url = "calendar.php";
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      response = JSON.parse(this.responseText);
      console.log(response);
      if (!(response.error == undefined)) {
        printError(response.error);
        return;
      }
      
      events = [];
      response.forEach(function (e) {
        e.eventDate = function () {return new Date(e.eventYear, e.eventMonth, e.eventDay)};
        events.push(e);
        printEvent(e);
      });
    }
  }
  
  req.open('GET', url+"?month="+month+"&year="+year+"&action=loadEvents");
  req.send();
}


function printUserName() {
  var req = new XMLHttpRequest();
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var response = JSON.parse(this.responseText);
      
      if (!(response.error == undefined)) {
        printError(response.error);
        return;
      }
      if (!(response.userName === null))
        document.getElementById('header-username').textContent = ' ' + response.userName;
    }
  };
  
  req.open('GET', 'calendar.php?action=getUserName');
  req.send();
};


function logout() {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var response = JSON.parse(this.responseText);
      
      if (response.logoutSuccess = 1) {
        window.location.assign('login.html');
        return;
      }
    }
  };
  
  req.open('GET', 'login.php?action=logout');
  req.send();
}


//when the page first launches, load calendar for the current month.
window.onload = function () {
  var d = new Date();  
  
  //check the status of the session -- if not logged in, go back to login.html
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var response = JSON.parse(this.responseText);
      
      if (response.loggedIn != 1) {
        window.location.assign('login.html');
        return;
      }
    }
  };
  
  req.open('GET', 'login.php?action=sessionStatus');
  req.send();

  currentMonth =  d.getMonth() + 1; 
  currentYear = d.getFullYear();
  
  printUserName();
  buildCalendar(currentMonth, currentYear);
};
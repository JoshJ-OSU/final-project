<?php
header('Content-type: application/json');
include 'cred.php';

session_start();


$parameters = array();
$returnArr = array();
$statusArr = array();
$requestMethod = $_SERVER["REQUEST_METHOD"];

//open database upon loading page, reports error or success to user
//adapted from php lecture and php documentation
//source: http://us2.php.net/manual/en/mysqli.quickstart.prepared-statements.php
$mysqli = new mysqli("oniddb.cws.oregonstate.edu", "johnsjo3-db", $ecret, "johnsjo3-db");
if ($mysqli->connect_errno) {
	printError("Failed to connect to database (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
} else {
	array_push($statusArr, "Successfully connected to database");
}

//Switch to handle request
if ( $requestMethod == "GET") {
  if (isset($_GET['action'])) {
	switch ($_GET['action']) {
		case 'loadEvents':
			loadEvents($mysqli);
			break;
		case 'deleteEvent':
			deleteEvent($mysqli);
			break;
		case 'editEvent':
			editEvent($mysqli);
			break;
		case 'getUserName':
			getUserName();
			break;
		case 'newEvent':
			newEvent($mysqli);
			break;
		default:
			printError("Invalid Action Request");
			break;
	}
  }
}

function loadEvents($db) {
	//make sure the request was sent properly
	if (!(
		isset($_GET['month']) &&
		isset($_GET['year'])
	   )) {
			printError("Invalid Request");
	}
	 
	$username = $_SESSION['username'];
	$month = $_GET['month'];
	$year = $_GET['year'];

	$eventId;
	$eventDay;
	$eventMonth;
	$eventYear;
	$eventTime;
	$eventDesc;
	$isPublic;
	
	if (!($stmt = $db->prepare("SELECT eventId, EXTRACT(DAY FROM eventDate) AS eventDay, EXTRACT(MONTH FROM eventDate) AS eventMonth, EXTRACT(YEAR FROM eventDate) AS eventYear, eventTime, eventDesc FROM cs290_final_events WHERE YEAR(eventDate) = ? AND MONTH(eventDate) = ? AND username = ?"))) {
			printError("Prepare failed: (" . $db->errno . ") " . $db->error);
	}
	
	$stmt->bind_param('iis', $year, $month, $username);	
	$stmt->bind_result($eventId, $eventDay, $eventMonth, $eventYear, $eventTime, $eventDesc);
	
	$stmt->execute();
	$res = $stmt->get_result();

	$returnArr = [];
	
	while (	$row = $res->fetch_assoc()){
		$returnArr[] = $row;
	}
	
	echo json_encode($returnArr);
}

function addEvent() {
	
}

function editEvent($db) {
	if (!(
		isset($_GET['date']) &&
		isset($_GET['desc']) &&
		isset($_GET['time']) &&
		isset($_GET['eventId'])
	   )) {
			printError("Invalid Request");
			return;
	}
	
	$date = strtotime($_GET['date']);
	$desc = $_GET['desc'];
	$time = $_GET['time'];
	$eId = $_GET['eventId'];
	$username = $_SESSION['username'];
	
	if (matchUserToEvent($username, $eId, $db) === false) {
		return;
	}
	
	if (testParameters($date, $time, $desc, $eId, $username, $db) === false) {
		return;
	}
	
	$date = date('Y-m-d', $date);
	
	if (!($stmt = $db->prepare("UPDATE cs290_final_events SET eventDesc = ?, eventDate = STR_TO_DATE(?, '%Y-%m-%d'), eventTime = STR_TO_DATE(?, '%H:%i') WHERE eventId = ?"))) {
			printError("Prepare failed: (" . $db->errno . ") " . $db->error);
			return;
	}
	
	$stmt->bind_param('sssi', $desc, $date, $time, $eId);
	$stmt->execute();
	
	$returnArr = [];
	$returnArr['editSuccess'] = 1;
	echo json_encode($returnArr);
	
	
}


function newEvent($db) {
	if (!(
		isset($_GET['date']) &&
		isset($_GET['desc']) &&
		isset($_GET['time'])
	   )) {
			printError("Invalid Request - $_GET[date] $_GET[desc] $_ GET[time] ");
			return;
	}
	
	$date = strtotime($_GET['date']);
	$desc = $_GET['desc'];
	$time = $_GET['time'];
	$username = $_SESSION['username'];
	
	if (testParameters($date, $time, $desc, $username, $db) === false) {
		return;
	}
	
	$date = date('Y-m-d', $date);
	
	if (!($stmt = $db->prepare("INSERT INTO cs290_final_events (eventDesc, eventDate, eventTime, username) VALUES (?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%H:%i'), ?)"))) {
			printError("Prepare failed: (" . $db->errno . ") " . $db->error);
			return;
	}
	
	$stmt->bind_param('ssss', $desc, $date, $time, $username);
	$stmt->execute();
	
	$returnArr = [];
	$returnArr['newSuccess'] = 1;
	echo json_encode($returnArr);	
}


function deleteEvent($db) {
	if (!(
		isset($_GET['eventId'])
	   )) {
			printError("Missing eventId");
			return;
	}
	
	$eId = $_GET['eventId'];
	$username = $_SESSION['username'];
	
	if (matchUserToEvent($username, $eId, $db) === false) {
		return;
	}
	
	if (!($stmt = $db->prepare("DELETE FROM cs290_final_events WHERE eventId = ?"))) {
		printError("Prepare failed: (" . $db->errno . ") " . $db->error);
		return;
	}
	
	$stmt->bind_param('i', $eId);
	$stmt->execute();
	
	$returnArr = [];
	$returnArr['deleteSuccess'] = 1;
	echo json_encode($returnArr);
}


function testParameters($date, $time, $desc, $username, $db) {
	
	//check that desc is not empty
	if (strlen(trim($desc)) == 0) {
		printError("Invalid Request - Description cannot be empty");
		return false;
	}
	
	//check that date parses correctly
	if ($date === false) {
		printError("Invalid Request - Date is incorrect");
		return false;
	}
	
	
	//check that time parses correctly
	if (strtotime($time) === false) {
		printError("Invalid Request - Time is incorrect");
		return false;
	}
	
	return true;
}

function matchUserToEvent($username, $eid, $db) {
	//check that username matches to eventId
	if (!($stmt = $db->prepare("SELECT username FROM cs290_final_events WHERE eventId = ?"))) {
			printError("Prepare failed: (" . $db->errno . ") " . $db->error);
			return;
	}
	
	$matchUsername;
	$stmt->bind_param('i', $eid);
	$stmt->execute();
	$stmt->bind_result($matchUsername);
	$stmt->fetch();
	
	if ($matchUsername != $username) {
		printError("Could not edit event. Usernames do not match.");
		return false;
	}
	$stmt->close();
	
	return true;
}

function getUserName() {
	$returnArr = [];
	$returnArr['userName'] = $_SESSION['username'];
	echo json_encode($returnArr);
	return;
}

function printError($str) {
	$returnArr['error'] = $str;
	echo json_encode($returnArr);
	exit();
}
?>
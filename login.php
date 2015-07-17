<?php
header('Content-type: application/json');

session_start();

include 'cred.php';

$mysqli = new mysqli("oniddb.cws.oregonstate.edu", "johnsjo3-db", $ecret, "johnsjo3-db");
if ($mysqli->connect_errno) {
	sendError("Failed to connect to database (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
	exit();
}

$requestMethod = $_SERVER["REQUEST_METHOD"];

if (!($requestMethod == 'GET')) {
	exit();
}

if (isset($_GET['action'])) {
	if ($_GET['action'] == 'sessionStatus') {
		sessionStatus();
	}
	
	if ($_GET['action'] == 'login') {
		login($mysqli);
	}
	
	if ($_GET['action'] == 'logout') {
		logout();
	}
	
	if ($_GET['action'] == 'signUp') {
		signUp($mysqli);
	}
}





/*******************************
Functions
*********************************/

function connectDatabase() {
	$mysqli = new mysqli("oniddb.cws.oregonstate.edu", "johnsjo3-db", $ecret, "johnsjo3-db");
	if ($mysqli->connect_errno) {
		sendError("Failed to connect to database (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
		exit();
	}
	
	return $mysqli;
}

function sessionStatus() {
	$sessionActive;
	
	if (isset($_SESSION['username'])) {
		$loggedIn = 1;
	} else {
		$loggedIn = 0;
	}
	
	$returnArr = [];
	$returnArr['loggedIn'] = $loggedIn;
	
	echo json_encode($returnArr);
	exit();
}


function login($db) {
	if (!(isset($_GET['username']) || (!(isset($_GET['password']))))) {
		//missing argument
		sendError("Missing either username or password");
		return;
	}
	
	$username = $_GET['username'];
	$pwHash = hash("md5", $_GET['password']);
	
	if (!($stmt = $db->prepare("SELECT pwHash FROM cs290_final_users WHERE userId = ?"))) {
			sendError("Prepare failed: (" . $db->errno . ") " . $db->error);
	}
	
	$comparehash;
	
	$stmt->bind_param('s', $username);	
	$stmt->bind_result($comparehash);
	
	$stmt->execute();
	$stmt->fetch();
	$stmt->close();
	
	$loginSuccess;
	
	if ($comparehash === $pwHash) {
		//we have a match, log in
		$_SESSION['username'] = $username;
		$loginSuccess = 1;
	} else {
		$loginSuccess = 0;
	}
	$returnArr = [];
	$returnArr['loginSuccess'] = $loginSuccess;
	echo json_encode($returnArr);
	return;
}

function logout(){
	$_SESSION = array();
	session_destroy();
	$returnArr = [];
	$returnArr['logoutSuccess'] = 1;
	echo json_encode($returnArr);
	return;
}

function signUp($db) {
	if (!(isset($_GET['username']) || (!(isset($_GET['password']))))) {
		//missing argument
		sendError("Missing either username or password");
		return;
	}
	
	$username = $_GET['username'];
	$returnArr = [];
	$pwHash = hash("md5", $_GET['password']);
	
	
	//Find out if the username already exists
	if (!($stmt = $db->prepare("SELECT userId FROM cs290_final_users WHERE userId = ?"))) {
			sendError("Prepare failed: (" . $db->errno . ") " . $db->error);
	}
	
	$result;
	
	$stmt->bind_param('s', $username);	
	$stmt->bind_result($result);
	
	$stmt->execute();
	$stmt->store_result();
	
	if ($stmt->num_rows > 0) {
		//username already exists
		$returnArr['usernameTaken'] = 1;
		echo json_encode($returnArr);
		return;
	}
	
	$stmt->close();
	
	
	//store the new username to the database
	if (!($stmt = $db->prepare("INSERT INTO cs290_final_users VALUES (?, ?)"))) {
			sendError("Prepare failed: (" . $db->errno . ") " . $db->error);
	}
	
	$stmt->bind_param('ss', $username, $pwHash);
	$stmt->execute();
	$stmt->close();
	
	$returnArr['signupSuccess'] = 1;
	$_SESSION['username'] = $username;
	echo json_encode($returnArr);
	return;
}

function sendError($str) {
	$returnArr = [];
	$returnArr['error'] = $str;
	echo json_encode($returnArr);
	exit();
}
?>

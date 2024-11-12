<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session initialization
ini_set('session.gc_maxlifetime', 2592000); // 30 days
session_set_cookie_params(2592000); // store session cookie for 30 days
session_start();
setcookie(session_name(), session_id(), ['expires' => time() + 2592000, 'samesite' => 'Strict']);
ob_implicit_flush();
if (function_exists('ob_get_level')) {
	while (ob_get_level() > 0) {
		ob_end_flush();
	}
}

/* ==[ Functions ]========================================================================================= */

// Displaying messages
function fancyDie($message) {
	die('<!DOCTYPE html>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Bytebeat management</title>
	<link rel="canonical" href="https://dollchan.net/bytebeat/">
	<link rel="shortcut icon" href="favicon.png">
	<link rel="stylesheet" type="text/css" href="bytebeat.css?version=2024103000">
</head>
<body style="text-align: center;">
	<div style="display: inline-block; padding: 8px 0;">
		' . $message . '
	</div>
	<br>
	<hr>
	<a href="javascript: window.history.go(-1);">Return</a>
</body>
</html>');
}

// Login form
function showLoginPage() {
	return '<form name="form_login" method="post" action="?manage">
			<fieldset>
				<legend align="center">Enter an administrator password</legend>
				<input type="password" name="managepassword">
				<input type="submit" value="Log In">
			</fieldset>
		</form>';
}

// Logout
function logoutRequest() {
	$_SESSION['bytebeat'] = '';
	session_destroy();
	die('<meta http-equiv="refresh" content="0;url=' . basename($_SERVER['PHP_SELF']) . '?manage">');
}

// Form for adding a song to the database
function addSongForm() {
	return '<form name="form_login" method="post" action="?addsong">
			<fieldset style="display: flex; flex-direction: column; gap: 4px; width: 320px; text-align: start;">
				<legend align="center">Adding a song</legend>
				<input type="text" name="author" placeholder="Author">
				<input type="text" name="name" placeholder="Name">
				<textarea name="description" placeholder="Description"></textarea>
				<textarea name="url" placeholder="URL or [&quot;URL1&quot;,&quot;URL2&quot;,...]"></textarea>
				<input type="text" name="date" placeholder="Date yyyy-mm-dd">
				<div>
					<input type="text" name="samplerate" placeholder="Sample rate (Hz)">
					<label><input type="checkbox" name="stereo"> Stereo</label>
				</div>
				<select name="mode">
					<option value="Bytebeat">Bytebeat</option>
					<option value="Signed Bytebeat">Signed Bytebeat</option>
					<option value="Floatbeat">Floatbeat</option>
					<option value="Funcbeat">Funcbeat</option>
				</select>
				<div>
					<input type="text" name="remix[]" placeholder="For remix: Source song hash" style="width: 90%;">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
				</div>
				<input type="text" name="cover_name" placeholder="Cover name">
				<input type="text" name="cover_url" placeholder="Cover URL">
				<textarea name="code" placeholder="Code original"></textarea>
				<textarea name="code_minified" placeholder="Code minified"></textarea>
				<textarea name="code_formatted" placeholder="Code formatted"></textarea>
				<input type="text" name="tags" placeholder="Tags [&quot;tag1&quot;,&quot;tag2&quot;,...]">
				<label>
					<select name="rating">
						<option value="0">No rating</option>
						<option value="1">Star</option>
						<option value="2">Yellow star</option>
					</select>
					Rating
				</label>
				<span><input type="submit" value="Submit"></span>
			</fieldset>
		</form>';
}

// Management panel
function managementRequest() {
	return '<fieldset style="display: flex;flex-direction: column;gap: 4px;">
			<legend align="center">Select an action to manage the library</legend>
			<a href="?addsong_request" class="control-button">Add a song</a>
			<a href="?migrate" class="control-button">Migrate to database</a>
			<a href="?make" class="control-button">Make .json files</a>
			<a href="?logout" class="control-button">Logout</a>
		</fieldset>';
}

// Move songs from library json files to 'songs' database table
function decodeOldJson(
	$dbLink,
	$libName,
	$entries = NULL,
	$authorStrGlob = NULL,
	$nameStrGlob = NULL,
	$urlStrGlob = NULL,
	$dateStrGlob = NULL,
	$ratingStrGlob = NULL
) {
	$libraryPath = './library/';

	// Get songs from the old library
	if (!isset($entries)) {
		$entries = json_decode(file_get_contents($libraryPath . $libName . '.json'));
	}

	// Write each song into the database
	foreach ($entries as $entry) {
		$authorStr = isset($entry->author) ? $entry->author : (isset($authorStrGlob) ? $authorStrGlob : NULL);
		$nameStr = isset($entry->name) ? $entry->name : (isset($nameStrGlob) ? $nameStrGlob : NULL);
		$urlStr = isset($entry->url) ?
			(is_array($entry->url) ? '["' . implode('","', $entry->url) . '"]' :
				(isset($urlStrGlob) ? '["' . $urlStrGlob . '","' . $entry->url . '"]' : $entry->url)) :
			(isset($urlStrGlob) ? $urlStrGlob : NULL);
		$dateStr = isset($entry->date) ? $entry->date : (isset($dateStrGlob) ? $dateStrGlob : NULL);
		$codeOriginal = isset($entry->codeOriginal) ?
			(is_array($entry->codeOriginal) ? implode(PHP_EOL, $entry->codeOriginal) : $entry->codeOriginal) :
			(isset($entry->fileOriginal) ?
				file_get_contents($libraryPath . 'original/' . $entry->file) : NULL);
		$codeMinified = isset($entry->codeMinified) ? $entry->codeMinified :
			(isset($entry->fileMinified) ?
				file_get_contents($libraryPath . 'minified/' . $entry->file) : NULL);
		$codeFormatted = isset($entry->fileFormatted) ?
			file_get_contents($libraryPath . 'formatted/' . $entry->file) : NULL;
		$ratingStr = isset($entry->starred) ? $entry->starred :
			(isset($ratingStrGlob) ? $ratingStrGlob : NULL);
		$codeLen = isset($codeOriginal) ? strlen($codeOriginal) :
			(isset($codeFormatted) ? strlen($codeFormatted) :
			(isset($codeMinified) ? strlen($codeMinified) : 0));
		$tagsArr = array();
		if ($codeLen) {
			if ($codeLen <= 256) {
				$tagsArr[] = '256';
			} else if ($codeLen <= 1024) {
				$tagsArr[] = '1k';
			} else {
				$tagsArr[] = 'big';
			}
		}
		if ($libName === 'classic') {
			$tagsArr[] = 'c';
		}
		if (isset($entry->children)) {
			decodeOldJson(
				$dbLink,
				$libName,
				$entry->children,
				isset($authorStr) ? $authorStr : NULL,
				isset($nameStr) ? $nameStr : NULL,
				isset($urlStr) ? $urlStr : NULL,
				isset($dateStr) ? $dateStr : NULL,
				isset($ratingStr) ? $ratingStr : NULL);
		} else {
			$query = 'INSERT INTO `songs` (hash, samplerate, mode' .
				(isset($authorStr) ? ', author' : '') .
				(isset($nameStr) ? ', name' : '') .
				(isset($entry->description) ? ', description' : '') .
				(isset($urlStr) ? ', url' : '') .
				(isset($dateStr) ? ', date' : '') .
				(isset($codeOriginal) ? ', code' : '') .
				(isset($entry->codeMinified) || isset($entry->fileMinified) ? ', code_minified' : '') . '' .
				(isset($entry->fileFormatted) ? ', code_formatted' : '') .
				(isset($entry->stereo) ? ', stereo' : '') .
				(isset($ratingStr) ? ', rating' : '') .
				(isset($entry->remix) ? ', remix' : '') .
				(isset($entry->cover) ? ', cover_name' : '') .
				(isset($entry->cover) && isset($entry->cover->url) ? ', cover_url' : '') .
				(isset($entry->drawing) ? ', drawing' : '') . 
				(count($tagsArr) ? ', tags' : '') . ')
			VALUES ("' .
				bin2hex(random_bytes(16)) . '", ' .
				(isset($entry->sampleRate) ? $entry->sampleRate : 8000) . ', "' .
				(isset($entry->mode) ? $entry->mode : 'Bytebeat') . '"' .
				(isset($authorStr) ? ', "' . addslashes($authorStr) . '"' : '') .
				(isset($nameStr) ? ', "' . addslashes($nameStr) . '"' : '') .
				(isset($entry->description) ? ', "' . addslashes($entry->description) . '"' : '') .
				(isset($urlStr) ? ', "' . addslashes($urlStr) . '"' : '') .
				(isset($dateStr) ? ', "' . $dateStr . '"' : '') .
				(isset($codeOriginal) ? ', "' . addslashes($codeOriginal) . '"' : '') .
				(isset($codeMinified) ? ', "' . addslashes($codeMinified) . '"' : '') .
				(isset($codeFormatted) ? ', "' . addslashes($codeFormatted) . '"' : '') .
				(isset($entry->stereo) ? ', 1' : '') .
				(isset($ratingStr) ? ', ' . $ratingStr : '') .
				(isset($entry->remix) ? ', "' . addslashes(json_encode($entry->remix)) . '"' : '') .
				(isset($entry->cover) ? ', "' . addslashes($entry->cover->name) . '"' : '') .
				(isset($entry->cover) && isset($entry->cover->url) ? 
					', "' . $entry->cover->url . '"' : '') .
				(isset($entry->drawing) ? ', "{\"mode\": \"' . $entry->drawing->mode . '\", \"scale\": ' .
					$entry->drawing->scale . '}"' : '') .
				(count($tagsArr) ? ', "' . 
					addslashes('["' . implode('","', $tagsArr) . '"]') . '"' : '') . ');';
			mysqli_query($dbLink, $query);
		}
	}
}

// Function to find the remixes of songs
function findSong($dbLink, $source) {
	$result = mysqli_query($dbLink,
		"SELECT `hash`, `author`, `name`, `url` FROM songs
		WHERE " .
			(isset($source->author) ? "`author` = '" . addslashes($source->author) . "'" : '') .
			(isset($source->name) ? (isset($source->author) ? ' AND ' : '') .
				"`name` = '" . addslashes($source->name) . "'" : '') .
			(isset($source->url) ? (isset($source->author) || isset($source->name) ? ' AND ' : '') .
				"`url` LIKE '%" . addslashes($source->url) . "%'" : '') .
		" LIMIT 1;");
	if ($result) {
		while ($song = mysqli_fetch_assoc($result)) {
			return $song;
		}
	}
}

// Access to the database
function getDBLink() {
	if (!function_exists('mysqli_connect')) {
		fancyDie('MySQLi library is not installed');
	}
	$dbLink = @mysqli_connect(BYTEBEAT_DBHOST, BYTEBEAT_DBUSERNAME, BYTEBEAT_DBPASSWORD, BYTEBEAT_DBNAME);
	if (!$dbLink) {
		fancyDie('Could not connect to database: ' . (is_object($dbLink) ? mysqli_error($dbLink) :
			(($dbLinkError = mysqli_connect_error()) ? $dbLinkError : '(unknown error)')));
	}
	return $dbLink;
}

// Migration from .json library files to the database
function jsonToDatabase() {
	$message = '';
	$dbLink = getDBLink();

	// Create new databsaes if not exist
	if (mysqli_num_rows(mysqli_query($dbLink, 'SHOW TABLES LIKE "songs"')) === 0) {
		mysqli_query($dbLink,
			'CREATE TABLE songs (
				`id` INT(10) UNSIGNED auto_increment NOT NULL,
				`hash` CHAR(32) NULL,
				`author` TEXT NULL,
				`name` VARCHAR(255) NULL,
				`description` TEXT NULL,
				`url` TEXT NULL,
				`date` VARCHAR(10) NULL,
				`mode` VARCHAR(20) NULL,
				`samplerate` DOUBLE NULL,
				`stereo` BOOL NULL,
				`code` MEDIUMTEXT NULL,
				`code_minified` TEXT NULL,
				`code_formatted` MEDIUMTEXT NULL,
				`remix` TEXT NULL,
				`cover_name` VARCHAR(255) NULL,
				`cover_url` TEXT NULL,
				`drawing` VARCHAR(50) NULL,
				`tags` VARCHAR(255) NULL,
				`rating` CHAR NULL,
				PRIMARY KEY (id),
				KEY `hash` (hash)
			)
			DEFAULT CHARSET = utf8mb4
			COLLATE = utf8mb4_0900_ai_ci;');
		mysqli_query($dbLink,
			'CREATE TABLE remixes (
				`song` CHAR(32) NOT NULL,
				`source` CHAR(32) NOT NULL
			)
			DEFAULT CHARSET = utf8mb4
			COLLATE = utf8mb4_0900_ai_ci;');
		$message .= 'Databases `songs` and `remixes` created.<br>';
	} else {
		// Clear existed tables
		mysqli_query($dbLink, 'TRUNCATE TABLE songs;');
		mysqli_query($dbLink, 'TRUNCATE TABLE remixes;');
		$message .= 'Databases `songs` and `remixes` cleared.<br>';
	}

	// Move songs from library json files to 'songs' database table
	decodeOldJson($dbLink, 'classic');
	decodeOldJson($dbLink, 'compact-js');
	decodeOldJson($dbLink, 'big-js');
	decodeOldJson($dbLink, 'floatbeat');
	decodeOldJson($dbLink, 'funcbeat');
	decodeOldJson($dbLink, 'sthephanshi');
	$message .= 'JSON libraries moved to `songs` database.<br>';

	// Find remixes of songs and write to 'remixes' database table
	$remixSongs = mysqli_query($dbLink,
		'SELECT `hash`, `name`, `remix` FROM songs WHERE `remix` IS NOT NULL;');
	while ($remixSong = mysqli_fetch_assoc($remixSongs)) {
		$source = json_decode($remixSong['remix']);
		if (json_last_error() !== JSON_ERROR_NONE) {
			continue;
		}
		if (is_array($source)) {
			foreach ($source as $source_) {
				mysqli_query($dbLink,
					'INSERT INTO `remixes` (song, source)
					VALUES ("' . $remixSong['hash'] . '", "' . findSong($dbLink, $source_)['hash'] . '");');
			}
		} else {
			mysqli_query($dbLink,
				'INSERT INTO `remixes` (song, source)
				VALUES ("' . $remixSong['hash'] . '", "' . findSong($dbLink, $source)['hash'] . '");');
		}
	}
	
	// Close database
	mysqli_close($dbLink);
	return $message . 'Remixes found and placed to `remixes` database.';
}

// Create JSON file on query from database
function makeJson($jsonFileName, $songsByHash, $qResult) {
	$songsArr = array();
	// Group songs by authors into arrays
	while ($song = mysqli_fetch_assoc($qResult)) {
		if (isset($song['author'])) {
			$songsArr[$song['author']][] = $song['hash'];
		} else {
			$songsArr[''][] = $song['hash'];
		}
	}
	// Make JSON file
	$outputStr = '';
	foreach ($songsArr as $author => $hashes) {
		$songsStr = '';
		foreach ($hashes as $hash) {
			$songsStr .= ($songsStr ? ',' : '') . $songsByHash[$hash];
		}
		// Making an object for author and all of his songs
		$outputStr .= ($outputStr ? ',' : '') .
			'{"author":' . json_encode($author) . ',"songs":[' . $songsStr . ']}';
	}
	file_put_contents($jsonFileName, '[' . $outputStr . ']');
}

// Making .json libraries and big-js songs files from database
function databaseToJson() {
	$message = '';
	$dbLink = getDBLink();

	// Create/clear folders for large songs
	$pathOriginal = './data/songs/original/';
	$pathMinified = './data/songs/minified/';
	$pathFormatted = './data/songs/formatted/';
	if (!is_dir($pathOriginal)) {
		mkdir($pathOriginal, 0755, true);
		$message .= $pathOriginal . ' created.<br>';
	} else {
		array_map('unlink', glob($pathOriginal . '/*.*'));
	}
	if (!is_dir($pathMinified)) {
		mkdir($pathMinified, 0755, true);
		$message .= $pathMinified . ' created.<br>';
	} else {
		array_map('unlink', glob($pathMinified . '/*.*'));
	}
	if (!is_dir($pathFormatted)) {
		mkdir($pathFormatted, 0755, true);
		$message .= $pathFormatted . ' created.<br>';
	} else {
		array_map('unlink', glob($pathFormatted . '/*.*'));
	}

	// Get songs from database
	$qResult = mysqli_query($dbLink,
		'SELECT
			`hash`,
			`author`,
			`name`,
			`description`,
			`url`,
			`date`,
			`mode`,
			`samplerate`,
			`stereo`,
			`code`,
			`code_minified`,
			`code_formatted`,
			`remix`,
			`cover_name`,
			`cover_url`,
			`drawing`,
			`tags`,
			`rating`
		FROM songs ORDER BY `author`, `date`, `id`;');

	// Create a json string for each song and put it into an associative array by hash
	$songsByHash = array();
	while ($song = mysqli_fetch_assoc($qResult)) {
		$fileMin = 0;
		$fileOrig = 0;
		$fileForm = 0;
		if (isset($song['code_minified']) && mb_strlen($song['code_minified']) > 1024) {
			// Save big minified code into file
			file_put_contents($pathMinified . $song['hash'] . '.js', $song['code_minified']);
			$fileMin = 1;
		}
		if (isset($song['code']) &&
			(substr_count($song['code'], PHP_EOL) > 4 || mb_strlen($song['code']) > 1024)
		) {
			// Save big original code into file
			file_put_contents($pathOriginal . $song['hash'] . '.js', $song['code']);
			$fileOrig = 1;
		}
		if (isset($song['code_formatted'])) {
			// Save formatted code into file
			file_put_contents($pathFormatted . $song['hash'] . '.js', $song['code_formatted']);
			$fileForm = 1;
		}
		// Finding remixes
		$remixStr = '';
		$sourcesArr = array();
		$qSources = mysqli_query($dbLink,
			"SELECT `source` FROM remixes
			WHERE `song` = '" . $song['hash'] . "';");
		if (mysqli_num_rows($qSources) != 0) {
			while ($source = mysqli_fetch_assoc($qSources)) {
				$sourcesArr[] = $source['source'];
			}
		}
		// Finding sources for remixes
		foreach ($sourcesArr as $sourceHash) {
			$qSource = mysqli_query($dbLink,
				"SELECT `author`, `name`, `url` FROM songs
				WHERE `hash` = '" . $sourceHash . "';");
			if (mysqli_num_rows($qSource) != 0) {
				while ($source = mysqli_fetch_assoc($qSource)) {
					$remixStr .= ($remixStr ? ',' : '') . '{"hash":"' . $sourceHash . '"' .
						(isset($source['author']) ? ', "author":' . json_encode($source['author']) : '') .
						(isset($source['name']) ? ', "name":' . json_encode($source['name']) : '') .
						(isset($source['url']) ? ', "url":' . json_encode($source['url']) : '') . '}';
				}
			}
		}
		// Making a json string for a song
		$songsByHash[$song['hash']] = '{"hash":"' . $song['hash'] . '"' .
			(isset($song['name']) ? ',"name":' . json_encode($song['name']) : '') .
			(isset($song['description']) ? ',"description":' . json_encode($song['description']) : '') .
			(isset($song['url']) ? ',"url":' . (str_starts_with($song['url'], '[') ?
				$song['url'] : '"' . $song['url'] . '"') : '') .
			(isset($song['date']) ? ',"date":"' . $song['date'] . '"' : '') .
			($song['mode'] != 'Bytebeat' ? ',"mode":"' . $song['mode'] . '"' : '') .
			',"sampleRate":' . $song['samplerate'] .
			(isset($song['stereo']) ? ',"stereo":1' : '') .
			($fileOrig ? ',"fileOrig":1' :
				(isset($song['code']) ? ',"code":' . json_encode($song['code']) : '')) .
			(isset($song['code']) ? ',"codeLen":' . strlen($song['code']) : '') .
			($fileMin ? ',"fileMin":1' : (isset($song['code_minified']) ?
				',"codeMin":' . json_encode($song['code_minified']) : '')) .
			(isset($song['code_minified']) ? ',"codeMinLen":' . strlen($song['code_minified']): '') .
			($fileForm ? ',"fileForm":1,"codeFormLen":' . strlen($song['code_formatted']) : '') .
			($remixStr ? ',"remix":[' . $remixStr . ']' : '') .
			(isset($song['cover_name']) ? ',"coverName":' . json_encode($song['cover_name']) : '') .
			(isset($song['cover_url']) ? ',"coverUrl":"' . $song['cover_url'] . '"' : '') .
			(isset($song['drawing']) ? ',"drawing":' . $song['drawing'] : '') .
			(isset($song['tags']) ? ',"tags":' . $song['tags'] : '') .
			(isset($song['rating']) ? ',"rating":' . $song['rating'] : '') .
		'}';
	}

	// Create/clear folder for JSON files
	$pathJSON = './data/json/';
	if (!is_dir($pathJSON)) {
		mkdir($pathJSON, 0755, true);
		$message .= $pathJSON . ' created.<br>';
	} else {
		array_map('unlink', glob($pathJSON . '/*.*'));
	}

	// JSON file with all songs sorted by authors
	$jsonFileName = $pathJSON . 'all.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		'SELECT `hash`, `author` FROM songs
		ORDER BY `author`, `date`, `id`;'));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with c-compatible songs
	$jsonFileName = $pathJSON . 'classic.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE `tags` LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with JS songs under 256b
	$jsonFileName = $pathJSON . 'js-256.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (mode = 'Bytebeat' OR mode = 'Signed Bytebeat')
			AND `tags` LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with JS songs under 1k
	$jsonFileName = $pathJSON . 'js-1k.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (mode = 'Bytebeat' OR mode = 'Signed Bytebeat')
			AND `tags` LIKE '%\"1k\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with big JS songs
	$jsonFileName = $pathJSON . 'js-big.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (mode = 'Bytebeat' OR mode = 'Signed Bytebeat')
			AND `tags` NOT LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"1k\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with Floatbeat mode songs
	$jsonFileName = $pathJSON . 'floatbeat.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE mode = 'Floatbeat'
			AND `tags` NOT LIKE '%\"big\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with Floatbeat mode songs
	$jsonFileName = $pathJSON . 'floatbeat-big.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE mode = 'Floatbeat'
			AND `tags` NOT LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"1k\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// JSON file with Funcbeat mode songs
	$jsonFileName = $pathJSON . 'funcbeat.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE mode = 'Funcbeat'
		ORDER BY `date`, `author`, `id`;"));
	$message .= $jsonFileName .' file created.<br>';

	// Close database
	mysqli_close($dbLink);
	return $message;
}

// Request to add a song to the database
function addSong() {
	$dbLink = getDBLink();

	$sampleRate = $_POST['samplerate'];
	if (!is_numeric($sampleRate)) {
		fancyDie('Error: Sample Rate must be a nubmer!');
	}
	$hash = bin2hex(random_bytes(16));

	// Adding song info into `songs` table
	$query = 'INSERT INTO `songs` (hash' .
		($_POST['author'] ? ', author' : '') .
		($_POST['name'] ? ', name' : '') .
		($_POST['description'] ? ', description' : '') .
		($_POST['url'] ? ', url' : '') .
		($_POST['date'] ? ', date' : '') .
		', mode, samplerate' .
		(isset($_POST['stereo']) ? ', stereo' : '') .
		($_POST['code'] ? ', code' : '') .
		($_POST['code_minified'] ? ', code_minified' : '') . '' .
		($_POST['code_formatted']  ? ', code_formatted' : '') .
		($_POST['tags'] ? ', tags' : '') .
		($_POST['rating'] ? ', rating' : '') . ')
	VALUES ("' . $hash . '"' .
		($_POST['author'] ? ', "' . addslashes($_POST['author']) . '"' : '') .
		($_POST['name'] ? ', "' . addslashes($_POST['name']) . '"' : '') .
		($_POST['description'] ? ', "' . addslashes($_POST['description']) . '"' : '') .
		($_POST['url'] ? ', "' . addslashes($_POST['url']) . '"' : '') .
		($_POST['date'] ? ', "' . $_POST['date'] . '"' : '') .
		', "' . ($_POST['mode'] ? $_POST['mode'] : 'Bytebeat') . '"' .
		', ' . ($sampleRate ? $sampleRate : 8000) .
		(isset($_POST['stereo']) ? ', 1' : '') .
		($_POST['code'] ? ', "' . addslashes($_POST['code']) . '"' : '') .
		($_POST['code_minified']  ? ', "' . addslashes($_POST['code_minified'] ) . '"' : '') .
		($_POST['code_formatted'] ? ', "' . addslashes($_POST['code_formatted']) . '"' : '') .
		($_POST['tags'] ? ', "' . addslashes($_POST['tags']) . '"' : '') .
		($_POST['rating'] ? ', ' . $_POST['rating'] : '') . ');';
	mysqli_query($dbLink, $query);

	// Adding sources for remixes into `remixes` table
	$sources = $_POST['remix'];
	foreach ($sources as $source) {
		mysqli_query($dbLink,
			'INSERT INTO `remixes` (song, source)
			VALUES ("' . $hash . '", "' . $source . '");');
	}

	// Close database
	mysqli_close($dbLink);
	return 'Song added!';
}

/* ==[ Main ]============================================================================================== */

// Settings initialization
if (!file_exists('settings.php')) {
	fancyDie('Please copy the file settings.default.php to settings.php');
}
require 'settings.php';
if (BYTEBEAT_TIMEZONE != '') {
	date_default_timezone_set(BYTEBEAT_TIMEZONE);
}
if (BYTEBEAT_ADMINPASS == '') {
	fancyDie('settings.php: BYTEBEAT_ADMINPASS must be configured.');
}

// Checking authorization when trying to login
if (isset($_POST['managepassword'])) {
	if ($_POST['managepassword'] === BYTEBEAT_ADMINPASS) {
		$_SESSION['bytebeat'] = BYTEBEAT_ADMINPASS;
	} else {
		fancyDie('Login failed!');
	}
}

// Show login form if not logined yet
if (!isset($_SESSION['bytebeat'])) {
	fancyDie(showLoginPage());
}

// Management request
if (isset($_GET['manage'])) {
	fancyDie(managementRequest());
}

// Logout request
if (isset($_GET['logout'])) {
	logoutRequest();
}

// Request to transfer songs from .json library files to the database
if (isset($_GET['migrate'])) {
	fancyDie(jsonToDatabase());
}

// Request to create .json libraries and big-js song files from database
if (isset($_GET['make'])) {
	fancyDie(databaseToJson());
}

// Request to call the form to add a song
if (isset($_GET['addsong_request'])) {
	fancyDie(addSongForm());
}

// Request to add a song to the database
if (isset($_GET['addsong'])) {
	fancyDie(addSong());
}

// Redirection to Bytebeat Player page
header('Location: index.html', true, 307);
exit();
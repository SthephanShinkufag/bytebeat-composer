# bytebeat-composer
Live editing algorithmic music generator with a collection of many formulas from around the internet.

My composer: https://d3nschot.github.io/ThisBeat2.1 <br>
Bytebeat Composer (original website): https://dollchan.net/bytebeat/<br>
Discussion threads: https://dollchan.net/btb/

![Sierpinski triangles](https://github.com/user-attachments/assets/f8811437-c0d5-4f64-9ead-2fd621c18bb8)

## Compilation

1. Install Node.js
2. Run with npm:
```
https://github.com/D3nschot/ThisBeat2.1.git
cd ThisBeat2.1
npm install
npm start
```
3. Compiled scripts will be created in the `/build` directory.<br>
4. Access to the site is provided through the `index.html` in the root directory.

## Collection of songs

Songs lists are stored in JSON format, compressed with GZIP in `/data/library/*.gz` files.<br>
Songs codes larger than 1KB are stored in `/data/songs/*/*.js` files.<br>
To maintain your own library of songs:

1. Create a MySQL database on your server.
2. Set up PHP with the MySQLi extension on your server.
3. Copy `settings.default.php` to `settings.php` in the root directory.
4. Configure `settings.php` with your database settings.
5. `chmod` write permissions to the `/data` directory.
6. Go to your Bytebeat Player page > "Settings" section > "Manage library" link.
7. Log in using the admin password you set in `BYTEBEAT_ADMINPASS` in `settings.php`.
8. The management panel is now available.

The following management functions are provided:
- "Migrate to database" button &ndash; to fullfill your database with songs from `/data` library files.
- "Make library files" button &ndash; to generate `/data` library files from your database.
- "Add a song" button &ndash; opens a form to add a new song.



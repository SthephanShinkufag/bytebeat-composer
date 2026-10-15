# bytebeat-composer
Live editing algorithmic music generator with a collection of many formulas from around the internet.

Bytebeat Composer: https://dollchan.net/bytebeat/<br>
Discussion threads: https://dollchan.net/btb/

![Sierpinski triangles](https://github.com/user-attachments/assets/f8811437-c0d5-4f64-9ead-2fd621c18bb8)

## Compilation

1. Install Node.js
2. `cd` to the directory you wish to install Bytebeat Composer.
3. Run with npm:
```
git clone https://github.com/SthephanShinkufag/bytebeat-composer.git
cd bytebeat-composer
npm install
npm start
```
4. Compiled scripts will be created in the `/build` directory.<br>
5. Access to the site is provided through the `index.html` in the root directory.

## Configuration

1. Create a MySQL database on your server.
2. Set up PHP with the MySQL PDO Driver on your server.
3. Copy `settings.default.php` to `settings.php` in the root directory.
4. Configure `settings.php` with your database settings.
5. `chmod` write permissions to the `/data` directory.
6. Go to your Bytebeat Player page and press the "Manage" button.
7. Log in using the temporary admin password you set in `BYTEBEAT_ADMINPASS` in `settings.php` (the username can be anything).
8. Once you logged in, enter your username and new password to create a premanent admin account in the database.
9. Erase `BYTEBEAT_ADMINPASS` with '' in `settings.php`.
8. The management panel is now available.

## Management panel

The following management functions are provided:
- "Add a song" button &ndash; opens a form to add a new song.
- "Make library files" button &ndash; to generate `/data` library files from your database (admin functon).
- "Make database" button &ndash; to fullfill your database with songs from `/data/all.gz` library (admin functon).
- "Manage users" button &ndash; to add or delete moderators who can add, edit, and delete songs.
- "Change password" button &ndash; to change your account password.
- "Logout" button.

## Collection of songs

Currently, the Bytebeat Player comes with an empty library of songs. You can create your own library by adding songs via the manager.<br>
Songs library is stored in JSON format, compressed with GZIP in `/data/library/all.gz` file.<br>
Songs codes larger than 512B or longer than 8 lines will be stored stored in `/data/songs/*/*.js` files.

#!/usr/bin/env node

// Usage: npx create-boardzilla-game [game name]

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const package = require('./package.json')
const program = new Command();
const spawn = require('child_process').spawnSync;

function toTitleCase(str) {
  return str.split(/\W+/).map(s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()).join(" ")
}

program
  .name('create-boardzilla-game')
  .description('CLI to create a boardzilla game')
  .version(package.version);

program.description('The name of the game to create')
  .argument('<name>', 'Name of game to create');

program.parse(process.argv)

const projectName = program.args[0]

// Create a project directory with the project name.
const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
fs.mkdirSync(projectDir, { recursive: true });

// A common approach to building a starter template is to
// create a `template` folder which will house the template
// and the files we want to create.
const templateDir = path.resolve(__dirname, 'template');
fs.cpSync(templateDir, projectDir, { recursive: true });

// It is good practice to have dotfiles stored in the
// template without the dot (so they do not get picked
// up by the starter template repository). We can rename
// the dotfiles after we have copied them over to the
// new project directory.
fs.renameSync(
  path.join(projectDir, 'gitignore'),
  path.join(projectDir, '.gitignore')
);

const projectPackageJson = require(path.join(projectDir, 'package.json'));

// Update the project's package.json with the new project name
projectPackageJson.name = projectName;

fs.writeFileSync(
  path.join(projectDir, 'package.json'),
  JSON.stringify(projectPackageJson, null, 2)
);
const gameManifest = require(path.join(projectDir, 'game.v1.json'));
gameManifest.name = projectName;
gameManifest.friendlyName = toTitleCase(projectName);
fs.writeFileSync(
  path.join(projectDir, 'game.v1.json'),
  JSON.stringify(gameManifest, null, 2)
);

// Run `npm install` in the project directory to install
// the dependencies. We are using a third-party library
// called `cross-spawn` for cross-platform support.
// (Node has issues spawning child processes in Windows).
spawn('npm', ['install'], { stdio: 'inherit', cwd: projectDir });

console.log('Success! Your new project is ready.');
console.log(`Created ${projectName} at ${projectDir}`);
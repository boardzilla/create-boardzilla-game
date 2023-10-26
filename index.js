#!/usr/bin/env node

// Usage: npx create-boardzilla-game [game name]

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const { Command, InvalidArgumentError, Option } = require('commander');
const spawn = require('child_process').spawnSync;
const AdmZip = require('adm-zip');

const package = require('./package.json')
const program = new Command();

function toTitleCase(str) {
  return str.split(/\W+/).map(s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()).join(" ")
}

function validateName(name) {
  if (!name.match(/^[a-z0-9_-]+$/)) {
    throw new InvalidArgumentError('Can only contain lowercase letters, digits, _ and -');
  }
  return name
}

function validateTemplateName(name) {
  const options = new Map(
    [["empty", "boardzilla-starter-game"]]
  )
  const repoName = options.get(name)
  if (!repoName) {
    throw new InvalidArgumentError('Must be one of ' + Array.from(options.keys()).join(", "));
  }
  return repoName
}

program
  .name('create-boardzilla-game')
  .description('CLI to create a boardzilla game')
  .version(package.version);

program.description('The name of the game to create')
  .argument('<name>', 'name of game to create', validateName)
  .addOption(new Option('-t, --template <name>', validateTemplateName, 'name of template to use').preset("empty").argParser(validateTemplateName));

program.parse(process.argv)

console.log()
const projectName = program.args[0]
const templateName = program.opts()["template"] || "boardzilla-starter-game"

// Create a project directory with the project name.
const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);

if (fs.existsSync(projectDir)) {
  console.error(`${projectDir} already exists`)
  process.exit(1)
}

fs.mkdirSync(projectDir, { recursive: true });
const gameOut = path.join(os.tmpdir(), `game-${crypto.randomBytes(4).readUInt32LE(0)}.zip`)
const gameZipOut = path.join(os.tmpdir(), `game-${crypto.randomBytes(4).readUInt32LE(0)}`)

function cleanup() {
  fs.rmSync(gameOut, {force: true})
  fs.rmdirSync(gameZipOut, {force: true, recursive: true})
}
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);

spawn("curl", ["-L", `https://github.com/boardzilla/${templateName}/zipball/master/`, "-o", gameOut])
const zip = new AdmZip(gameOut)
zip.extractAllTo(gameZipOut)
const entries = fs.readdirSync(gameZipOut)
fs.cpSync(path.join(gameZipOut, entries[0]), projectDir, { recursive: true });

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

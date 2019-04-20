"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path = require("path");
function writeToFile(filePath, str) {
    fs_extra_1.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, str);
}
exports.writeToFile = writeToFile;
/**
 * This method is specifically for updating a JSON file using the filesystem
 *
 * @remarks
 * If you are looking to update a JSON file in a tree, look for ./ast-utils#updateJsonInTree
 * @param localPath Path of the JSON file on the filesystem
 * @param callback Manipulation of the JSON data
 */
function updateJsonFile(localPath, callback) {
    const json = readJsonFile(localPath);
    callback(json);
    writeJsonFile(localPath, json);
}
exports.updateJsonFile = updateJsonFile;
function addApp(apps, newApp) {
    if (!apps) {
        apps = [];
    }
    apps.push(newApp);
    apps.sort((a, b) => {
        if (a.name === '$workspaceRoot')
            return 1;
        if (b.name === '$workspaceRoot')
            return -1;
        if (a.main && !b.main)
            return -1;
        if (!a.main && b.main)
            return 1;
        if (a.name > b.name)
            return 1;
        return -1;
    });
    return apps;
}
exports.addApp = addApp;
function serializeJson(json) {
    return `${JSON.stringify(json, null, 2)}\n`;
}
exports.serializeJson = serializeJson;
/**
 * This method is specifically for reading a JSON file from the filesystem
 *
 * @remarks
 * If you are looking to read a JSON file in a Tree, use ./ast-utils#readJsonInTree
 * @param localPath Path of the JSON file on the filesystem
 */
function readJsonFile(localPath) {
    return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
}
exports.readJsonFile = readJsonFile;
function writeJsonFile(localPath, json) {
    writeToFile(localPath, serializeJson(json));
}
exports.writeJsonFile = writeJsonFile;
function readCliConfigFile() {
    return readJsonFile('.angular-cli.json');
}
exports.readCliConfigFile = readCliConfigFile;
function copyFile(file, target) {
    const f = path.basename(file);
    const source = fs.createReadStream(file);
    const dest = fs.createWriteStream(path.resolve(target, f));
    source.pipe(dest);
    source.on('error', e => console.error(e));
}
exports.copyFile = copyFile;
function directoryExists(name) {
    try {
        return fs.statSync(name).isDirectory();
    }
    catch (e) {
        return false;
    }
}
exports.directoryExists = directoryExists;
function fileExists(filePath) {
    try {
        return fs_1.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}
exports.fileExists = fileExists;
function createDirectory(directoryPath) {
    const parentPath = path.resolve(directoryPath, '..');
    if (!directoryExists(parentPath)) {
        createDirectory(parentPath);
    }
    if (!directoryExists(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
}
exports.createDirectory = createDirectory;
function renameSync(from, to, cb) {
    try {
        if (!fs.existsSync(from)) {
            throw new Error(`Path: ${from} does not exist`);
        }
        else if (fs.existsSync(to)) {
            throw new Error(`Path: ${to} already exists`);
        }
        // Make sure parent path exists
        const parentPath = path.resolve(to, '..');
        createDirectory(parentPath);
        fs.renameSync(from, to);
        cb(null);
    }
    catch (e) {
        cb(e);
    }
}
exports.renameSync = renameSync;
//# sourceMappingURL=fileutils.js.map
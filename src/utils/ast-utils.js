"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const path = require("path");
const ts = require("typescript");
const fileutils_1 = require("./fileutils");
const name_utils_1 = require("./name-utils");
/**
 * This method is specifically for updating in a Tree
 * @param localPath Path of file in the Tree
 * @param callback Manipulation of the data
 * @returns A rule which updates a file file in a Tree
 */
function updateFileInTree(localPath, callback) {
    return (host) => {
        if (!host.exists(localPath)) {
            host.create(localPath, callback('', host));
            return host;
        }
        host.overwrite(localPath, callback(readFileInTree(host, localPath), host));
        return host;
    };
}
exports.updateFileInTree = updateFileInTree;
/**
 * This method is specifically for reading files in a Tree
 * @param host The host tree
 * @param localPath The path to the file
 * @returns The data in the file.
 */
function readFileInTree(host, localPath) {
    if (!host.exists(localPath)) {
        throw new Error(`Cannot find ${localPath}`);
    }
    const contents = host.read(localPath).toString('utf-8');
    try {
        return contents;
    }
    catch (e) {
        throw new Error(`Cannot parse ${localPath}: ${e.message}`);
    }
}
exports.readFileInTree = readFileInTree;
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
exports.readIntoSourceFile = readIntoSourceFile;
function deleteInTree(localPath, isDirectory = false) {
    return (host) => {
        if (isDirectory) {
            host.visit(file => {
                if (file.startsWith(localPath)) {
                    host.delete(file);
                }
            });
        }
        else {
            if (host.exists(localPath)) {
                host.delete(localPath);
            }
        }
        return host;
    };
}
exports.deleteInTree = deleteInTree;
/////////////////////////////////
function addReexport(source, modulePath, reexportedFileName, token) {
    const allExports = ast_utils_1.findNodes(source, ts.SyntaxKind.ExportDeclaration);
    if (allExports.length > 0) {
        const m = allExports.filter((e) => e.moduleSpecifier.getText(source).indexOf(reexportedFileName) > -1);
        if (m.length > 0) {
            const mm = m[0];
            return [
                new change_1.InsertChange(modulePath, mm.exportClause.end - 1, `, ${token} `)
            ];
        }
    }
    return [];
}
exports.addReexport = addReexport;
function addParameterToConstructor(source, modulePath, opts) {
    const clazz = findClass(source, opts.className);
    const constructor = clazz.members.filter(m => m.kind === ts.SyntaxKind.Constructor)[0];
    if (constructor) {
        throw new Error('Should be tested');
    }
    else {
        const methodHeader = `constructor(${opts.param})`;
        return addMethod(source, modulePath, {
            className: opts.className,
            methodHeader,
            body: null
        });
    }
}
exports.addParameterToConstructor = addParameterToConstructor;
function addMethod(source, modulePath, opts) {
    const clazz = findClass(source, opts.className);
    const body = opts.body
        ? `
${opts.methodHeader} {
${offset(opts.body, 1, false)}
}
`
        : `
${opts.methodHeader} {}
`;
    return [new change_1.InsertChange(modulePath, clazz.end - 1, offset(body, 1, true))];
}
exports.addMethod = addMethod;
function removeFromNgModule(source, modulePath, property) {
    const nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    const node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    const matchingProperty = getMatchingProperty(source, property, 'NgModule', '@angular/core');
    if (matchingProperty) {
        return [
            new change_1.RemoveChange(modulePath, matchingProperty.getStart(source), matchingProperty.getFullText(source))
        ];
    }
    else {
        return [];
    }
}
exports.removeFromNgModule = removeFromNgModule;
function findClass(source, className, silent = false) {
    const nodes = ast_utils_1.getSourceNodes(source);
    const clazz = (nodes.filter(n => n.kind === ts.SyntaxKind.ClassDeclaration &&
        n.name.text === className)[0]);
    if (!clazz && !silent) {
        throw new Error(`Cannot find class '${className}'`);
    }
    return clazz;
}
exports.findClass = findClass;
function offset(text, numberOfTabs, wrap) {
    const lines = text
        .trim()
        .split('\n')
        .map(line => {
        let tabs = '';
        for (let c = 0; c < numberOfTabs; ++c) {
            tabs += '  ';
        }
        return `${tabs}${line}`;
    })
        .join('\n');
    return wrap ? `\n${lines}\n` : lines;
}
exports.offset = offset;
function addImportToModule(source, modulePath, symbolName) {
    return ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'imports', symbolName);
}
exports.addImportToModule = addImportToModule;
function addImportToTestBed(source, specPath, symbolName) {
    const allCalls = (ast_utils_1.findNodes(source, ts.SyntaxKind.CallExpression));
    const configureTestingModuleObjectLiterals = allCalls
        .filter(c => c.expression.kind === ts.SyntaxKind.PropertyAccessExpression)
        .filter((c) => c.expression.name.getText(source) === 'configureTestingModule')
        .map(c => c.arguments[0].kind === ts.SyntaxKind.ObjectLiteralExpression
        ? c.arguments[0]
        : null);
    if (configureTestingModuleObjectLiterals.length > 0) {
        const startPosition = configureTestingModuleObjectLiterals[0]
            .getFirstToken(source)
            .getEnd();
        return [
            new change_1.InsertChange(specPath, startPosition, `imports: [${symbolName}], `)
        ];
    }
    else {
        return [];
    }
}
exports.addImportToTestBed = addImportToTestBed;
function getBootstrapComponent(source, moduleClassName) {
    const bootstrap = getMatchingProperty(source, 'bootstrap', 'NgModule', '@angular/core');
    if (!bootstrap) {
        throw new Error(`Cannot find bootstrap components in '${moduleClassName}'`);
    }
    const c = bootstrap.getChildren();
    const nodes = c[c.length - 1].getChildren();
    const bootstrapComponent = nodes.slice(1, nodes.length - 1)[0];
    if (!bootstrapComponent) {
        throw new Error(`Cannot find bootstrap components in '${moduleClassName}'`);
    }
    return bootstrapComponent.getText();
}
exports.getBootstrapComponent = getBootstrapComponent;
function getMatchingObjectLiteralElement(node, source, property) {
    return (node.properties
        .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) === property;
            case ts.SyntaxKind.StringLiteral:
                return name.text === property;
        }
        return false;
    })[0]);
}
function getMatchingProperty(source, property, identifier, module) {
    const nodes = ast_utils_1.getDecoratorMetadata(source, identifier, module);
    const node = nodes[0]; // tslint:disable-line:no-any
    if (!node)
        return null;
    // Get all the children property assignment of object literals.
    return getMatchingObjectLiteralElement(node, source, property);
}
function addRoute(ngModulePath, source, route) {
    const routes = getListOfRoutes(source);
    if (!routes)
        return [];
    if (routes.hasTrailingComma || routes.length === 0) {
        return [new change_1.InsertChange(ngModulePath, routes.end, route)];
    }
    else {
        return [new change_1.InsertChange(ngModulePath, routes.end, `, ${route}`)];
    }
}
exports.addRoute = addRoute;
function addIncludeToTsConfig(tsConfigPath, source, include) {
    const includeKeywordPos = source.text.indexOf('"include":');
    if (includeKeywordPos > -1) {
        const includeArrayEndPos = source.text.indexOf(']', includeKeywordPos);
        return [new change_1.InsertChange(tsConfigPath, includeArrayEndPos, include)];
    }
    else {
        return [];
    }
}
exports.addIncludeToTsConfig = addIncludeToTsConfig;
function getListOfRoutes(source) {
    const imports = getMatchingProperty(source, 'imports', 'NgModule', '@angular/core');
    if (imports.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        const a = imports.initializer;
        for (const e of a.elements) {
            if (e.kind === ts.SyntaxKind.CallExpression) {
                const ee = e;
                const text = ee.expression.getText(source);
                if ((text === 'RouterModule.forRoot' ||
                    text === 'RouterModule.forChild') &&
                    ee.arguments.length > 0) {
                    const routes = ee.arguments[0];
                    if (routes.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                        return routes.elements;
                    }
                }
            }
        }
    }
    return null;
}
function getImport(source, predicate) {
    const allImports = ast_utils_1.findNodes(source, ts.SyntaxKind.ImportDeclaration);
    const matching = allImports.filter((i) => predicate(i.moduleSpecifier.getText()));
    return matching.map((i) => {
        const moduleSpec = i.moduleSpecifier
            .getText()
            .substring(1, i.moduleSpecifier.getText().length - 1);
        const t = i.importClause.namedBindings.getText();
        const bindings = t
            .replace('{', '')
            .replace('}', '')
            .split(',')
            .map(q => q.trim());
        return { moduleSpec, bindings };
    });
}
exports.getImport = getImport;
function addProviderToModule(source, modulePath, symbolName) {
    return ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'providers', symbolName);
}
exports.addProviderToModule = addProviderToModule;
function addDeclarationToModule(source, modulePath, symbolName) {
    return ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'declarations', symbolName);
}
exports.addDeclarationToModule = addDeclarationToModule;
function addEntryComponents(source, modulePath, symbolName) {
    return ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'entryComponents', symbolName);
}
exports.addEntryComponents = addEntryComponents;
function addGlobal(source, modulePath, statement) {
    const allImports = ast_utils_1.findNodes(source, ts.SyntaxKind.ImportDeclaration);
    if (allImports.length > 0) {
        const lastImport = allImports[allImports.length - 1];
        return [
            new change_1.InsertChange(modulePath, lastImport.end + 1, `\n${statement}\n`)
        ];
    }
    else {
        return [new change_1.InsertChange(modulePath, 0, `${statement}\n`)];
    }
}
exports.addGlobal = addGlobal;
function insert(host, modulePath, changes) {
    if (changes.length < 1) {
        return;
    }
    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
        else if (change instanceof change_1.RemoveChange) {
            recorder.remove(change.pos - 1, change.toRemove.length + 1);
        }
        else if (change instanceof change_1.NoopChange) {
            // do nothing
        }
        else if (change instanceof change_1.ReplaceChange) {
            const action = change;
            recorder.remove(action.pos, action.oldText.length);
            recorder.insertLeft(action.pos, action.newText);
        }
        else {
            throw new Error(`Unexpected Change '${change}'`);
        }
    }
    host.commitUpdate(recorder);
}
exports.insert = insert;
/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param localPath The path to the JSON file
 * @returns The JSON data in the file.
 */
function readJsonInTree(host, localPath) {
    if (!host.exists(localPath)) {
        throw new Error(`Cannot find ${localPath}`);
    }
    const contents = host.read(localPath).toString('utf-8');
    try {
        return JSON.parse(contents);
    }
    catch (e) {
        throw new Error(`Cannot parse ${localPath}: ${e.message}`);
    }
}
exports.readJsonInTree = readJsonInTree;
/**
 * This method is specifically for updating JSON in a Tree
 * @param localPath Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
function updateJsonInTree(localPath, callback) {
    return (host) => {
        if (!host.exists(localPath)) {
            host.create(localPath, fileutils_1.serializeJson(callback({})));
            return host;
        }
        host.overwrite(localPath, fileutils_1.serializeJson(callback(readJsonInTree(host, localPath))));
        return host;
    };
}
exports.updateJsonInTree = updateJsonInTree;
function getProjectConfig(host, name) {
    const angularJson = readJsonInTree(host, '/angular.json');
    const projectConfig = angularJson.projects[name];
    if (!projectConfig) {
        throw new Error(`Cannot find project '${name}'`);
    }
    else {
        return projectConfig;
    }
}
exports.getProjectConfig = getProjectConfig;
function updateProjectConfig(name, projectConfig) {
    return updateJsonInTree('/angular.json', angularJson => {
        angularJson.projects[name] = projectConfig;
        return angularJson;
    });
}
exports.updateProjectConfig = updateProjectConfig;
function readBootstrapInfo(host, app) {
    const config = getProjectConfig(host, app);
    let mainPath;
    try {
        mainPath = config.architect.build.options.main;
    }
    catch (e) {
        throw new Error('Main file cannot be located');
    }
    if (!host.exists(mainPath)) {
        throw new Error('Main file cannot be located');
    }
    const mainSource = host.read(mainPath).toString('utf-8');
    const main = ts.createSourceFile(mainPath, mainSource, ts.ScriptTarget.Latest, true);
    const moduleImports = getImport(main, (s) => s.indexOf('.module') > -1);
    if (moduleImports.length !== 1) {
        throw new Error(`main.ts can only import a single module`);
    }
    const moduleImport = moduleImports[0];
    const moduleClassName = moduleImport.bindings.filter(b => b.endsWith('Module'))[0];
    const modulePath = `${path.join(path.dirname(mainPath), moduleImport.moduleSpec)}.ts`;
    if (!host.exists(modulePath)) {
        throw new Error(`Cannot find '${modulePath}'`);
    }
    const moduleSourceText = host.read(modulePath).toString('utf-8');
    const moduleSource = ts.createSourceFile(modulePath, moduleSourceText, ts.ScriptTarget.Latest, true);
    const bootstrapComponentClassName = getBootstrapComponent(moduleSource, moduleClassName);
    const bootstrapComponentFileName = `./${path.join(path.dirname(moduleImport.moduleSpec), `${name_utils_1.toFileName(bootstrapComponentClassName.substring(0, bootstrapComponentClassName.length - 9))}.component`)}`;
    return {
        moduleSpec: moduleImport.moduleSpec,
        mainPath,
        modulePath,
        moduleSource,
        moduleClassName,
        bootstrapComponentClassName,
        bootstrapComponentFileName
    };
}
exports.readBootstrapInfo = readBootstrapInfo;
function addClass(source, modulePath, clazzName, clazzSrc) {
    if (!findClass(source, clazzName, true)) {
        const nodes = ast_utils_1.findNodes(source, ts.SyntaxKind.ClassDeclaration);
        return ast_utils_1.insertAfterLastOccurrence(nodes, offset(clazzSrc, 0, true), modulePath, 0, ts.SyntaxKind.ClassDeclaration);
    }
    return new change_1.NoopChange();
}
exports.addClass = addClass;
/**
 * e.g
 * ```ts
 *   export type <Feature>Actions = <Feature> | Load<Feature>s | <Feature>sLoaded | <Feature>sLoadError;
 * ```
 */
function addUnionTypes(source, modulePath, typeName, typeValues) {
    const target = findNodesOfType(source, ts.SyntaxKind.TypeAliasDeclaration, it => it.name.getText() === typeName);
    if (!target) {
        throw new Error(`Cannot find union type '${typeName}'`);
    }
    const node = target.type;
    // Append new types to create a union type...
    return new change_1.InsertChange(modulePath, node.end, ['', ...typeValues].join(' | '));
}
exports.addUnionTypes = addUnionTypes;
/**
 * Add 1..n enumerators using name + (optional) value pairs
 */
function addEnumeratorValues(source, modulePath, enumName, pairs = []) {
    const target = findNodesOfType(source, ts.SyntaxKind.EnumDeclaration, it => it.name.getText() === enumName);
    const list = target ? target.members : undefined;
    if (!target) {
        throw new Error(`Cannot find enum '${enumName}'`);
    }
    const addComma = !(list.hasTrailingComma || list.length === 0);
    return pairs.reduce((buffer, it) => {
        const member = it.value ? `${it.name} = '${it.value}'` : it.name;
        const memberExists = () => {
            return list.filter(m => m.name.getText() === it.name).length;
        };
        if (memberExists()) {
            throw new Error(`Enum '${enumName}.${it.name}' already exists`);
        }
        return [
            ...buffer,
            new change_1.InsertChange(modulePath, list.end, (addComma ? ', ' : '') + member)
        ];
    }, []);
}
exports.addEnumeratorValues = addEnumeratorValues;
/**
 * Find Enum declaration in source based on name
 * e.g.
 *    export enum ProductsActionTypes {
 *       ProductsAction = '[Products] Action'
 *    }
 */
const IDENTITY = a => a;
function findNodesOfType(source, kind, predicate, extract = IDENTITY, firstOnly = true) {
    const nodes = ast_utils_1.findNodes(source, kind);
    const matching = nodes.filter((i) => predicate(i)).map(extract);
    return matching.length ? (firstOnly ? matching[0] : matching) : undefined;
}
exports.findNodesOfType = findNodesOfType;
function createOrUpdate(host, localPath, content) {
    if (host.exists(localPath)) {
        host.overwrite(localPath, content);
    }
    else {
        host.create(localPath, content);
    }
}
exports.createOrUpdate = createOrUpdate;
function insertImport(source, fileToEdit, symbolName, fileName, isDefault = false) {
    const rootNode = source;
    const allImports = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter(node => {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        const importFiles = node
            .getChildren()
            .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
            .map(n => n.text);
        return importFiles.filter(file => file === fileName).length === 1;
    });
    if (relevantImports.length > 0) {
        let importsAsterisk = false;
        // imports from import file
        const imports = [];
        relevantImports.forEach(n => {
            Array.prototype.push.apply(imports, ast_utils_1.findNodes(n, ts.SyntaxKind.Identifier));
            if (ast_utils_1.findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk) {
            return new change_1.NoopChange();
        }
        const importTextNodes = imports.filter(n => n.text === symbolName);
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            const _fallbackPos = ast_utils_1.findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                ast_utils_1.findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return ast_utils_1.insertAfterLastOccurrence(imports, `, ${symbolName}`, fileToEdit, _fallbackPos);
        }
        return new change_1.NoopChange();
    }
    // no such import declaration exists
    const useStrict = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter((n) => n.text === 'use strict');
    let fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    const open = isDefault ? '' : '{ ';
    const close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    const insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    const separator = insertAtBeginning ? '' : ';\n';
    const toInsert = `${separator}import ${open}${symbolName}${close}` +
        ` from '${fileName}'${insertAtBeginning ? ';\n' : ''}`;
    return ast_utils_1.insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
function getDecoratorPropertyValueNode(localHost, modulePath, identifier, property, module) {
    const moduleSourceText = localHost.read(modulePath).toString('utf-8');
    const moduleSource = ts.createSourceFile(modulePath, moduleSourceText, ts.ScriptTarget.Latest, true);
    const templateNode = getMatchingProperty(moduleSource, property, identifier, module);
    return templateNode.getChildAt(templateNode.getChildCount() - 1);
}
exports.getDecoratorPropertyValueNode = getDecoratorPropertyValueNode;
function replaceNodeValue(host, modulePath, node, content) {
    insert(host, modulePath, [
        new change_1.ReplaceChange(modulePath, node.getStart(node.getSourceFile()), node.getFullText(), content)
    ]);
}
exports.replaceNodeValue = replaceNodeValue;
//# sourceMappingURL=ast-utils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const testing_1 = require("@angular-devkit/schematics/testing");
const fs_1 = require("fs");
const path_1 = require("path");
const core_1 = require("../../../node_modules/@angular-devkit/core");
// SchematicTestRunner needs an absolute path to the collection to test.
const collectionPath = path_1.join(__dirname, '../../collection.json');
const rootPath = path_1.join(__dirname, '../../..');
describe('nestjs-entity', () => {
    it('requires required option', () => {
        // We test that
        const runner = new testing_1.SchematicTestRunner('schematics', collectionPath);
        const tree = runner.runSchematic('nestjs-entity', {
            name: 'test-entity',
            root: "fixtures/nestjs/entity",
            username: 'demo',
            email: 'demo@demo.demo',
            fields: '[name]',
            time: 1533634559618
        }, schematics_1.Tree.empty());
        tree.getDir('')
            .visit(filePath => {
            if (core_1.basename(filePath).indexOf('.env') == -1) {
                const content = tree.readContent(filePath);
                const existsContent = fs_1.readFileSync(path_1.join(rootPath, filePath)).toString();
                expect(content).toEqual(existsContent);
            }
        });
    });
});
//# sourceMappingURL=index_spec.js.map
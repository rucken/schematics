import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { basename } from '../../../node_modules/@angular-devkit/core';


// SchematicTestRunner needs an absolute path to the collection to test.
const collectionPath = join(__dirname, '../../collection.json');
const rootPath = join(__dirname, '../../..');


describe('angular-entity', () => {
  it('requires required option', () => {
    // We test that

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('angular-entity', {
      name: 'test-entity',
      root: "fixtures/angular/entity",
      username: 'demo',
      email: 'demo@demo.demo',
      fields: '[name]'
    }, Tree.empty());
    tree.getDir('')
      .visit(filePath => {
        if (basename(filePath).indexOf('.env') == -1) {
          const content = tree.readContent(filePath);
          const existsContent = readFileSync(
            join(rootPath, filePath)
          ).toString();
          expect(content).toEqual(existsContent);
        }
      });
  });
});

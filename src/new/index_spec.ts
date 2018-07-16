import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import { join, basename } from 'path';


// SchematicTestRunner needs an absolute path to the collection to test.
const collectionPath = join(__dirname, '../collection.json');
const rootPath = join(__dirname, '../..');


describe('new', () => {
  it('requires required option', () => {
    // We test that

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('new', {
      name: 'demo',
      root: "fixtures/new"
    }, Tree.empty());
    tree.getDir('')
      .visit(filePath => {
        if (basename(filePath) !== 'index.ts') {
          const content = tree.readContent(filePath);
          const existsContent = readFileSync(
            join(rootPath, filePath)
          ).toString();
          expect(content).toEqual(existsContent);
        }
      });
  });
});

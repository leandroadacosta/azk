import { fs, config } from 'azk';
import { Manifest, System, file_name } from 'azk/manifest';
import { createSync as createCache } from 'fscache';
import { ManifestError, ManifestRequiredError, SystemNotFoundError } from 'azk/utils/errors';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');
var path = require('path');

describe("Azk manifest class", function() {
  describe("in a valid azk project folder", function() {
    var project, manifest;

    before(function() {
      return h.mockManifest({}).then((dir) => {
        project  = dir;
        manifest = new Manifest(dir);
      });
    });

    it("should find manifest in root project folder", function() {
      h.expect(manifest).to.have.property('file', path.join(project, file_name));
      h.expect(manifest).to.have.property('manifestPath', path.join(project));
      h.expect(manifest).to.have.property('manifestDirName', path.basename(project));
    });

    it("should find manifest in subfolder", function() {
      var man = new Manifest(path.join(project, "src"));
      h.expect(manifest).to.have.property('file', manifest.file);
    });

    it("should parse manifest file", function() {
      h.expect(manifest).to.have.property('systems')
        .and.have.property('example');
    });

    it("should calculate a namespace", function() {
      h.expect(manifest).to.have.property('namespace')
        .and.length(10);
    });

    it("should set a default system", function() {
      h.expect(manifest).to.have.property('systemDefault')
        .and.eql(manifest.system('example'));
    });

    it("should parse systems to System class", function() {
      h.expect(manifest.system('example')).to.instanceof(System);
    });

    it("should support meta data", function() {
      manifest.setMeta('anykey', 'anyvalue');
      h.expect(manifest.getMeta('anykey')).to.equal('anyvalue');
    });

    it("should raise an error if not found a required system", function() {
      var func = () => manifest.system("not_found_system", true);
      h.expect(func).to.throw(SystemNotFoundError, /not_found_system/);
    });
  });

  describe("in a directory", function() {
    var project;

    before(() => {
      return h.tmp_dir({ prefix: "azk-test-" }).then((dir) => project = dir);
    });

    it("should return not found manifest", function() {
      h.expect(Manifest.find_manifest(project)).to.equal(null);
      var manifest = new Manifest(project);
      h.expect(manifest).to.have.property("exist").and.fail;
    });

    it("should require a cwd in new manifest", function() {
      var func = () => new Manifest(null, true);
      h.expect(func).to.throw(Error, /require.*path/);
    });

    it("should raise an error if manifest is required", function() {
      var func = () => { new Manifest(project, true) };
      h.expect(func).to.throw(
        ManifestRequiredError, RegExp(h.escapeRegExp(project))
      );
    });

    it("should be make a fake manifest", function() {
      var manifest = Manifest.makeFake(project, default_img);
      var system   = manifest.systemDefault;
      h.expect(manifest).to.instanceof(Manifest);
      h.expect(manifest).to.have.property("cwd" , project);
      h.expect(manifest).to.have.property("file", path.join(project, config("manifest")));
      h.expect(system).to.have.property("name", "__tmp__");
      h.expect(system).to.have.deep.property("image.name", default_img);
    });

    it("should support meta data in fake manifest", function() {
      var manifest = Manifest.makeFake(project, default_img);
      manifest.setMeta('anykey', 'anyvalue');
      h.expect(manifest.getMeta('anykey')).to.equal('anyvalue');
    });
  });

  describe("in a not manifest with a valid syntax", function() {
    var project;

    before(() => {
      return h.tmp_dir({ prefix: "azk-test-" }).then((dir) => project = dir);
    });

    it("should raise a sytax error", function() {
      fs.writeFileSync(path.join(project, file_name), "var a; \n var = ;");
      var func = () => { var manifest = new Manifest(project); };
      h.expect(func).to.throw(ManifestError).and.match(/Unexpected token =/);
    });

    it("should raise invalid function error", function() {
      fs.writeFileSync(path.join(project, file_name), "__not_exist()");
      var func = () => { var manifest = new Manifest(project); };
      h.expect(func).to.throw(ManifestError).and.match(/ReferenceError: __not_exist is not defined/);
    });
  });
});

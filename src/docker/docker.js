import { Q, pp, config, path, _, log } from 'azk';
import Utils from 'azk/utils';
import { parseRepositoryTag } from 'dockerode/lib/util';

var uuid = require('node-uuid');

// Composer
import { pull } from 'azk/docker/pull';
import { run  } from 'azk/docker/run';

export class Image extends Utils.qify('dockerode/lib/image') {
  static parseRepositoryTag(...args) {
    return parseRepositoryTag(...args);
  }
}

export class Container extends Utils.qify('dockerode/lib/container') {
  static generateName(ns) {
    var id = uuid.v1().replace(/-/g, "").slice(0, 10);
    return `${config('docker:namespace')}.${ns}.${id}`;
  }
}

export class Docker extends Utils.qify('dockerode') {
  constructor(opts) {
    log.info("Connect %s:%s", opts.host, opts.port);
    super(opts);
  }

  getImage(name) {
    return new Image(this.modem, name);
  }

  getContainer(id) {
    return new Container(this.modem, id);
  }

  __findObj(obj) {
    return obj.inspect().then(
      (_data) => { return obj; },
      (err  ) => {
        if (err.statusCode == 404)
          return null;
        throw err;
      }
    );
  }

  findImage(name) {
    return this.__findObj(this.getImage(name));
  }

  findContainer(id) {
    return this.__findObj(this.getContainer(id));
  }

  pull(...args) {
    return pull(this, ...args);
  }

  run(...args) {
    return run(this, Container, ...args);
  }

  // TODO: Add test
  resolvePath(target) {
    target = Utils.resolve(target);
    if (config('agent:requires_vm')) {
      target = path.join(config('agent:vm:mount_point'), target);
    }

    return target;
  }
}

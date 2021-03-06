import docker from 'azk/docker';
import { Q, Azk, pp, _, config, t, defer } from 'azk';

export function extend(Helpers) {
  // Filters
  var c_regex = RegExp(`\/${Helpers.escapeRegExp(config('docker:namespace'))}`);
  var filter_containers = (container) => {
    return container.Names[0].match(c_regex);
  }

  var t_regexs = [
    RegExp(`${Helpers.escapeRegExp(config('docker:image_empty'))}`),
    RegExp(`${Helpers.escapeRegExp(config('docker:repository'))}`),
  ]
  var filter_tags = (tag) => {
    return _.some(t_regexs, (regex) => { return tag.match(regex) });
  }

  Helpers.remove_containers = function() {
    return defer((done) => {
      return docker.listContainers({ all: true }).then((containers) => {
        containers = _.filter(containers, filter_containers);
        done.notify(t('test.remove_containers', containers.length));
        return Q.all(_.map(containers, (container) => {
          var c = docker.getContainer(container.Id);
          c.kill();
          return c.remove({ force: true });
        }));
      });
    });
  }

  Helpers.remove_images = function() {
    return defer((done) => {
      return docker.listImages().then((images) => {
        var tags = _.flatten(_.map(
          images, (image) => { return image.RepoTags }
        ));

        tags = _.filter(tags, filter_tags);
        done.notify(t('test.remove_images', tags.length));

        return Q.all(_.map(tags, (tag) => {
          return docker.getImage(tag).remove();
        }));
      });
    });
  }

  // Remove all containers before run
  before(function() {
    this.timeout(0);
    var progress = (event) => console.log(`  ${event}`);
    var funcs = [
      Helpers.remove_containers,
      Helpers.remove_images,
      () => console.log("\n")
    ]
    return funcs.reduce(Q.when, Q()).progress(progress);
  });
}

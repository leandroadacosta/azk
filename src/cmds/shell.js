import { _, path, config, t, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

class Cmd extends Command {
  action(opts, extras) {
    var progress = Helpers.newPullProgress(this);

    return async(this, function* () {
      var cmd = [opts.cmd, ...opts.__leftover];
      var dir = this.cwd;
      var env = {};

      yield Helpers.requireAgent();

      if (opts.image) {
        // Arbitrary image
        var manifest = Manifest.makeFake(dir, opts.image);
        var system   = manifest.systemDefault;
      } else {
        var manifest = new Manifest(dir, true);
        var system   = manifest.systemDefault;
        if (opts.system) system = manifest.system(opts.system, true);
      }

      var tty_default = opts.t || !_.isString(opts.command)
      var tty = (opts.T) ? (opts.t || false) : tty_default;

      var options  = {
        interactive: tty,
        pull   : this.stdout(),
        stdout : this.stdout(),
        stderr : this.stderr(),
        stdin  : this.stdin(),
        workdir: opts.cwd || null,
        volumes: {},
        env: {},
      }

      for(var i = 0; i < opts.mount.length; i++) {
        var point = opts.mount[i];
        if (point.match(".*:.*")) {
          point    = point.split(':')
          point[0] = path.resolve(this.cwd, point[0]);
          options.volumes[point[0]] = point[1];
        } else {
          this.fail('commands.shell.invalid_mount', { point });
          return 1;
        }
      }

      for(var j = 0; j < opts.env.length; j++) {
        var variable = opts.env[i];
        if (variable.match(".*=.*")) {
          variable = variable.split('=')
          options.env[variable[0]] = variable[1];
        } else {
          this.fail('commands.shell.invalid_env', { variable });
          return 1;
        }
      }

      var cmd = [opts.shell];
      if (opts.command) {
        cmd.push("-c");
        cmd.push(opts.command);
      }

      return yield system.exec(cmd, options);
    }).progress(progress);
  }
}

export function init(cli) {
  (new Cmd('shell', cli))
    .addOption(['-T'])
    .addOption(['-t'])
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--image', '-i'], { type: String })
    .addOption(['--command', '-c'], { type: String })
    .addOption(['--shell'], { default: "/bin/sh", type: String })
    .addOption(['--cwd', '-C'], { type: String })
    .addOption(['--mount', '-m'], { type: String, acc: true, default: [] })
    .addOption(['--env', '-e'], { type: String, acc: true, default: [] })
    .addOption(['--verbose', '-v'])
    .addExamples(t("commands.shell.examples"))
}

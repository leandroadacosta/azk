var printf = require('printf');
var path   = require('path');
import { t } from 'azk';

var BASE_CODE_ERROR     = 1;
var MANIFEST_CODE_ERROR = 2;
var SYSTEMS_CODE_ERROR  = 3;
var IMAGES_CODE_ERROR   = 4;
var AGENT_CODE_ERROR    = 5;

export {
  BASE_CODE_ERROR,
  MANIFEST_CODE_ERROR,
  SYSTEMS_CODE_ERROR ,
  IMAGES_CODE_ERROR  ,
  AGENT_CODE_ERROR,
}

export class AzkError extends Error {
  constructor(translation_key) {
    this.translation_key = translation_key;
  }

  get message() {
    return this.toString();
  }

  toString() {
    return t('errors.' + this.translation_key, this);
  }
}

export class ImageNotExistError extends AzkError {
  constructor(image) {
    super('image_not_exist');
    this.image = image;
  }
}

export class ProvisionNotFound extends AzkError {
  constructor(image) {
    super('provision_not_found');
    this.image = image;
  }
}

export class InvalidOptionError extends AzkError {
  constructor(option, key = 'invalid_option_error') {
    super(key);
    this.option = option;
  }
}

export class InvalidValueError extends InvalidOptionError {
  constructor(option, value) {
    super(option, "invalid_value_error");
    this.value   = value;
  }
}

export class ProvisionPullError extends AzkError {
  constructor(image, msg) {
    super('provision_pull_error')
    this.image = image;
    this.msg   = msg;
  }
}

export class RequiredOptionError extends AzkError {
  constructor(option) {
    super('required_option_error');
    this.option  = option;
  }
}

export class SystemDependError extends AzkError {
  constructor(system, depend) {
    super('system_depend_error');
    this.system = system;
    this.depend = depend;
    this.code   = SYSTEMS_CODE_ERROR;
  }
}

export class ImageNotAvailable extends AzkError {
  constructor(system, image) {
    super('image_not_available');
    this.system = system;
    this.image  = image;
    this.code   = IMAGES_CODE_ERROR;
  }
}

export class RunCommandError extends AzkError {
  constructor(command, output) {
    super('run_command_error');

    this.command = command;
    this.output  = output;
    this.code    = SYSTEMS_CODE_ERROR;
  }
}

export class ManifestRequiredError extends AzkError {
  constructor(cwd) {
    super('manifest_required');

    this.cwd  = cwd;
    this.code = MANIFEST_CODE_ERROR;
  }
}

export class ManifestError extends AzkError {
  constructor(file, err_message) {
    super('manifest_error');

    this.file = file;
    this.err_message = err_message;
    this.code = MANIFEST_CODE_ERROR;
  }
}

export class SystemNotFoundError extends AzkError {
  constructor(manifest, system) {
    super('system_not_found');

    this.manifest = manifest;
    this.system   = system;
    this.code     = SYSTEMS_CODE_ERROR;
  }
}

export class NotBeenImplementedError extends AzkError {
  constructor(feature) {
    super('not_been_implemented');

    this.feature = feature;
    this.code    = BASE_CODE_ERROR;
  }
}

export class AgentNotRunning extends AzkError {
  constructor() {
    super('agent_not_running');
    this.code = AGENT_CODE_ERROR;
  }
}

export class AgentStartError extends AzkError {
  constructor(error) {
    super('agent_start');

    this.__error = __error;
    this.code    = AGENT_CODE_ERROR;
  }

  get error() {
    return this.__error.stack || this.__error;
  }
}

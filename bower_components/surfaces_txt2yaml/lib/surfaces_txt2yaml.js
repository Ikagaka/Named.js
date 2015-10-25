// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */
var SurfacesTxt2Yaml, clone, copy, jsyaml,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

clone = function(src) {
  var key, ret;
  if ((src == null) || typeof src !== 'object') {
    return src;
  }
  ret = new src.constructor();
  for (key in src) {
    ret[key] = clone(src[key]);
  }
  return ret;
};

copy = function(source, destination) {
  var key, _results;
  if ((source instanceof Object) && (!(source instanceof Array))) {
    _results = [];
    for (key in source) {
      if ((destination[key] != null) && destination[key] instanceof Object) {
        _results.push(copy(source[key], destination[key]));
      } else {
        _results.push(destination[key] = clone(source[key]));
      }
    }
    return _results;
  } else {
    return destination = clone(source);
  }
};

if (typeof exports !== "undefined" && exports !== null) {
  exports.clone = clone;
  exports.copy = copy;
}


/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

if (typeof require !== "undefined" && require !== null) {
  jsyaml = require('js-yaml');
}

SurfacesTxt2Yaml = {};

SurfacesTxt2Yaml.Parser = (function() {
  function Parser(options) {
    this.options = {
      comment_prefix: ['//']
    };
    this.set_options({
      compatible: 'ssp'
    });
    if (options != null) {
      this.set_options(options);
    }
  }

  Parser.prototype.set_options = function(options) {
    var name, prefix, value;
    if (options.compatible === 'materia') {
      this.options.charset = false;
      this.options.surface_definition = 'materia';
      this.options.check_seriko = 'warn';
      this.options.allow_all_seriko = false;
      this.options.check_surface_scope_duplication = 'warn';
      this.options.check_nonstandard_comment = 'warn';
    } else if (options.compatible === 'ssp') {
      this.options.charset = true;
      this.options.surface_definition = 'ssp';
      this.options.check_seriko = 'warn';
      this.options.allow_all_seriko = false;
      this.options.check_surface_scope_duplication = 'warn';
      this.options.check_nonstandard_comment = 'warn';
    } else if (options.compatible === 'ssp-lazy') {
      this.options.charset = true;
      this.options.surface_definition = 'ssp-lazy';
      this.options.check_seriko = 'warn';
      this.options.allow_all_seriko = true;
      this.options.check_surface_scope_duplication = 'warn';
      this.options.check_nonstandard_comment = 'warn';
    }
    for (name in options) {
      value = options[name];
      this.options[name] = value;
    }
    return this.options.standard_comment_re = new RegExp('^\\s*(?:' + ((function() {
      var _i, _len, _ref, _results;
      _ref = this.options.comment_prefix;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        _results.push(prefix.replace(/\W/, '\\$&'));
      }
      return _results;
    }).call(this)).join('|') + ')|^\s*$');
  };

  Parser.prototype.parse = function(txt) {
    var character, data, id, in_scope, index, line, lines, parsed_data, range, range_result, ranges, region_id, regions, result, scope, scope_begin, scope_content, scope_id, scope_id_delete, scope_id_str, scope_id_uniq, scope_id_value, scope_parser, setting, settings, surface, tooltip, type, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    parsed_data = {};
    lines = txt.split(/\r?\n/);
    scope = null;
    scope_id = null;
    scope_id_str = null;
    in_scope = false;
    scope_begin = null;
    scope_content = [];
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      this.index = index;
      result = null;
      if (!in_scope) {
        if (this.options.charset && (result = line.match(/^\s*charset,(.+)$/))) {
          if (parsed_data.charset != null) {
            this["throw"]('charset duplication found');
          }
          parsed_data.charset = result[1];
        } else if ((this.options.surface_definition === 'materia' && (result = line.match(/^(?:(descript)|(surface)(\d+(?:,surface\d+)*)|(sakura|kero\d+)\.(surface\.alias))\s*({)?\s*$/))) || (this.options.surface_definition === 'ssp' && (result = line.match(/^\s*(?:(descript)|(surface(?:\.append)?)(!?(?:\d+-)?\d+(?:\s*,\s*(?:surface|!)?(?:\d+-)?\d+)*)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/))) || (this.options.surface_definition === 'ssp-lazy' && (result = line.match(/^\s*(?:(descript)|(surface(?:\.append)?)(.+)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/)))) {
          if (result[1] === 'descript') {
            scope = 'descript';
          } else if ((result[2] === 'surface') || (result[2] === 'surface.append')) {
            scope = 'surface';
            scope_id_uniq = {};
            scope_id_delete = {};
            scope_id_str = 'surface' + result[3];
            ranges = result[3].split(/[^0-9!]*,\s*(?:surface(?:\.append)?)?/);
            for (_j = 0, _len1 = ranges.length; _j < _len1; _j++) {
              range = ranges[_j];
              range_result = null;
              if (range_result = range.match(/^(\d+)-(\d+)$/)) {
                for (id = _k = _ref = range_result[1], _ref1 = range_result[2]; _ref <= _ref1 ? _k <= _ref1 : _k >= _ref1; id = _ref <= _ref1 ? ++_k : --_k) {
                  scope_id_uniq['surface' + id] = true;
                }
              } else if (range.match(/^\d+$/)) {
                scope_id_uniq['surface' + range] = true;
              } else if (range_result = range.match(/^!(\d+)-(\d+)$/)) {
                for (id = _l = _ref2 = range_result[1], _ref3 = range_result[2]; _ref2 <= _ref3 ? _l <= _ref3 : _l >= _ref3; id = _ref2 <= _ref3 ? ++_l : --_l) {
                  scope_id_delete['surface' + id] = true;
                }
              } else if (range_result = range.match(/^!(\d+)$/)) {
                scope_id_delete['surface' + range_result[1]] = true;
              } else if (!this.options.surface_definition === 'ssp-lazy') {
                this["throw"]('wrong surface range "' + range + '" in : ' + line);
              }
            }
            for (scope_id_value in scope_id_delete) {
              delete scope_id_uniq[scope_id_value];
            }
            if (result[2] === 'surface.append') {
              for (scope_id_value in scope_id_uniq) {
                if (parsed_data[scope][scope_id_value] == null) {
                  delete scope_id_uniq[scope_id_value];
                }
              }
            }
            scope_id = Object.keys(scope_id_uniq);
          } else {
            scope = result[5];
            scope_id = result[4];
          }
          if (result[result.length - 1] === '{') {
            in_scope = true;
            scope_begin = index + 1;
          }
        } else if (result = line.match(/^\s*{\s*$/)) {
          if (scope != null) {
            in_scope = true;
            scope_begin = index + 1;
          } else {
            this["throw"]('scope bracket begun before scope name');
          }
        } else if (this.options.check_nonstandard_comment && !line.match(this.options.standard_comment_re)) {
          this.warnthrow('invalid line found in scope outside : ' + line, this.options.check_nonstandard_comment);
        }
      } else if (result = line.match(/^\s*}\s*$/)) {
        if (parsed_data[scope] == null) {
          parsed_data[scope] = {};
        }
        scope_parser = new SurfacesTxt2Yaml.ScopeParser[scope](this.options, (_ref4 = parsed_data.descript) != null ? _ref4.version : void 0);
        data = scope_parser.parse(scope_content, scope_begin);
        if (scope_id != null) {
          if (scope_id instanceof Array) {
            if (parsed_data[scope][scope_id_str] == null) {
              parsed_data[scope][scope_id_str] = {};
            }
            copy(data, parsed_data[scope][scope_id_str]);
            for (_m = 0, _len2 = scope_id.length; _m < _len2; _m++) {
              scope_id_value = scope_id[_m];
              if (parsed_data[scope][scope_id_value] == null) {
                parsed_data[scope][scope_id_value] = {};
              }
              if (scope_id_str !== scope_id_value) {
                if (parsed_data[scope][scope_id_value].base == null) {
                  parsed_data[scope][scope_id_value].base = [];
                }
                if (-1 === parsed_data[scope][scope_id_value].base.indexOf(scope_id_str)) {
                  parsed_data[scope][scope_id_value].base.push(scope_id_str);
                }
              }
            }
          } else {
            if (parsed_data[scope][scope_id] == null) {
              parsed_data[scope][scope_id] = {};
            }
            copy(data, parsed_data[scope][scope_id]);
          }
        } else {
          copy(data, parsed_data[scope]);
        }
        scope = null;
        scope_id = null;
        scope_id_str = null;
        in_scope = false;
        scope_begin = null;
        scope_content = [];
      } else {
        scope_content.push(line);
      }
    }
    if (in_scope) {
      this["throw"]('scope is not closed (missing closing bracket)');
    }
    delete this.index;
    if (parsed_data.surface != null) {
      parsed_data.surfaces = parsed_data.surface;
      delete parsed_data.surface;
      _ref5 = parsed_data.surfaces;
      for (id in _ref5) {
        surface = _ref5[id];
        result = null;
        if (result = id.match(/^surface(\d+)$/)) {
          surface.is = result[1] - 0;
        }
      }
    }
    if (parsed_data['surface.alias'] != null) {
      parsed_data.aliases = parsed_data['surface.alias'];
      delete parsed_data['surface.alias'];
    }
    if (parsed_data.cursor != null) {
      if (parsed_data.regions == null) {
        parsed_data.regions = {};
      }
      _ref6 = parsed_data.cursor;
      for (character in _ref6) {
        settings = _ref6[character];
        if (parsed_data.regions[character] == null) {
          parsed_data.regions[character] = {};
        }
        for (type in settings) {
          setting = settings[type];
          if (parsed_data.regions[character][setting.region_id] == null) {
            parsed_data.regions[character][setting.region_id] = {};
          }
          if (parsed_data.regions[character][setting.region_id].cursor == null) {
            parsed_data.regions[character][setting.region_id].cursor = {};
          }
          parsed_data.regions[character][setting.region_id].cursor[type] = setting.file;
        }
      }
      delete parsed_data.cursor;
    }
    if (parsed_data.tooltips != null) {
      if (parsed_data.regions == null) {
        parsed_data.regions = {};
      }
      _ref7 = parsed_data.tooltips;
      for (character in _ref7) {
        regions = _ref7[character];
        if (parsed_data.regions[character] == null) {
          parsed_data.regions[character] = {};
        }
        for (region_id in regions) {
          tooltip = regions[region_id];
          if (parsed_data.regions[character][region_id] == null) {
            parsed_data.regions[character][region_id] = {};
          }
          parsed_data.regions[character][region_id].tooltip = tooltip;
        }
      }
      delete parsed_data.tooltips;
    }
    return parsed_data;
  };

  Parser.prototype.warn = function(message) {
    var mes;
    mes = '[WARNING] line ' + (this.index + 1) + ': ' + message;
    return console.warn(mes);
  };

  Parser.prototype["throw"] = function(message) {
    var mes;
    mes = '[ERROR] line ' + (this.index + 1) + ': ' + message;
    if (this.options.lint) {
      return console.warn(mes);
    } else {
      throw mes;
    }
  };

  Parser.prototype.warnthrow = function(message, warnthrow) {
    if (warnthrow) {
      if (warnthrow === 'warn') {
        return this.warn(message);
      } else {
        return this["throw"](message);
      }
    }
  };

  return Parser;

})();

SurfacesTxt2Yaml.ScopeParser = {};

SurfacesTxt2Yaml.ScopeParser.Single = (function() {
  function Single(options) {
    this.options = {};
    if (options != null) {
      this.set_options(options);
    }
  }

  Single.prototype.set_options = function(options) {
    var name, prefix, value;
    for (name in options) {
      value = options[name];
      this.options[name] = value;
    }
    return this.options.standard_comment_re = new RegExp('^\\s*(?:' + ((function() {
      var _i, _len, _ref, _results;
      _ref = this.options.comment_prefix;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        _results.push(prefix.replace(/\W/, '\\$&'));
      }
      return _results;
    }).call(this)).join('|') + ')|^\s*$');
  };

  Single.prototype.parse = function(lines, index_offset) {
    var data, index, line, result, _i, _len;
    this.index_offset = index_offset;
    data = {};
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      this.index = index;
      result = null;
      if (result = line.match(this.condition.test)) {
        this.condition.match.call(this, data, result);
      } else if (this.options.check_nonstandard_comment && !line.match(this.options.standard_comment_re)) {
        this.warnthrow('invalid line found in scope inside : ' + line, this.options.check_nonstandard_comment);
      }
    }
    delete this.index_offset;
    delete this.index;
    return data;
  };

  Single.prototype.warn = function(message) {
    var mes;
    mes = '[WARNING] line ' + (this.index_offset + this.index + 1) + ': ' + message;
    console.warn(mes);
  };

  Single.prototype["throw"] = function(message) {
    var mes;
    mes = '[ERROR] line ' + (this.index_offset + this.index + 1) + ': ' + message;
    if (this.options.lint) {
      console.warn(mes);
    } else {
      throw mes;
    }
  };

  Single.prototype.warnthrow = function(message, warnthrow) {
    if (warnthrow) {
      if (warnthrow === 'warn') {
        return this.warn(message);
      } else {
        return this["throw"](message);
      }
    }
  };

  return Single;

})();

SurfacesTxt2Yaml.ScopeParser.Multiple = (function(_super) {
  __extends(Multiple, _super);

  function Multiple() {
    return Multiple.__super__.constructor.apply(this, arguments);
  }

  Multiple.prototype.parse = function(lines, index_offset) {
    var condition, data, index, line, match, result, _i, _j, _len, _len1, _ref;
    this.index_offset = index_offset;
    data = {};
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      this.index = index;
      result = null;
      match = false;
      _ref = this.conditions;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        condition = _ref[_j];
        if (result = line.match(condition.test)) {
          match = condition.match.call(this, data, result);
          if (match) {
            break;
          }
        }
      }
      if (!match && this.options.check_nonstandard_comment && !line.match(this.options.standard_comment_re)) {
        this.warnthrow('invalid line found in scope inside : ' + line, this.options.check_nonstandard_comment);
      }
    }
    delete this.index_offset;
    delete this.index;
    return data;
  };

  return Multiple;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser.descript = (function(_super) {
  __extends(descript, _super);

  function descript() {
    return descript.__super__.constructor.apply(this, arguments);
  }

  descript.prototype.conditions = [
    {
      test: /^\s*version,([01])$/,
      match: function(data, result) {
        data.version = result[1] - 0;
        return true;
      }
    }, {
      test: /^\s*maxwidth,(\d+)$/,
      match: function(data, result) {
        data.maxwidth = result[1] - 0;
        return true;
      }
    }, {
      test: /^\s*(collision-sort|animation-sort),(.+)$/,
      match: function(data, result) {
        data[result[1]] = result[2];
        return true;
      }
    }
  ];

  return descript;

})(SurfacesTxt2Yaml.ScopeParser.Multiple);

SurfacesTxt2Yaml.ScopeParser.tooltips = (function(_super) {
  __extends(tooltips, _super);

  function tooltips() {
    return tooltips.__super__.constructor.apply(this, arguments);
  }

  tooltips.prototype.condition = {
    test: /^\s*([^,]+),(.+)$/,
    match: function(data, result) {
      return data[result[1]] = result[2];
    }
  };

  return tooltips;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser.cursor = (function(_super) {
  __extends(cursor, _super);

  function cursor() {
    return cursor.__super__.constructor.apply(this, arguments);
  }

  cursor.prototype.condition = {
    test: /^\s*(mouseup|mousedown)(\d+),([^,]+),(.+)$/,
    match: function(data, result) {
      return data[result[1]] = {
        region_id: result[3],
        file: result[4]
      };
    }
  };

  return cursor;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser['surface.alias'] = (function(_super) {
  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.condition = {
    test: /^\s*([^,]+),\[(.+)\]$/,
    match: function(data, result) {
      var id;
      return data[result[1]] = (function() {
        var _i, _len, _ref, _results;
        _ref = result[2].split(/\s*,\s*/);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          _results.push(id - 0);
        }
        return _results;
      })();
    }
  };

  return _Class;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser.surface = (function(_super) {
  __extends(surface, _super);

  function surface(options, seriko_version) {
    this.seriko_version = seriko_version != null ? seriko_version : 0;
    this.options = {};
    if (options != null) {
      this.set_options(options);
    }
  }

  surface.prototype.conditions = [
    {
      test: /^\s*element(\d+),([^,]+),([^,]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        return this.match_element(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.interval,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 0) {
          this.warnthrow('not SERIKO/1.x definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_interval(data, result);
      }
    }, {
      test: /^\s*(\d+)interval,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 1) {
          this.warnthrow('not SERIKO/2.0 definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_interval(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.option,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 0) {
          this.warnthrow('not SERIKO/1.x definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_option(data, result);
      }
    }, {
      test: /^\s*(\d+)option,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 1) {
          this.warnthrow('not SERIKO/2.0 definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_option(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.pattern(\d+),([^,]+),(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 0) {
          this.warnthrow('not SERIKO/1.x definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_pattern(data, result);
      }
    }, {
      test: /^\s*(\d+)pattern(\d+),([^,]+),([^,]+),([^,]+)(?:,(.+))?$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 1) {
          this.warnthrow('not SERIKO/2.0 definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_pattern_old(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collision(data.animations[id], result);
      }
    }, {
      test: /^\s*animation(\d+)\.collisionex(\d+),([^,]+),(rect|ellipse),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collisionex_4(data.animations[id], result);
      }
    }, {
      test: /^\s*animation(\d+)\.collisionex(\d+),([^,]+),(circle),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collisionex_3(data.animations[id], result);
      }
    }, {
      test: /^\s*animation(\d+)\.collisionex(\d+),([^,]+),polygon,(.+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collisionex_n(data.animations[id], result);
      }
    }, {
      test: /^\s*collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/,
      match: function(data, result) {
        return this.match_collision(data, result);
      }
    }, {
      test: /^\s*collisionex(\d+),([^,]+),(rect|ellipse),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        return this.match_collisionex_4(data, result);
      }
    }, {
      test: /^\s*collisionex(\d+),([^,]+),(circle),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        return this.match_collisionex_3(data, result);
      }
    }, {
      test: /^\s*collisionex(\d+),([^,]+),polygon,(.+)$/,
      match: function(data, result) {
        return this.match_collisionex_n(data, result);
      }
    }, {
      test: /^\s*point(?:\.(kinoko))?\.(center[xy]),([-0-9]+)$/,
      match: function(data, result) {
        var coordinate, id, type, _ref;
        _ref = result.slice(1, 4), id = _ref[0], type = _ref[1], coordinate = _ref[2];
        coordinate -= 0;
        if (data.points == null) {
          data.points = {};
        }
        if (id != null) {
          if (data.points[id] == null) {
            data.points[id] = {};
          }
          data.points[id][type] = coordinate;
        } else {
          data.points[type] = coordinate;
        }
        return true;
      }
    }, {
      test: /^\s*point\.basepos\.([xy]),([-0-9]+)$/,
      match: function(data, result) {
        var coordinate, type, _ref;
        _ref = result.slice(1, 3), type = _ref[0], coordinate = _ref[1];
        coordinate -= 0;
        if (data.points == null) {
          data.points = {};
        }
        if (data.points.basepos == null) {
          data.points.basepos = {};
        }
        data.points.basepos[type] = coordinate;
        return true;
      }
    }, {
      test: /^\s*(?:(sakura|kero)\.)?balloon\.(offset[xy]),([-0-9]+)$/,
      match: function(data, result) {
        var character, coordinate, type, _ref;
        _ref = result.slice(1, 4), character = _ref[0], type = _ref[1], coordinate = _ref[2];
        coordinate -= 0;
        if (data.balloons == null) {
          data.balloons = {};
        }
        if (character != null) {
          if (data.balloons[character] == null) {
            data.balloons[character] = {};
          }
          data.balloons[character][type] = coordinate;
        } else {
          data.balloons[type] = coordinate;
        }
        return true;
      }
    }
  ];

  surface.prototype.match_element = function(data, result) {
    var file, id, type, x, y, _is, _ref;
    _ref = result.slice(1, 6), _is = _ref[0], type = _ref[1], file = _ref[2], x = _ref[3], y = _ref[4];
    _is -= 0;
    x -= 0;
    y -= 0;
    id = 'element' + _is;
    if (data.elements == null) {
      data.elements = {};
    }
    if (data.elements[id] != null) {
      this.warnthrow('element id duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.elements[id] != null) {
        id = 'element' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.elements[id] = {
      is: _is,
      type: type,
      file: file,
      x: x,
      y: y
    };
    return true;
  };

  surface.prototype.match_animation_interval = function(data, result) {
    var id, interval, _is, _ref, _ref1, _ref2;
    _ref = result.slice(1, 3), _is = _ref[0], interval = _ref[1];
    _is -= 0;
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (((_ref1 = data.animations[id]) != null ? _ref1.interval : void 0) != null) {
      this.warnthrow('animation interval duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (((_ref2 = data.animations[id]) != null ? _ref2.interval : void 0) != null) {
        id = 'animation' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    data.animations[id].interval = interval;
    return true;
  };

  surface.prototype.match_animation_option = function(data, result) {
    var id, option, _is, _ref, _ref1, _ref2;
    _ref = result.slice(1, 3), _is = _ref[0], option = _ref[1];
    _is -= 0;
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (((_ref1 = data.animations[id]) != null ? _ref1.option : void 0) != null) {
      this.warnthrow('animation option duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (((_ref2 = data.animations[id]) != null ? _ref2.option : void 0) != null) {
        id = 'animation' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    data.animations[id].option = option;
    return true;
  };

  surface.prototype.match_animation_pattern = function(data, result) {
    var animation_id, arg, args, args_str, id, name, p_id, type, _is, _ref, _ref1, _ref2;
    _ref = result.slice(1, 5), _is = _ref[0], p_id = _ref[1], type = _ref[2], args_str = _ref[3];
    _is -= 0;
    p_id -= 0;
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    if (data.animations[id].patterns == null) {
      data.animations[id].patterns = [];
    }
    if (data.animations[id].patterns[p_id] != null) {
      this.warnthrow('animation pattern duplication found : ' + p_id, this.options.check_surface_scope_duplication);
      while (data.animations[id].patterns[p_id] != null) {
        ++p_id;
      }
      this.warnthrow(' replace to : ' + p_id, this.options.check_surface_scope_duplication);
    }
    data.animations[id].patterns[p_id] = {
      type: type
    };
    args = {};
    switch (type) {
      case 'overlay':
      case 'overlayfast':
      case 'reduce':
      case 'replace':
      case 'interpolate':
      case 'asis':
      case 'bind':
      case 'add':
      case 'reduce':
      case 'move':
        _ref1 = args_str.split(','), args.surface = _ref1[0], args.wait = _ref1[1], args.x = _ref1[2], args.y = _ref1[3];
        if (args.surface != null) {
          args.surface -= 0;
        }
        if ((args.wait != null) && !isNaN(args.wait)) {
          args.wait -= 0;
        }
        if (args.x != null) {
          args.x -= 0;
        }
        if (args.y != null) {
          args.y -= 0;
        }
        break;
      case 'base':
        _ref2 = args_str.split(','), args.surface = _ref2[0], args.wait = _ref2[1];
        if (args.surface != null) {
          args.surface -= 0;
        }
        if ((args.wait != null) && !isNaN(args.wait)) {
          args.wait -= 0;
        }
        break;
      case 'insert':
      case 'start':
      case 'stop':
        args.animation_id = 'animation' + args_str.match(/\[?(.*)\]?/)[1];
        break;
      case 'alternativestart':
      case 'alternativestop':
        args.animation_ids = (function() {
          var _i, _len, _ref3, _results;
          _ref3 = args_str.match(/[\(\[]?(.*)[\]\)]?/)[1].split(/[.,]/);
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            animation_id = _ref3[_i];
            _results.push('animation' + animation_id);
          }
          return _results;
        })();
    }
    for (name in args) {
      arg = args[name];
      if (arg != null) {
        data.animations[id].patterns[p_id][name] = arg;
      }
    }
    return true;
  };

  surface.prototype.match_animation_pattern_old = function(data, result) {
    var animation_id, arg, args, args_str, id, name, p_id, surface, type, wait, wait_result, _is, _ref, _ref1, _ref2, _ref3;
    _ref = result.slice(1, 7), _is = _ref[0], p_id = _ref[1], surface = _ref[2], wait = _ref[3], type = _ref[4], args_str = _ref[5];
    _is -= 0;
    p_id -= 0;
    surface -= 0;
    if (wait_result = wait.match(/(\d+)-(\d+)/)) {
      wait = (wait_result[1] * 10) + '-' + (wait_result[2] * 10);
    } else {
      wait *= 10;
    }
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    if (data.animations[id].patterns == null) {
      data.animations[id].patterns = [];
    }
    if (data.animations[id].patterns[p_id] != null) {
      this.warnthrow('animation pattern duplication found : ' + p_id, this.options.check_surface_scope_duplication);
      while (data.animations[id].patterns[p_id] != null) {
        ++p_id;
      }
      this.warnthrow(' replace to : ' + p_id, this.options.check_surface_scope_duplication);
    }
    data.animations[id].patterns[p_id] = {
      type: type
    };
    args = {};
    switch (type) {
      case 'overlay':
      case 'overlayfast':
      case 'reduce':
      case 'replace':
      case 'interpolate':
      case 'asis':
      case 'bind':
      case 'add':
      case 'reduce':
      case 'move':
        _ref1 = [surface, wait], args.surface = _ref1[0], args.wait = _ref1[1];
        if (args_str) {
          _ref2 = args_str.split(','), args.x = _ref2[0], args.y = _ref2[1];
          if (args.x != null) {
            args.x -= 0;
          }
          if (args.y != null) {
            args.y -= 0;
          }
        }
        break;
      case 'base':
        _ref3 = [surface, wait], args.surface = _ref3[0], args.wait = _ref3[1];
        break;
      case 'insert':
      case 'start':
      case 'stop':
        args.animation_id = 'animation' + args_str;
        break;
      case 'alternativestart':
      case 'alternativestop':
        args.animation_ids = (function() {
          var _i, _len, _ref4, _results;
          _ref4 = args_str.split(',');
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            animation_id = _ref4[_i];
            _results.push('animation' + animation_id);
          }
          return _results;
        })();
    }
    for (name in args) {
      arg = args[name];
      if (arg != null) {
        data.animations[id].patterns[p_id][name] = arg;
      }
    }
    return true;
  };

  surface.prototype.match_collision = function(data, result) {
    var bottom, id, left, name, right, top, _is, _ref;
    _ref = result.slice(1, 7), _is = _ref[0], left = _ref[1], top = _ref[2], right = _ref[3], bottom = _ref[4], name = _ref[5];
    _is -= 0;
    left -= 0;
    top -= 0;
    right -= 0;
    bottom -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collision duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.regions[id] = {
      is: _is,
      type: 'rect',
      name: name,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    };
    return true;
  };

  surface.prototype.match_collisionex_4 = function(data, result) {
    var bottom, id, left, name, right, top, type, _is, _ref;
    _ref = result.slice(1, 8), _is = _ref[0], name = _ref[1], type = _ref[2], left = _ref[3], top = _ref[4], right = _ref[5], bottom = _ref[6];
    _is -= 0;
    left -= 0;
    top -= 0;
    right -= 0;
    bottom -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collisionex duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.regions[id] = {
      is: _is,
      type: type,
      name: name,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    };
    return true;
  };

  surface.prototype.match_collisionex_3 = function(data, result) {
    var center_x, center_y, id, name, radius, type, _is, _ref;
    _ref = result.slice(1, 8), _is = _ref[0], name = _ref[1], type = _ref[2], center_x = _ref[3], center_y = _ref[4], radius = _ref[5];
    _is -= 0;
    center_x -= 0;
    center_y -= 0;
    radius -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collisionex duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.regions[id] = {
      is: _is,
      type: type,
      name: name,
      center_x: center_x,
      center_y: center_y,
      radius: radius
    };
    return true;
  };

  surface.prototype.match_collisionex_n = function(data, result) {
    var c, coordinate, coordinates, coordinates_str, id, index, name, _i, _is, _len, _ref, _ref1;
    _ref = result.slice(1, 4), _is = _ref[0], name = _ref[1], coordinates_str = _ref[2];
    _is -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collisionex duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    coordinates = [];
    coordinate = {};
    _ref1 = coordinates_str.split(',');
    for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
      c = _ref1[index];
      if (index % 2 === 0) {
        coordinate.x = c - 0;
      } else {
        coordinate.y = c - 0;
        coordinates.push(coordinate);
        coordinate = {};
      }
    }
    if (coordinate.x != null) {
      this["throw"]('odd number of collisionex coordinates');
    }
    data.regions[id] = {
      is: _is,
      type: 'polygon',
      name: name,
      coordinates: coordinates
    };
    return true;
  };

  return surface;

})(SurfacesTxt2Yaml.ScopeParser.Multiple);

SurfacesTxt2Yaml.txt_to_data = function(txt_str, options) {
  var parser;
  parser = new SurfacesTxt2Yaml.Parser(options);
  return parser.parse(txt_str);
};

SurfacesTxt2Yaml.txt_to_yaml = function(txt_str, options) {
  var data, e;
  data = SurfacesTxt2Yaml.txt_to_data(txt_str, options);
  try {
    return (jsyaml.dump(data, {
      indent: 4,
      flowLevel: 6
    })).replace(/"y"/g, 'y');
  } catch (_error) {
    e = _error;
    throw e;
  }
};

if (typeof exports !== "undefined" && exports !== null) {
  exports.Parser = SurfacesTxt2Yaml.Parser;
  exports.txt_to_data = SurfacesTxt2Yaml.txt_to_data;
  exports.txt_to_yaml = SurfacesTxt2Yaml.txt_to_yaml;
}

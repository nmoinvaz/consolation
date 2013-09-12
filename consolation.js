// A safer console object - see github.com/nathanl/consolation
safe_console = {
  enabled: false,
  original_console: (function(){
    // If the browser has no usable one, define a no-op
    return (typeof(window.console === 'object') && typeof(window.console.log) === 'function') ? window.console : {log: function(){}};
  })(),
  __args_to_array: function(args) { return Array.prototype.slice.call(args); },
  __caller_location: function() {
    var call_locations, current_position, caller, file_and_line;
    try {
    call_locations   = (new Error).stack.split("\n");
    current_position = call_locations[0].match(/Error/) ? 3 : 2;
    caller           = call_locations[current_position];
    file_and_line    = caller.match(/\/([^\/]*$)/)[1];
    } catch (err) {
      file_and_line = 'location not supported by browser';
    }
    return file_and_line;
  }
};

(function(){
  // Metaprogramming in JS! Wooooooooooooooo
  logging_methods = ['log', 'debug', 'info', 'error', 'warn'];
  methods         = ['dir', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'trace'].concat(logging_methods);
  for (i = 0; i < methods.length; i++) {
    method_name = methods[i];
    (function(method_name){
      safe_console[method_name] = function() {
        if (!this.enabled) { return; }
        var args = arguments;
        // Tack on the caller location if this is a logging method
        if (logging_methods.indexOf(method_name) !== -1) {
          var called_from = this.__caller_location();
          args            = this.__args_to_array(arguments).concat("(" + called_from + ")");
        }
        this.original_console[method_name].apply(this.original_console, args);
      };
    }
    )(method_name);
  }
})();

// In case we missed any methods: inherit, regardless of `enabled` switch
safe_console.__proto__ = safe_console.original_console;

// Recklessly cautious!
window.console = safe_console;

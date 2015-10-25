{Named} = require("./Named")

class NamedManager extends EventEmitter2
  constructor: ->
    super()

    @element = document.createElement("div")
    @namedies = []
    @destructors = []

    @initDOMStructure()
    @initStyle()
    @initEventListener()


  initDOMStructure: ->
    @$namedMgr = $(@element).addClass("namedMgr")
    return

  initStyle: ->
    $style = $("<style scoped />").text("""
      .scope {
        position: absolute;
        pointer-events: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .surface {
      }
      .surfaceCanvas {
        pointer-events: auto;
      }
      .blimp {
        position: absolute;
        top: 0px;
        left: 0px;
        pointer-events: auto;
      }
    """).appendTo(@$namedMgr)
    return

  initEventListener: ->
    return

  destructor: ->
    @namedies.forEach (named)-> named.destructor()
    @namedies = []
    @destructors.forEach (fn)-> fn()
    @$namedMgr.children().remove()
    @$namedMgr.remove()
    return

  materialize: (shell, balloon)->
    namedId = @namedies.length
    named = new Named(namedId, shell, balloon, this)
    @namedies.push(named)
    @$namedMgr.append(named.element)
    return namedId # namedId。いわゆるhwnd(ウィンドウハンドル)

  vanish: (namedId)->
    if !@namedies[namedId]? then console.error("namedId " + namedId + " is not used yet")
    @namedies[namedId].destructor()
    @namedies[namedId] = null
    delete @namedies[namedId]
    return

  named: (namedId)->
    if !@namedies[namedId]?
      console.error("namedId " + namedId + " is not used yet")
      return null
    return @namedies[namedId]

exports.NamedManager = NamedManager

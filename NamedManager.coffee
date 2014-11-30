
Scope = window["Named"] || window["Ikagaka"]?["Named"] || require("./Named.js")

class NamedManager
  constructor: ->
    @$namedMgr = $("<div />").addClass("namedMgr")
    $style = $("<style scoped />").html(@style)
    @$namedMgr.append($style)
    @element = @$namedMgr[0]
    @namedies = []
    @destructors = []

    do =>
      onmousedown = (ev)=>
        setTimeout((=>
          @$namedMgr.append(ev.currentTarget) ), 100)
      @$namedMgr.on("mousedown", ".named", onmousedown)
      @destructors.push =>
        @$namedMgr.off("mousedown", ".named", onmousedown)

  destructor: ->
    @namedies
      .filter (named)-> named?
      .forEach (named)-> $(named.element).remove()
    @destructors.forEach (destructor)-> destructor()
    @$namedMgr.remove()
    return

  materialize: (shell, balloon)->
    named = new Named(shell, balloon)
    @namedies.push(named)
    @$namedMgr.append(named.element)
    return @namedies.length - 1

  vanish: (namedId)->
    if !@namedies[namedId]? then throw new Error("namedId " + namedId + " is not used yet")
    @namedies[namedId].destructor()
    @namedies[namedId] = null
    return

  named: (namedId)->
    if !@namedies[namedId]? then throw new Error("namedId " + namedId + " is not used yet")
    return @namedies[namedId]

  style: """
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
    .blimpCanvas {
      position: absolute;
      top: 0px;
      left: 0px;
    }
    .blimpText {
      position: absolute;
      top: 0px;
      left: 0px;
      overflow-y: scroll;
      white-space: pre;
      white-space: pre-wrap;
      white-space: pre-line;
      word-wrap: break-word;
    }
    .blimpText a {
      text-decoration: underline;
      cursor: pointer;
    }
    .blimpText a:hover { background-color: yellow; }
    .blimpText a.ikagaka-choice { color: blue; }
    .blimpText a.ikagaka-anchor { color: red; }
  """

if module?.exports?
  module.exports = NamedManager
else if @Ikagaka?
  @Ikagaka.NamedManager = NamedManager
else
  @NamedManager = NamedManager

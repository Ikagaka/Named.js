$ = window["Zepto"]

Scope = window["Scope"] || window["Ikagaka"]?["Scope"] || require("./Scope.js")

prompt = window["prompt"]


class Named

  constructor: (@shell, @balloon)->
    @$named = $("<div />").addClass("named")
    @element = @$named[0]
    @scopes = []
    @currentScope = null
    @destructors = []
    @listener = {}

  load: (callback)->
    @scopes[0] = @scope(0)
    @currentScope = @scopes[0]
    $(@element).on "IkagakaDOMEvent", ({detail: event})=>
      @trigger(event.type, event)

    do =>
      $target = null
      relLeft = relTop = 0
      onmouseup = (ev)=>
        if !!$target
          if $(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")
            if $target[0] is $(ev.target).parent()?[0]
              $target = null
          else if $(ev.target).hasClass("surfaceCanvas")
            if $target[0] is $(ev.target).parent().parent()?[0]
              $target = null
      onmousedown = (ev)=>
        if $(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")
          if $(ev.target).parent().parent().parent()?[0] is @element
            $target = $(ev.target).parent() # .blimp
            $scope = $target.parent()
            {top, left} = $target.offset()
            offsetY = parseInt($target.css("left"), 10)
            offsetX = parseInt($target.css("top"), 10)
            if /^touch/.test(ev.type)
              pageX = ev.touches[0].pageX
              pageY = ev.touches[0].pageY
            else
              pageX = ev.pageX
              pageY = ev.pageY
            relLeft = pageX - offsetY
            relTop  = pageY - offsetX
            setTimeout((=>
              @$named.append($scope) ), 200)
        else if $(ev.target).hasClass("surfaceCanvas")
          if $(ev.target).parent().parent().parent()?[0] is @element
            $scope = $target = $(ev.target).parent().parent() # .scope
            {top, left} = $target.offset()
            if /^touch/.test(ev.type)
              pageX = ev.touches[0].pageX
              pageY = ev.touches[0].pageY
            else
              pageX = ev.pageX
              pageY = ev.pageY
            relLeft = pageX - left
            relTop  = pageY - top
            setTimeout((=>
              @$named.append($scope) ), 200)
      onmousemove = (ev)=>
        if !!$target
          if /^touch/.test(ev.type)
            pageX = ev.touches[0].pageX
            pageY = ev.touches[0].pageY
          else
            pageX = ev.pageX
            pageY = ev.pageY
          $target.css
            left: pageX - relLeft
            top:  pageY - relTop
      $body = $("body")
      $body.on("mousedown", onmousedown)
      $body.on("mousemove", onmousemove)
      $body.on("mouseup",   onmouseup)
      $body.on("touchstart", onmousedown)
      $body.on("touchmove",  onmousemove)
      $body.on("touchend",   onmouseup)
      @destructors.push ->
        $body.off("mousedown", onmousedown)
        $body.off("mousemove", onmousemove)
        $body.off("mouseup",   onmouseup)
        $body.off("touchstart", onmousedown)
        $body.off("touchmove",  onmousemove)
        $body.off("touchend",   onmouseup)
    do =>
      onblimpclick = (ev)=>
        event =
          type: "balloonclick"
        @trigger(event.type, event)
      onblimpdblclick = (ev)=>
        event =
          type: "balloondblclick"
        @trigger(event.type, event)
      @$named.on("click",    ".blimp", onblimpclick)
      @$named.on("dblclick", ".blimp", onblimpdblclick)
      @destructors.push ->
        @$named.off("click",    ".blimp", onblimpclick)
        @$named.off("dblclick", ".blimp", onblimpdblclick)
    do =>
      onchoiceclick = (ev)=>
        id = ev.target.dataset["id"]
        argc = Number ev.target.dataset["argc"]
        if /^On/.test(id) # On
          event =
            type: "raise"
            id: id
            args: []
          for i in [0 ... argc]
            event.args.push(ev.target.dataset["argv"+i])
          @trigger(event.type, event)
        else if argc # Ex
          event =
            type: "choiceselectex"
            text: ev.target.textContent
            id: id
            args: []
          for i in [0 ... argc]
            event.args.push(ev.target.dataset["argv"+i])
          @trigger(event.type, event)
        else # normal
          event =
            type: "choiceselect"
            id: id
          @trigger(event.type, event)
      onanchorclick = (ev)=>
        id = ev.target.dataset["id"]
        argc = Number ev.target.dataset["argc"]
        if /^On/.test(id) # On
          event =
            type: "raise"
            id: id
            args: []
          for i in [0 ... argc]
            event.args.push(ev.target.dataset["argv"+i])
          @trigger(event.type, event)
        else if argc # Ex
          event =
            type: "anchorselectex"
            text: ev.target.textContent
            id: id
            args: []
          for i in [0 ... argc]
            event.args.push(ev.target.dataset["argv"+i])
          @trigger(event.type, event)
        else # normal
          event =
            type: "anchorselect"
            id: id
          @trigger(event.type, event)
      @$named.on("click", ".ikagaka-choice", onchoiceclick)
      @$named.on("click", ".ikagaka-anchor", onanchorclick)
      @destructors.push =>
        @$named.off("click", ".ikagaka-choice", onchoiceclick)
        @$named.off("click", ".ikagaka-anchor", onanchorclick)
    setTimeout(callback)
    return

  destructor: ->
    @scopes.forEach (scope)-> $(scope.element).remove()
    @destructors.forEach (destructor)-> destructor()
    @$named.remove()
    return

  scope: (scopeId)->
    if !isFinite(scopeId) then return @currentScope
    if !@scopes[scopeId]
      @scopes[scopeId] = new Scope(scopeId, @shell, @balloon)
    @currentScope = @scopes[scopeId]
    @$named.append(@scopes[scopeId].element)
    return @currentScope

  openInputBox: (id, text="")->
    event =
      "type": "userinput"
      "id": id
      "content": prompt("UserInput", text) || ""
    @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
    return

  openCommunicateBox: (text="")->
    event =
      "type": "communicate"
      "sender": "user"
      "content": prompt("Communicate", text) || ""
    @trigger(event.type, event)
    return

  on: (event, callback) ->
    unless event? and callback? then throw Error 'on() event and callback required'
    unless @listener?
      @listener = {}
    unless @listener[event]?
      @listener[event] = []
    if -1 == @listener[event].indexOf(callback)
      @listener[event].push(callback)
    @

  off: (event, callback) -> # undefined means any
    if event? and callback?
      if @listener[event]?
        index = @listener[event].indexOf(callback)
        if index != -1
          @listener[event].splice(index, 1)
    else if event?
      delete @listener[event]
    else if callback?
      for event of @listener
        index = @listener[event].indexOf(callback)
        if index != -1
          @listener[event].splice(index, 1)
    else
      delete @listener
    @

  trigger: (event, args...) ->
    if @listener?[event]?
      for callback in @listener[event]
        setTimeout (-> callback.apply(@, args)), 0
    @


if module?.exports?
  module.exports = Named
else if @Ikagaka?
  @Ikagaka.Named = Named
else
  @Named = Named

<- (-> it!)

window.global_exports = {}

window.addEventListener "unhandledrejection", (evt) ->
  throw evt.reason

dlog = window.dlog = (...args) ->
  if localStorage.getItem('display_dlog') == 'true'
    console.log(...args)

require 'libs_backend/systemjs'

add_url_input_if_needed = ->
  if localStorage.index_show_url_bar == 'true'
    url_input = document.createElement('input')
    url_input.style.position = 'fixed'
    url_input.style.bottom = '0px'
    url_input.style.left = '0px'
    url_input.value = window.location.href
    url_input.style.width = '100vw'
    url_input.style.backgroundColor = 'transparent'
    url_input.style.border = 'none'
    url_input.style.color = 'white'
    url_input.style.backgroundColor = 'black'
    url_input.addEventListener 'keydown', (evt) ->
      if evt.keyCode == 13
        if url_input.value != window.location.href
          window.location.href = url_input.value
        else
          window.location.reload()
    document.body.appendChild(url_input)
  return

window.developer_options = ->
  window.location.href = '/index.html?tag=options-dev'

if window.location.pathname == '/options.html'
  require 'components/options-view-v2.deps'

  hash = window.location.hash
  if not hash? or hash == ''
    hash = '#settings'
    window.location.hash = '#settings'
  if hash.startsWith('#')
    hash = hash.substr(1)
  options_view = document.querySelector('#options_view')
  if hash == 'onboarding'
    require 'components/onboarding-view.deps'
    onboarding_view = document.createElement('onboarding-view')
    onboarding_view.addEventListener 'onboarding-complete', (evt) ->
      onboarding_view.style.display = 'none'
      onboarding_view.parentNode.removeChild(onboarding_view)
      options_view.style.display = 'block'
    options_view.style.display = 'none'
    document.getElementById('index_body').appendChild(onboarding_view)
  options_view.set_selected_tab_by_name(hash)
  options_view.addEventListener 'options_selected_tab_changed', (evt) ->
    window.location.hash = evt.detail.selected_tab_name
  #  options_view
  require 'libs_common/global_exports_post'
  add_url_input_if_needed()
  return

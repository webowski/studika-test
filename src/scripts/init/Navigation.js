import Navigation from '../components/Navigation'

const $navs = document.querySelectorAll('.nav-main')

$navs.forEach(($nav) => {
	new Navigation($nav)
})

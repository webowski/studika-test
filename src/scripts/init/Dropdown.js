import Dropdown from '../components/Dropdown'

const $dropdowns = document.querySelectorAll('.dropdown')

$dropdowns.forEach(($dropdown) => {
	window.locationDropdown = new Dropdown($dropdown)
})

let $themeSwitch = document.querySelector('.theme-switch')

if ($themeSwitch) {
	let checkbox = $themeSwitch.querySelector('input')

	$themeSwitch.addEventListener(
		'click',
		(e) => {
			if ($themeSwitch.classList.contains('is-switched')) {
				document.documentElement.setAttribute('data-theme', 'light')
				$themeSwitch.classList.remove('is-switched')
				checkbox.checked = false
			} else {
				document.documentElement.setAttribute('data-theme', 'dark')
				$themeSwitch.classList.add('is-switched')
				checkbox.checked = true
			}
		},
		false
	)
}

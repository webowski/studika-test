class Navigation {
	constructor($element) {
		this.$navigation = $element
		this.$scrollArea = $element.querySelector('.nav-main__scroll')
		this.$leftButton = $element.querySelector('.nav-main__left')
		this.$rightButton = $element.querySelector('.nav-main__right')
		this.#manageButtons()
	}

	#manageButtons() {
		this.$leftButton.addEventListener('click', () => this.#moveLeft())
		this.$rightButton.addEventListener('click', () => this.#moveRight())

		this.$scrollArea.addEventListener('scroll', () => this.#detectEdges())
		window.addEventListener('resize', () => this.#detectEdges())
	}

	#moveLeft() {
		this.$scrollArea.scrollBy({ top: 0, left: -240, behavior: 'smooth' })
	}

	#moveRight() {
		this.$scrollArea.scrollBy({ top: 0, left: 240, behavior: 'smooth' })
	}

	#detectEdges() {
		if (this.#detectStart()) {
			this.#disableButton(this.$leftButton)
		} else {
			this.#enableButton(this.$leftButton)
		}

		if (this.#detectEnd()) {
			this.#disableButton(this.$rightButton)
		} else {
			this.#enableButton(this.$rightButton)
		}
	}

	#detectStart() {
		if (this.$scrollArea.scrollLeft < 1) return true
		else return false
	}

	#detectEnd() {
		if (
			this.$scrollArea.scrollLeft + this.$scrollArea.clientWidth >=
			this.$scrollArea.scrollWidth - 1
		) {
			return true
		} else return false
	}

	#disableButton($button) {
		$button.classList.add('is-hidden')
	}

	#enableButton($button) {
		if ($button.classList.contains('is-hidden'))
			$button.classList.remove('is-hidden')
	}
}

export default Navigation

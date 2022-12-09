import { trigger } from '../helpers/Event'
import PerfectScrollbar from 'perfect-scrollbar'

class Dropdown {
	dataReceived = false
	dataUrl = 'https://studika.ru/api/areas'
	data = []
	$optionsList = undefined
	$options = undefined
	values = []

	constructor($element) {
		this.$dropdown = $element
		this.$toggler = $element.querySelector('.dropdown__toggler')
		this.$summary = $element.querySelector('.dropdown__summary')
		this.$dropdownBody = $element.querySelector('.dropdown__body')
		this.$input = $element.querySelector('.dropdown__input')
		this.$inputReset = $element.querySelector('.dropdown__input-reset')
		this.$pills = $element.querySelector('.dropdown__pills')
		this.$optionsContainer = $element.querySelector('.dropdown__options')
		this.$preloader = $element.querySelector('.preloader')
		this.$reloaderClone = this.$preloader.cloneNode(true)
		this.$button = $element.querySelector('.dropdown__action')

		this.#manageToggler()
		this.#initScrollbar()
		this.#manageInput()
		this.#manageButton()
	}

	#manageToggler() {
		this.$toggler.addEventListener('click', () => {
			if (this.$dropdown.classList.contains('is-open')) {
				trigger(this.$dropdown, 'close')
			} else {
				trigger(this.$dropdown, 'open')
			}
		})

		this.$dropdown.addEventListener('open', async () => {
			this.$dropdown.classList.add('is-open')

			if (!this.dataReceived) {
				await this.#fetchData()
				this.#loadOptions()
				this.setValues(this.#getCookie())
				this.#setSummary()
			}

			this.$input.focus()
		})

		this.$dropdown.addEventListener('close', () => {
			this.$dropdown.classList.remove('is-open')
		})

		this.#manageOuterClick()
	}

	async #fetchData() {
		try {
			const response = await fetch(this.dataUrl, {
				method: 'POST',
			})
			this.data = await response.json()
			this.dataReceived = true
		} catch (error) {
			console.error(error)
		}
	}

	#loadOptions() {
		this.$optionsList = document.createElement('ul')
		this.$preloader.remove()
		this.$optionsContainer.append(this.$optionsList)

		this.data.map((item) => {
			this.#appendOption(item)

			if (item.hasOwnProperty('cities')) {
				item.cities.map((subItem) => {
					this.#appendOption(subItem)
				})
			}
		})

		this.$options = this.$optionsList.childNodes

		this.scrollbar.update()
	}

	#appendOption(itemData) {
		let $option = document.createElement('li')
		$option.classList.add('dropdown__option')
		this.#setupOption($option, itemData)
		this.$optionsList.append($option)
	}

	#setupOption($option, itemData) {
		$option.dataset.title = itemData.name
		$option.dataset.id = itemData.id

		let $title = this.#createOptionElement(
			itemData.name,
			'dropdown__option-title'
		)

		if (itemData.type === 'country' || itemData.type === 'area') {
			$option.append($title)
		} else if (itemData.hasOwnProperty('state_id')) {
			let $subtitle = this.#createOptionElement(
				this.#getAreaName(itemData.state_id),
				'dropdown__option-sub'
			)
			$option.append($title)
			$option.append($subtitle)
		}

		$option.addEventListener('click', () => {
			if ($option.classList.contains('is-selected')) {
				this.#removeValue(itemData.id)
			} else {
				this.#addValue(itemData)
			}
		})
	}

	#addValue(itemData) {
		this.values.push(itemData)
		this.#addPill(itemData)
		this.#markOption(itemData.id)
	}

	#removeValue(id) {
		this.values = this.values.filter((v) => v.id !== id)
		this.#removePill(id)
		this.#unmarkOption(id)
	}

	getValues() {
		return this.values.map((v) => {
			let item = { id: v.id }
			if (v.hasOwnProperty('type')) item.type = v.type
			return item
		})
	}

	setValues(itemsToSet) {
		this.resetValues()

		this.data.map((item) => {
			this.#addMatchedValue(itemsToSet, item)

			if (item.hasOwnProperty('cities')) {
				item.cities.forEach((subItem) => {
					this.#addMatchedValue(itemsToSet, subItem)
				})
			}
		})

		return this.values
	}

	resetValues() {
		this.values = []
		this.$pills.innerHTML = ''
		this.$options.forEach(($option) => $option.classList.remove('is-selected'))
	}

	#addMatchedValue(items, item) {
		items.forEach((i) => {
			if (i.id == item.id && i.type === item.type) {
				this.#addValue(item)
			} else if (
				i.id == item.id &&
				i.hasOwnProperty('state_id') &&
				item.hasOwnProperty('state_id')
			) {
				this.#addValue(item)
			}
		})
	}

	#markOption(id) {
		this.$optionsContainer
			.querySelector(`[data-id="${id}"]`)
			.classList.add('is-selected')
	}

	#unmarkOption(id) {
		this.$optionsContainer
			.querySelector(`[data-id="${id}"]`)
			.classList.remove('is-selected')
	}

	#addPill(itemData) {
		const $pill = this.#createPill(itemData)
		this.$pills.appendChild($pill)
	}

	#createPill(itemData) {
		const $pill = this.#createElement('pill')

		$pill.dataset.id = itemData.id

		const $title = this.#createElement('pill__title', itemData.name)
		const $remove = this.#createElement(
			'pill__remove',
			'<span class="icon icon--cross"></span>'
		)

		$pill.appendChild($title)
		$pill.appendChild($remove)

		$remove.addEventListener('click', () => {
			this.#removeValue(itemData.id)
		})

		return $pill
	}

	#removePill(id) {
		this.$pills.querySelector(`[data-id="${id}"]`).remove()
	}

	#createElement(className, innerHTML = '') {
		const $element = document.createElement('div')
		$element.classList.add(className)
		$element.innerHTML = innerHTML
		return $element
	}

	#createOptionElement(text, className) {
		const $element = document.createElement('div')
		$element.classList.add(className)
		$element.append(text)
		return $element
	}

	#getAreaName(state_id) {
		return this.data.find((x) => x.id === state_id).name
	}

	#manageInput() {
		this.$input.addEventListener('keyup', (event) => {
			this.#filterOptions(event.target.value)

			if (event.target.value === '') {
				this.$inputReset.style.display = 'none'
			} else {
				this.$inputReset.style.display = 'block'
			}
		})

		this.$inputReset.addEventListener('click', () => {
			this.$input.value = ''
			this.$input.focus()
			this.$inputReset.style.display = 'none'
			this.#filterOptions(this.$input.value)
		})
	}

	#filterOptions(substring) {
		this.$options.forEach(($option) => {
			const $title = $option.querySelector('.dropdown__option-title')
			$title.innerHTML = $option.dataset.title

			const titleUpper = $option.dataset.title.toUpperCase()
			const substringUpper = substring.toUpperCase().trim()

			const substringIndex = titleUpper.indexOf(substringUpper)

			if (substringIndex !== -1) {
				if (substring.length > 0) {
					$title.innerHTML = this.#boldSubstring(
						$option.dataset.title,
						substring,
						substringIndex
					)
				}
				$option.classList.remove('is-hidden')
			} else {
				$option.classList.add('is-hidden')
			}
		})

		this.scrollbar.update()
		this.scrollbar.element.scrollTop = 0
	}

	#boldSubstring(initialString, substring, substringIndex) {
		const replacement = initialString.substring(
			substringIndex,
			substringIndex + substring.length
		)
		return initialString.replace(replacement, '<b>' + replacement + '</b>')
	}

	#setSummary() {
		const summaryArray = this.values.map((i) => i.name)
		this.$summary.innerHTML = summaryArray.join(', ')
	}

	#manageButton() {
		this.$button.addEventListener('click', async () => {
			this.#setIsLoading(true)

			this.#saveCookie()

			await this.#sendRequest()

			this.#setSummary()
			this.#setIsLoading(false)
		})
	}

	#saveCookie() {
		console.log('Куки userLocation сохранены:', this.getValues())
		document.cookie = `userLocation=${JSON.stringify(this.getValues())}`
	}

	#getCookie() {
		let cookies = document.cookie.split(';')
		let result = []

		cookies.forEach((cookie) => {
			let cookieArray = cookie.split('=')
			if ('userLocation' == cookieArray[0].trim()) {
				result = JSON.parse(cookieArray[1])
			}
		})

		return result
	}

	async #sendRequest() {
		// TODO проверить на рабочем сервере
		// try {
		const response = await fetch('https://api.github.com/gists', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(this.getValues()),
		})
		console.log('Данные отправлены:', response)
		// } catch (error) {
		// 	console.log('Данные не отправлены:', this.getValues())
		// }
	}

	#setIsLoading(state) {
		if (state) {
			this.$dropdownBody.classList.add('is-loading')
			this.$dropdownBody.appendChild(this.$reloaderClone)
		} else {
			this.$dropdownBody.classList.remove('is-loading')
			this.$dropdownBody.removeChild(this.$reloaderClone)
		}
	}

	#manageOuterClick() {
		document.body.addEventListener('mousedown', (e) => {
			if (
				this.$dropdown.classList.contains('is-open') &&
				!e.target.closest('.dropdown') &&
				!e.target.classList.contains('dropdown__toggler')
			) {
				trigger(this.$dropdown, 'close')
			}
		})
	}

	#initScrollbar() {
		this.scrollbar = new PerfectScrollbar(this.$optionsContainer, {
			wheelSpeed: 2,
			wheelPropagation: false,
			minScrollbarLength: 52,
		})
	}
}

export default Dropdown

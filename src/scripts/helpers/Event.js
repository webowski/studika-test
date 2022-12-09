let customEvents = {
	open: new Event('open'),
	close: new Event('close'),
}

export const trigger = ($element, eventName) => {
	$element.dispatchEvent(customEvents[eventName])
}

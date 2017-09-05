function showPopUp(title, text, time) {
	$.gritter.add({
		title: title,
		text: text || " ",
		time: time || 2000
	});
}

function convertToFormData(data) {
	var form_data = new FormData();

	for (var key in data) {
		var value = data[key];
		if (value.constructor === Array) {
			for (var i = 0; i < value.length; i++) {
				form_data.append(key, value[i]);
			}
			continue;
		}

		form_data.append(key, data[key]);
	}

	return form_data;
}

const formatTime = date => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();
	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = n => {
	n = n.toString();
	return n[1] ? n : '0' + n;
};

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude);
		latitude = parseFloat(latitude);
	}

	longitude = longitude.toFixed(2);
	latitude = latitude.toFixed(2);
	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	};
}

module.exports = {
	formatTime,
	formatLocation
};

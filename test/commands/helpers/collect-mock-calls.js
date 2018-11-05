module.exports = (mockObject) => {
	let callArguments = {};
	for (let method in mockObject) {
		if (!mockObject.hasOwnProperty(method)) {
			continue;
		}
		if (mockObject[method].mock && mockObject[method].mock.calls) {
			callArguments[method] = mockObject[method].mock.calls;
		}
	}

	return JSON.stringify(callArguments, null, 2);
};

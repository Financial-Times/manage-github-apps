module.exports = (mockObject) => {
	let mockMethodCalls = {};
	for (let method in mockObject) {
		if (!mockObject.hasOwnProperty(method)) {
			continue;
		}
		if (mockObject[method].mock && mockObject[method].mock.calls) {
			mockMethodCalls[method] = mockObject[method].mock.calls;
		}
	}

	return JSON.stringify(mockMethodCalls, null, 2);
};

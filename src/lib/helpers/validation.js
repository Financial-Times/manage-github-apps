const validator = require('is-my-json-valid');

const validation = {
	dataAgainstSchema: (schema, data) => {
		const validate = validator(schema);
		if (validate(data)) {
			return true;
		}
		return validate.errors;
	},
	formatErrors: (errors) => {
		if (!errors || !errors.length) {
			return '';
		}

		return errors.map((err) => {
			return `- ${validation.getFieldName(err.field)}${err.message}`;
		}).join('\n');
	},
	getFieldName: (name) => {
		return (name === 'data') ? '' : `'${name.replace('data.', "")}' `;
	}
};

module.exports = validation;

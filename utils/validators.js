module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword
) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (email.trim() === '') {
        errors.email = 'Email must not be empty';
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }
    if (password === '') {
        errors.password = 'Password must not empty';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
};

module.exports.validateLoginInput = (username, password) => {
    const errors = {}
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (password.trim() === '') {
        errors.password = 'Password must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}

module.exports.validateAppointmentInput = (description, dateString) => {
    const moment = require('moment')

    const errors = {}
    /*
    * errors takes shape of
    * description: string
    * dateString: string
    * */

    if (description.trim() === '') {
        errors.description = 'Description must not be empty';
    }

    const illegal_chars = ['<', '>', '[', ']']

    illegal_chars.forEach(char => {
        if (description.includes(char)) {
            errors.description = `Description may not contain illegal characters.
             Last illegal character detected: ${char}`
        }
    })

    if (moment(dateString, moment.ISO_8601, true).isValid() === false) {
        errors.dateString = 'Not a valid ISO date string, try again.'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}

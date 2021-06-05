/**
 * Schakel de standaard 'html5 input constraint validation API' uit. Aangepaste API.
 */
let forms = document.querySelectorAll('.form-validate');
for (let i = 0; i < forms.length; i++) {
    forms[i].setAttribute('novalidate', true);
}

// validate the field

let hasError = (field) => {
    // don't validate, buttons, file and reset input, and disabled fields
    if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

    // get validity
    let validity = field.validity;

    // if valid, return null
    if (validity.valid) return;

    // if field is required an empty
    if (validity.valueMissing) return 'Vul alstublieft dit veld in'

    // if not the right type
    if (validity.typeMismatch) {
        // email
        if (field.type === 'email') return 'Voer een e-mailadres in alstublieft.'
        // url
        if (field.type === 'url') return 'Voer een URL in alstublieft..'
        // password
    }

    // if too short
    if (validity.tooShort) return 'Verleng deze tekst tot ' +
        field.getAttribute('minLength') + ' karakters of meer. U gebruikt momenteel ' +
        field.value.length + ' karakters.';

    // if too long
    if (validity.tooLong) return 'Kort deze tekst in tot niet meer dan ' +
        field.getAttribute('maxLength') + ' characters. U gebruikt momenteel ' +
        field.value.length + ' karakters.';

    // if number input isn't a number
    if (validity.badInput) return 'Voer alstublieft een nummer in';

    // if a number value doesn't match the step interval
    if (validity.stepMismatch) return 'Selecteer een geldige waarde.';

    // if a number field is over the max
    if (validity.rangeOverflow) return 'Selecteer een waarde die niet meer is dan ' +
        field.getAttribute('max' + '.');

    // if a number field is below the mix
    if (validity.rangeUnderflow) return 'Selecteer een waarde die niet lager is dan ' +
        field.getAttribute('min' + '.');

    // if pattern doesn't match
    if (validity.patternMismatch) {
        // if partter info is included, return custom error
        if (field.hasAttribute('title')) return field.getAttribute('title');

        // oherwise, generic error
        return 'Pas het gevraagde formaat aan.'

    }

    // if all else fails, reture a generic catchall error
    return 'De waarde die u voor dit veld heeft ingevoerd, is ongeldig.';

}


// show aan error message
// add a 'class' to the error field
// if an error message exists, update the message
// if an error message exists not, create a message en add it after this field
let showError = (field, error) => {
    // add error class to field
    field.classList.add('error');

    // if the field is a radio button and part of a group, error all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        let group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                // only check fields in current form
                if (group[i].form !== field.name) continue;
                group[i].classList.add('error');
            }
            field = group[group.length - 1];
        }
    }

    // get field id or name
    let id = field.id || field.name;
    if (!id) return;

    // check or error message field already exists
    // if not, create one
    let message = field.form.querySelector('.error-message#error-for-' + id);
    if (!message) {
        message = document.createElement('div');
        message.className = 'error-message';
        message.id = 'error-for-' + id;

        // if the field is aradio button or checkbox, inset error after the label
        let label;
        if (field.type === 'radio' || field.type === 'checkbox') {
            label = field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
            if (label) {
                label.parentNode.insertBefore(message, label.nextSibling);
            }
        }

        // otherwise, insert it after the field
        if (!label) {
            field.parentNode.insertBefore(message, field.nextSibling);
        }
    }

    // add ARIA role to the field
    field.setAttribute('aria-describedby', 'error-for-' + id);

    // update error message
    message.innerHTML = error;

    // show error message
    message.style.display = 'block';
    message.style.visibility = 'visible';

};

// remove the error message
let removeError = (field) => {
    // remove error class to field
    field.classList.remove('error');

    // remove ARIA rolr from the field
    field.removeAttribute('aria-describedby');

    // if the field is aradio button and part of a group, remove error form all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        let group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                // only check fields in current form
                if (group[i].form !== field.name) continue;
                group[i].classList.remove('error');
            }
            field = group[group.length - 1];
        }
    }

    // get field id or name
    let id = field.id || field.name;
    if (!id) return;

    // check or an error message is in the DOM
    let message = field.form.querySelector('.error-message#error-for-' + id + '');
    if (!message) return;

    // if so, hide it
    message.innerHTML = '';
    message.style.display = 'none';
    message.style.visibility = 'hidden';
};

// list to all blur events
document.addEventListener('blur', (event) => {
    // only runs if the field is in a form to be validated
    if (!event.target.form.classList.contains('form-validate')) return;

    // validate the field
    let error = hasError(event.target);

    // if there's an error, show it
    if (error) {
        showError(event.target, error);
        return;
    }

    // otherwise, remove any existing error message
    removeError(event.target);

}, true);


// chech all on submit
document.addEventListener('submit', (event) => {
    // only runs if the field is in a form to be validated
    if (!event.target.classList.contains('form-validate')) return;

    // get all of the form element
    let fields = event.target.elements;

    // validate each field
    // store the first field with an error to a variable so we can bring it into focus later
    let error, hasErrors;
    for (let i = 0; i < fields.length; i++) {
        error = hasError(fields[i]);
        if (error) {
            showError(fields[i], error);
            if (!hasErrors) {
                hasErrors = fields[i];
            }
        }
    }

    // if there are errors, don't submit form and focus on first element with error
    if (hasErrors) {
        event.preventDefault();
        hasErrors.focus();
    }

    // otherwise, let the form submit normally
    // you could also bolt in an Ajax formsubmit process here

}, false);
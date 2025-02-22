//This function splits any kind of javascript accessors into a list
//For example var.attr1['attr2'].attr3 will give the following list
//['var', 'attr1', 'attr2', 'attr3']
function splitAccessors (variable) {
    var accessors = [];

    //This RegExp is used to capture the first object of a bracket notation
    //It captures everything before an open square bracket
    //For example it will capture 'obj' in the expression obj['prop1']['prop2']
    var objectRegexp = /[^\[]+/;

    //This RegExp is used to capture all properties of a bracket notation
    //It captures everything in between [' '] or [" "]
    //For example it will capture 'prop1' and 'prop2' in the above expression
    var propertiesRegexp = /\['(.+?)'\]|\["(.+?)"\]/g;

    //This RegExp is a combination of the two RegExp above
    //Make sure that each component follows the correct bracket notation
    //[0-9a-zA-Z_$]+ is to make sure that the captured variable has a valid variable name or key value
    var validationRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*(\['[0-9a-zA-Z_$]+'\]|\["[0-9a-zA-Z_$]+"\])*$/;
    var components = variable.split('.');

    for (var n = 0; n < components.length; n++) {
        var component = components[n];
        var object = component.match(objectRegexp);
        var property = propertiesRegexp.exec(component);

        if (!validationRegexp.test(component)) {
            //casper's log doesn't exist when running tests
            if (typeof log !== 'undefined') {
                log(variable + ' has an invalid syntax', 'ERROR');
            }
            return;
        }

        if (object) {
            accessors = accessors.concat(object);
        }

        while (property !== null) {
            //property[1] holds the value that satisfies [' ']
            //property[2] holds the value that satisfies [" "]
            accessors = accessors.concat(property[1] || property[2]);
            property = propertiesRegexp.exec(component);
        }

    }
    return accessors;
}

//This function retrieve a list of accessors
//Set the first accessor as the main object
//Get the value of window.object using casper.evaluate()
//Access continuously to the next property until the end of the list
function getVariable (variable, variableValue) {
    var object;
    var accessors = splitAccessors(variable);

    if (!accessors) {
        return;
    }

    object = accessors.shift();
    if (variableValue === undefined) {
        variableValue = this.evaluate(function (object) {
            return window[object];
        }, object);
    } else {
        variableValue = variableValue[object];
    }

    accessors.forEach(function (property) {
        if (variableValue === undefined) {
            return;
        }
        variableValue = variableValue[property];
    });
    return variableValue;
}

//This function retrieves the first attribute or text of the selector
//Apply the RegExp if there is one
function getAttribute (params) {
    var attributeValue;

    if (!this.exists(params.selector)) {
        return;
    }

    if (params.attribute === '@text') {
        attributeValue = this.getElementInfo(params.selector).text;
    } else {
        attributeValue = this.getElementAttribute(params.selector,
            params.attribute);
    }

    if (attributeValue && params.modifier) {
        var regexpModifier = new RegExp(params.modifier);
        var matchedRegexp = regexpModifier.exec(attributeValue);
        if (!matchedRegexp) {
            return;
        }
        // Try to get a captured group, return the matched string if there is no capture group
        attributeValue = matchedRegexp[1] || matchedRegexp[0];
    }

    //when getting an HTML attribute, '' is equivalent of not existing, so undefined
    if (attributeValue === '') {
        return;
    }
    return attributeValue;
}

function encodeResource (resource, regexp) {
    if (regexp === true) {
        return new RegExp(resource);
    } else {
        //The resource will be an url, so URI encoding is needed
        return encodeURI(resource);
    }
}

function getResource (resourceMatcher, method, variable, status) {
    var responses = this.resources;
    var request;
    var parsedData;
    var res;
    status = +status || 200;

    for (var i = 0; i < responses.length; i++) {
        res = responses[i];

        if (resourceMatcher instanceof RegExp &&
            resourceMatcher.test(res.url) ||
            res.url.indexOf(resourceMatcher) !== -1) {

            request = this.options.requests[res.id];

            // Get the resource with corresponding method or first resource if no method
            if ((!method || method === request.method) &&
                res.status === status) {

                if (!variable) {
                    return request;
                }

                //Parse postData as an object and save it as payload
                if (request.postData !== undefined) {
                    try {
                        request.payload = JSON.parse(request.postData);
                    } catch (e) {
                        request.payload = request.postData;
                    }
                }
                return getVariable(variable, request);
            }
        }
    }
}

function getElementsCount (selector) {
    var n = this.evaluate(function (selector) {
        return __utils__.findAll(selector).length;
    }, selector);
    return n;
}

module.exports = function () {
    return {
        getAttribute: getAttribute.bind(this),
        getVariable: getVariable.bind(this),
        splitAccessors: splitAccessors,
        getResource: getResource.bind(this),
        encodeResource: encodeResource,
        getElementsCount: getElementsCount.bind(this)
    };
};

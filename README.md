![logo](./media/logo.png)

> Bots navigating urls and doing tasks.

`damon` is a tool that runs on [CasperJS](http://casperjs.org/) which runs on [PhantomJS](http://phantomjs.org/).

It feeds on JSON files that describe what tasks he needs to achieve on specified starting URL.

# Table Of Contents
<details>

<!-- toc -->

- [Damon Projects](#damon-projects)
- [Installation](#installation)
- [Usage](#usage)
  * [Locally](#locally)
  * [CLI](#cli)
- [Task File](#task-file)
  * [config](#config)
  * [tasks](#tasks)
    + [navigate](#navigate)
    + [status](#status)
    + [redirection](#redirection)
    + [capture](#capture)
    + [download](#download)
    + [wait](#wait)
      - [url](#url)
      - [selector](#selector)
      - [visible](#visible)
      - [hidden](#hidden)
      - [time](#time)
      - [resource](#resource)
    + [dom](#dom)
      - [click](#click)
      - [fill](#fill)
    + [get](#get)
      - [_store_](#_store_)
        * [attribute](#attribute)
        * [variable](#variable)
        * [resource](#resource-1)
        * [number of elements](#number-of-elements)
      - [_access_](#_access_)
    + [request](#request)
    + [assert](#assert)
      - [attribute](#attribute-1)
      - [variable](#variable-1)
      - [key](#key)
- [Roadmap](#roadmap)
- [Contribute](#contribute)
      - [Individual Contribution](#individual-contribution)
      - [Corporate Contribution](#corporate-contribution)
- [License](#license)

<!-- tocstop -->

</details>

## Damon Projects

- [💻 CLI](https://github.com/damonjs/damon-cli).
- [💬 Reporter](https://github.com/damonjs/damon-reporter).

## Installation

via NPM :

```bash
npm install --save damon
```

## Usage

### Locally

```node
var damon = require('damon');
// Attach the default reporter.
damon.attachReporter();
// You can attach your own reporter as well
// damon.attachReporter('./path/to/my/reporter.js');
// Start your suite(s), it accepts globs.
damon.start('./tasks.json');
```

### CLI

You can use `damon` via a CLI, available at [damonjs/damon-cli](https://github.com/damonjs/damon-cli)

## Task File

This is the json file you'll pass to `damon`.

It's composed of two attributes, a `config` hash and a `tasks` array.

```javascript
{
    "config": {},
    "tasks": []
}
```

### config

Your task file must have a `config` entry.

```javascript
"config": {
    "size": {
        "width": 1024,
        "height": 768
    },
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A",
    "timeout": 1000,
    "logLevel": "fatal",
    "describe": "This is a job description"
}
```

- `size` is for the viewport's size.
- `userAgent` is a custom userAgent for `damon` to use. Default one is Chrome 44 on Windows 7.
- `timeout` overwrite the general timeout used accross the test suite.
- `logLevel` control at which level `damon` will log. Can be `none`, `fatal`, `error`, `warn`, `info`, `debug` or `trace`
- `describe` is used to give a description of the job. It is printed next to the filename in the default reporter.

### tasks

Then you describe your `tasks` entry, an array of all the tasks to achieve sequentially :

```javascript
"tasks": [
    {},
    {}
]
```

Each task will have three components:

```javascript
{
    "type": "taskType",
    "it": "should run this task",
    "params": {}
}
```

- `type` the type of task.
- `params` arguments to be passed to the task.
- `it` description of the task, to be printed on the default reporter (optional).

__It exists several kinds of tasks that `damon` can achieve :__

#### navigate

`damon` can navigate to other urls at the start or during its worflow.

```javascript
{
    "type": "navigate",
    "params": {
        "url": "https://www.google.com",
        "method": "GET",
        "data": {
            "key": "value"
        },
        "headers": {
            "name": "value"
        },
        "encoding": "utf8"
    }
}
```

Only `params.url` is required.

#### status

Verify that the page answers with a specific status.

```javascript
{
    "type": "status",
    "params": {
        "url": "url",
        "method": "GET",
        "data": {
            "key": "value"
        },
        "headers": {
            "name": "value"
        },
        "encoding": "utf8",
        "status": [301, 302]
    }
}
```

`damon` will navigate to `params.url` and will wait until it gets the awaited status.

The request gets cancelled as soon as the status is returned.

`params.status` can be a string of a single status, or an array of all status required.

In the case of the array, the first encounter will validate the task.

Only `params.url`and `params.status` are required.

#### redirection

Verify that the page redirects to another specified one.

```javascript
{
    "type": "redirection",
    "params": {
        "from": "url",
        "to": "url",
        "method": "GET",
        "data": {
            "key": "value"
        },
        "headers": {
            "name": "value"
        },
        "encoding": "utf8"
    }
}
```

`damon` will navigate to `params.from` and verify that we have a redirection to `params.to`.

The `params.method`, `params.data`, `params.heades` and `params.encoding` are for `params.from` only.

Only `params.from`and `params.to` are required.

#### capture

A simple screen capture :

```javascript
{
    "type": "capture",
    "params": {
        "name": "start.png"
    }
}
```
#### download

Download the target url

```javascript
{
    "type": "download",
    "params": {
        "url": "http://www.google.com",
        "name": "google.html",
        "method": "GET",
        "data": ""
    }
}
```

An HTTP method can be set with `method`, and pass request arguments through `data`.

#### wait

`damon` can wait for several different things.
For each one, except `time`, you can overwrite the `timeout`.

##### url

```javascript
{
    "type": "wait",
    "params": {
        "url": "http://www.yahoo.ca",
        "regexp": false,
        "timeout": 1000
    }
}
```

`damon` will wait at this step until matching url is reached.

`url` will be interpreted as a `regexp` if set to `true`. Default value of `regexp` is `false`.

##### selector

```javascript
{
    "type": "wait",
    "params": {
        "selector": "#content",
        "timeout": 1000,
        "xpath": false
    }
}
```

`damon` will wait at this step until the `selector` is available on the page.

`xpath` can be used to select an element by setting it to true. Default value is false.

##### visible
##### hidden

Both are the same as `selector` but will wait for these specific states of the element.

##### time

```javascript
{
    "type": "wait",
    "params": {
        "time": "1000"
    }
}
```

`damon` will wait for the specified amount of milliseconds.

##### resource

```javascript
{
    "type": "wait",
    "params": {
        "resource": "resourceName",
        "regexp": false,
        "timeout": 1000,
        "method": "DELETE"
    }
}
```

`damon` will wait at this step until something matching the resource is received.

`resource` will be interpreted as a `regexp` if set to `true`. Default value of `regexp` is `false`.

A `method` can be specified to filter the resource. If nothing is specified, any `method` will be accepted.

#### dom

`damon` can perform two different actions on a dom element :

##### click

```javascript
{
    "type": "dom",
    "params": {
        "selector": "button#btnSubmit",
        "xpath": false,
        "do": "click",
    }
}
```

`damon` will click on the specified selector.

##### fill

```javascript
{
    "type": "dom",
    "params": {
        "selector": "input#userName",
        "xpath": false,
        "do": "fill",
        "text": "yoann.dev"
    }
}
```

`damon` will enter text in the specified field.

`xpath` cannot be used when filling a file field due to [PhantomJS limitiations](http://docs.casperjs.org/en/latest/modules/casper.html#fill).

#### get

##### _store_

`damon` can perform different `get` to retrieve a value and store it for subsequent tasks :

###### attribute

```javascript
{
    "type": "get",
    "params": {
        "selector": "div#Info",
        "xpath": false,
        "attribute": "title",
        "key": "infoTitle",
        "modifier": "[a-z]+"
    }
}
```

`damon` will get the value of the `attribute`, apply the `modifier` RegExp and store it as `infoTitle`.

`@text` can also be used as an `attribute` to get the text content of the `selector`

###### variable

```javascript
{
    "type": "get",
    "params": {
        "variable": "var.attr1['attr2']",
        "key": "varAttr2"
    }
}
```

`damon` will access to the specified variable with `window` as the root object and store its value as `varAttr2`

###### resource

```javascript
{
    "type": "get",
    "params": {
        "resource": "resourceLink",
        "regexp": false,
        "variable": "payload.title",
        "key": "title",
        "method": "POST"
    }
}
```

`damon` will access to the specified variable of the matching `resource` and store it.

A `method` can be specified to filter the resource. If nothing is specified, any `method` will be accepted.

To access to a variable in the payload of a resource, write `payload.variableName` for `variable` field. Resource also contains the `headers`, `method`, `time` and `url`.

###### number of elements

```javascript
{
    "type": "get",
    "params": {
        "selector": "ul#list li",
        "xpath": false,
        "key": "liNumber"
    }
}
```

`damon` will store the number of elements that satisfy the `selector`

##### _access_

The value can then be accessed in any following tasks via its `key` value

```javascript
{
    "type": "wait",
    "params": {
        "url": "http://www.yahoo.ca/{{key}}"
    }
}
```

To access the stored value, call the `key` in between double brackets `{{key}}`

#### request

`damon` can perform any HTTP call.

```javascript
{
    "type": "request",
    "params": {
        "url": "https://www.google.com",
        "method": "GET",
        "payload": {
            "q": "funny cats"
        },
        "headers": {
            "header": "value"
        },
        "store": {
            "key": "key",
            "variable": "variable.attr1"
        }
    }
}
```

You can also `store` the response for later use with `{{key}}`.

If you don't pass a `variable` it will store the complete response.

Otherwise, it will try to parse the response as JSON and look for your variable.

#### assert

`damon` can perform different `assert` actions to test a value with an expected value:

##### attribute

```javascript
{
    "type": "assert",
    "params": {
        "selector": "div#Info",
        "xpath": false,
        "attribute": "title",
        "modifier": "[a-z]+",
        "expected": "expectedValue or {{key}}"
    }
}
```

`damon` will `get` the value of the `attribute` and test it against the `expected` value or the value associated with `{{key}}`

##### variable

```javascript
{
    "type": "assert",
    "params": {
        "variable": "var.attr1['attr2']",
        "expected": "expectedValue or {{key}}"
    }
}
```

`damon` will `get` the value of the `variable` and test it against the `expected` value or the value associated with `{{key}}`

##### key

```javascript
{
    "type": "assert",
    "params": {
        "key": "title",
        "expected": "Expected Title"
    }
}
```

`damon` will `get` the value of the `key` and test it against the `expected` value.

## Roadmap

- [x] Extract the CLI component.
- [x] Extract the default reporter component.
- [ ] Extract default actions. (place them in the config file to be imported)
- [ ] Extract default plugins. (place them in the config file to be imported)
- [ ] Create Sitemap crawling plugin (almost there).
- [ ] Create Retry mecanic plugin.
- [ ] Create Github Page to use as main website.
- [ ] Create wiki to document how to create reporters/actions/plugins.
- [ ] Extract runner component.
- [ ] Extract logger component.
- [ ] Add examples.
- [ ] Test everything individually.

## Contribute

We welcome Your interest in Autodesk’s Open Source Damon (the “Project”).

Any Contributor to the Project must accept and sign an Agreement indicating agreement
to the license terms below.

##### [Individual Contribution](http://goo.gl/forms/ctQNFrveEF)
##### [Corporate Contribution](http://goo.gl/forms/4DTn9ho2JT)

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied. See the License for the specific language governing permissions and limitations under the License.

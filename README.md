# Vicks - Fetch API with Superpowers

Vicks is a feature-rich, easy-to-use, and extensible implementation built on the top of the `fetch` API for Browsers and
Servers.
It is fully compatible with the existing `fetch` API while providing a number of useful extensions and features.
It is written in TypeScript and is fully typed. The overall size of the library is just 0.8KB (minified and gzipped).

## Features

- **Easy to use**: Vicks is designed to be easy to use and intuitive. It is fully compatible with the existing `fetch`
  API while providing a number of useful extensions and features.
- **Interceptors**: Vicks provides a powerful interceptor system that allows you to intercept requests and responses.
  You can use interceptors to transform the request before it is sent to the server, or transform the response before it
  is passed to your code.
- **Default Configurations**: Vicks allows you to set default configurations for all requests. You can set default
  headers, default query parameters, default request body, and more. You can even update the default configurations at
  runtime.
- **Multiple Clients**: Vicks allows you to create multiple clients with different configurations. You can create a
  client with default configurations and another client with different configurations. Each client will have its own
  interceptor system and default configurations.
- **Query Parameters**: Vicks allows you to pass query parameters in multiple ways. You can pass query parameters as an
  object, as a string, or even an `URLSearchParams` object. Vicks will automatically convert the query parameters to the
  correct format.
- **TypeScript Support**: Vicks is written in TypeScript and is fully typed. It provides type definitions for all the
  methods and options.
- **Small Size**: The overall size of the library is just <strong>0.8KB (minified and gzipped)</strong>.
- **No Dependencies**: Vicks has no dependencies. It is written in pure JavaScript and does not depend on any
  third-party libraries.

## Why Another HTTP Client?
As we know, the `fetch` API is the new standard for making HTTP requests in the browser. It is a modern replacement for
the `XMLHttpRequest` API. Fetch API is also widely supported by all the major browsers. It is also available in Node.js
above version 18. 

It is a low-level API that is easy to use and provides a lot of flexibility. However, it is not perfect. 
It has a few shortcomings that make it difficult to use in real-world applications. Vicks is designed to
fix these shortcomings and provide a better developer experience. All these features are already available in other
libraries like Axios, but they are not available in the `fetch` API.

## Installation

```bash
bun install vicks
yarn add vicks
pnpm install vicks
npm install vicks
```

## Usage

### Creating a Client

You can create a client with default configurations and use it to make requests. These configurations will be used for
all the requests made using this client. You can find a list of all the available options [here](#Default-Configurations-and-Options). You can use
as many clients as you want. Each client will have its own interceptor system and default configurations.

```ts
import { createClient } from "vicks";

// Create a client with default configurations
const client = createClient({
    baseURL: "https://jsonplaceholder.typicode.com",
    headers: {"Content-Type": "application/json"},
});

// Make a GET request
async function fetchPosts() {
    const response = await client.get("/posts");
    const posts = await response.json();
    console.log(posts);
}
```

### Default Client

Vicks provides a default client that you can use to make requests.

```ts
import { vicks } from "vicks";

// Make a GET request
async function fetchPosts() {
    const response = await vicks.get("https://jsonplaceholder.typicode.com/posts");
    const posts = await response.json();
    console.log(posts);
}
```

You can also override the default configurations for the default client. You can find a list of all the
available options [here](#Default-Configurations-and-Options).

```ts
import { vicks } from "vicks";

// Override the default configurations
vicks.defaults.baseURL = "https://jsonplaceholder.typicode.com";
vicks.defaults.headers = {"Content-Type": "application/json"};

// Make a GET request
async function fetchPosts() {
    const response = await vicks.get("/posts");
    const posts = await response.json();
    console.log(posts);
}
```

### Interceptors

Vicks provides a powerful interceptor system that allows you to intercept requests and responses. You can use
interceptors to transform the request before it is sent to the server, or transform the response before it is passed to
your code. You can add as many interceptors as you want. You can also remove an interceptor at any time.

#### Creating an Interceptor

```ts
import { createClient } from "vicks";

const client = createClient({
    baseURL: "https://jsonplaceholder.typicode.com",
});

// Add an interceptor
client.interceptors.request.use((request) => {
    // Transform the request
    request.headers["Content-Type"] = "application/json";
    return request;
});

// Add an interceptor
client.interceptors.response.use((response) => {
    // Transform the response
    if (response.status === 401) {
        window.location.href = "/login";
    }
    return response;
});
```

#### Removing an Interceptor

Interceptors return a function that can be used to remove the interceptor. You can remove an interceptor at any time.
This is useful to prevent any sort of memory leaks.

```ts
  useEffect(() => {
    const removeInterceptor = client.interceptors.request.use((request) => {
        // Transform the request
        request.headers["Content-Type"] = "application/json";
        return request;
    });

    return () => {
        // Remove the interceptor
        removeInterceptor();
    };
}, []);

```

#### Multiple Interceptors

You can add as many interceptors as you want. All the interceptors will be executed in the order they were added. This
is useful when you want to divide the logic into multiple interceptors.

```ts
client.interceptors.request.use(attachToken);
client.interceptors.request.use(attachLocale);
client.interceptors.request.use(attachUserAgent);
```

Make sure to eject the interceptors when you no longer need them.

```ts
const removeTokenInterceptor = client.interceptors.request.use(attachToken);
const removeLocaleInterceptor = client.interceptors.request.use(attachLocale);
const removeUserAgentInterceptor = client.interceptors.request.use(attachUserAgent);

// Eject the interceptors
removeTokenInterceptor();
removeLocaleInterceptor();
removeUserAgentInterceptor();
```

### Default Configurations and Options

Vicks allows you to set default configurations for all requests. You can set default headers, default query parameters,
default request body, and more.

| Option    | Type                                | Description                                                                                                                                                                              |
|-----------|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `baseURL` | `string`                            | The base URL of the API. If the `endpoint` is not an absolute URL, it will be combined with the `baseURL` to form an absolute URL. Vicks handle the case of trailing slashes gracefully. |
| `headers` | `object`                            | The default headers to be sent with every request.                                                                                                                                       |
| `params`  | `object`/`string`/`URLSearchParams` | The default query parameters to be sent with every request. Vicks will automatically convert the query parameters to the correct format.                                                 | 
| `body`    | `object`                            | The default request body to be sent with every request.                                                                                                                                  |

Apart from these options, you can also set any other option that is supported by the `fetch` API.

### Making Requests

Vicks provides a number of methods to make requests. All these methods are fully compatible with the existing `fetch` API.

#### GET Request

```ts
import { vicks } from "vicks";

// Make a GET request
async function fetchPosts() {
    const response = await vicks.get("/posts", {
        params: { userId: 1 },
    });
    const posts = await response.json();
    console.log(posts);
}
```

#### POST Request

```ts
import { vicks } from "vicks";

// Make a POST request
async function createPost() {
    const response = await vicks.post("/posts", {title: "foo", body: "bar"});
    const post = await response.json();
    console.log(post);
}
```

There are other methods available as well as `put`, `patch` and `delete`. 




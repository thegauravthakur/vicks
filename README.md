# Vicks - Fetch API with Superpowers

Vicks is a feature-rich, easy-to-use, and extensible implementation built on the top of the `fetch` API for Browsers and
Servers. It is fully compatible with the existing `fetch` API while providing a number of useful extensions and features.
It is written in TypeScript and is fully typed. The overall size of the library is just <strong>0.8KB (minified and gzipped)</strong>
(almost 15 times smaller than `axios`).

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
- **Intuitive API**: Vicks provides an intuitive API to make requests on the top of existing `fetch` API. It provides
  additional APIs to manage parameters, request body, and more.
- **TypeScript Support**: Vicks is written in TypeScript and is fully typed. It provides type definitions for all the
  methods and options.
- **Small Size**: The overall size of the library is just <strong>0.8KB (minified and gzipped)</strong>.
- **No Dependencies**: Vicks has no dependencies. It is written in pure JavaScript and does not depend on any
  third-party libraries.

## Installation

```bash
bun install vicks
yarn add vicks
pnpm install vicks
npm install vicks
```

## Usage

### Creating a Client

You can create a client with custom configurations and use it to make requests. These configurations will be used for
all the requests made using this client. You can find a list of all the available options [here](#Default-Configurations-and-Options). You can use
as many clients as you want. Each client will have its own interceptor system and default configurations. There will be
no interference between the clients.

```ts
import { vicks } from "vicks";

// Create a client with default configurations
const client = vicks.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    headers: { "Authorization": getToken() },
});

async function fetchPosts() {
    const response = await client.get("/posts");
    const posts = await response.json();
    console.log(posts);
}
```

In the above example, `Authorization` header will be sent with every request made using the `client`.

### Default Client

Vicks provides a default client that you can use to make requests.

```ts
import { vicks } from "vicks";

async function fetchPosts() {
    const response = await vicks.get("https://jsonplaceholder.typicode.com/posts");
    const posts = await response.json();
    console.log(posts);
}
```

You can also override the default configurations for the default client as well. You can find a list of all the
available options [here](#Default-Configurations-and-Options).

```ts
import { vicks } from "vicks";

vicks.defaults.baseURL = "https://jsonplaceholder.typicode.com";
vicks.defaults.headers = { "Authorization": getToken() };

async function fetchPosts() {
    const response = await vicks.get("/posts");
    const posts = await response.json();
    console.log(posts);
}
```

### Making Requests
Vicks provides an intuitive API to make requests on the top of existing `fetch` API. You can pass any of the options that are supported by the `fetch` API
along with other options provided by Vicks. You can find a list of all the available options [here](#Default-Configurations-and-Options).

Each request returns a `fetch` response object. You can use the `response` object to get the response body, status code, headers, and more.


#### GET

```ts
import { vicks } from "vicks";

async function fetchPosts() {
  const response = await vicks.get("/posts", {
    params: { userId: 1 },
    // You can pass any other option that is supported by the `fetch` API
  });
  const posts = await response.json();
  console.log(posts);
}
```

#### POST

```ts
import { vicks } from "vicks";

async function createPost() {
  const response = await vicks.post("/posts", {
    body: { title: "foo", body: "bar", userId: 1 },
    params: new URLSearchParams({ foo: "bar" }), // You can also pass a URLSearchParams object
    // You can pass any other option that is supported by the `fetch` API
  });
  const post = await response.json();
  console.log(post);
}
```

#### PUT

```ts
import { vicks } from "vicks";

async function updatePost() {
  const response = await vicks.put("/posts/1", {
    body: JSON.stringify(postBody), // You can also pass a string
    params: 'foo=bar' // You can also pass a string
    // You can pass any other option that is supported by the `fetch` API
  });
  const post = await response.json();
  console.log(post);
}
```

Vicks will automatically set the `Content-Type` header according to the provided request body. If you want to set the
`Content-Type` header manually, you can do so by passing the `headers` option.

```ts
import { vicks } from "vicks";

async function updatePost() {
  const response = await vicks.put("/posts/1", {
    body: JSON.stringify(postBody),
    headers: { "Content-Type": "application/json" },
    // You can pass any other option that is supported by the `fetch` API
  });
  const post = await response.json();
  console.log(post);
}
```

### Interceptors

Vicks provides a powerful interceptor system that allows you to intercept requests and responses. You can use
interceptors to transform the request before it is sent to the server, or transform the response before it is passed to
your code. You can add as many interceptors as you want. You can also remove an interceptor at any time.

#### Creating an Interceptor

```ts
import { vicks } from "vicks";

const client = vicks.create({
    baseURL: "https://jsonplaceholder.typicode.com",
});

client.interceptors.request.use((request) => {
    request.headers["Authorization"] = getToken();
	// You must return the request object after transforming it
    return request;
});

client.interceptors.response.use((response) => {
    if (response.status === 401) {
        window.location.href = "/login";
    }
	// You must return the response object after transforming it
    return response;
});
```

#### Removing an Interceptor

Interceptors return a function that can be used to remove the interceptor. You should always remove the interceptor
when you no longer need it. This will prevent memory leaks.

```ts
  useEffect(() => {
    const removeInterceptor = client.interceptors.request.use((request) => {
        request.headers["Authorization"] = getToken();
        return request;
    });

    return () => {
        // Remove the interceptor when the component is unmounted
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

| Option        | Type                                | Description                                                                                                                                                                              |
|---------------|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `baseURL`     | `string`                            | The base URL of the API. If the `endpoint` is not an absolute URL, it will be combined with the `baseURL` to form an absolute URL. Vicks handle the case of trailing slashes gracefully. |
| `headers`     | `object`                            | The default headers to be sent with every request.                                                                                                                                       |
| `params`      | `object`/`string`/`URLSearchParams` | The default query parameters to be sent with every request. Vicks will automatically convert the query parameters to the correct format.                                                 | 
| `body`        | `object`                            | The default request body to be sent with every request.                                                                                                                                  |
| Fetch Options | `-`                                 | You can pass any other option that is supported by the `fetch` API.                                                                                                                      |

Apart from these options, you can also set any other option that is supported by the `fetch` API.
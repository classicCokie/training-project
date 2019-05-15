# Mobify Platform Project

This Mobify Platform project is a _monorepo_ that includes the Javascript packages
you need to build your frontends. It includes:

- `pwa` - the code for your PWA
- `connector`  - the code for your data layer, using commerce-integrations

## Folder Structure
```
.
├── packages/pwa                    # PWA
    ├── app                         # Main project source folder
        ├── components              # Reusable React component
            ├── ...
                ├── index.jsx       # Main component file
                ├── _style.scss      # Component specific styles
                ├── test.js         # Component specific tests
        ├── pages                   # React components which represent pages in the PWA
            ├── ...
                ├── index.jsx       # Main page file
                ├── _style.scss     # Page specific styles
                ├── actions.js      # Page specific Redux actions
                ├── constants.js    # Page specific constants
                ├── reducer.js      # Page specific Redux reducer
                ├── selector.js     # Page specific selector
        ├── config                  # Configurations
        ├── preloader               # Fast initial page painting
        ├── static                  # Application static files such as svg, img, fonts
        ├── style                   # Sass files
        ├── utils                   # Utility functions
        ├── actions.js              # Actions that can be used across all pages
        ├── connector.js            # Configures the Commerce Integration connector for the PWA
        ├── index.jsx               # The React component which contains the rest of the app
        ├── loader.js               # On Tag-Loaded PWAs, this file starts the PWA
        ├── page-actions.js         # Actions that must be fired on every page load are here
        ├── router.jsx              # Configures the PWA routes
        ├── ssr-loader.js           # On Server Side Rendered builds, this file starts the PWA
        ├── ssr.js                  # Configures Server Side Rendering
    ├── dev-server                  # The webpack development server and certificate files
    ├── scripts                     # The npm scripts for build, test, deploy tasks
    ├── tests                       # Automation tests
        ├── e2e                     # End to end tests
    ├── webpack                     # Webpack configurations for production and development
    ├── worker                      # Service worker related code
    ├── ...
    ├── .eslintrc.yml               # Eslint configuration
    ├── .babelrc                    # ES6+ Compilation configuration
    ├── .sass-lint.yml              # SASS lint configuration
    ├── service-worker-loader.js    # The script that import the service worker
    ├── package.json
    ├── README.md
├── packages/connector              # The Commerce Integrations connector
```

## Installation

See our [Getting Started](https://docs.mobify.com/progressive-web/latest/getting-started/) guide for the latest installation instructions.

## Linting

```bash
  npm run lint
```

## Testing

Run tests for all packages with:

```bash
  cd [repo root]
  npm test
```

Run integration tests against live APIs for all packages with:

```bash
  cd [repo root]
  npm run integrationTest
```


[lerna]: https://github.com/lerna/lerna

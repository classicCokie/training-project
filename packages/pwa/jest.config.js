module.exports = {
    testURL: 'http://localhost/',
    verbose: true,
    collectCoverage: true,
    testPathIgnorePatterns: ['node_modules', 'build', 'scripts'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '../../__mocks__/fileMock.js',
        '\\.(css|less)$': '../../__mocks__/styleMock.js'
    },
    collectCoverageFrom: [
        'app/**/*.{js,jsx}',
        'non-pwa/**/*.{js,jsx}',
        'worker/**/*.{js,jsx}',
        '!app/main.jsx',
        '!app/loader.js',
        '!app/loader-routes.js',
        '!app/ssr-loader.js',
        '!app/ssr.js',
        '!app/static/**',
        '!node_modules/**'
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
        }
    },
    setupTestFrameworkScriptFile: './jest-setup.js',
    globals: {
        MOBIFY_CONNECTOR_NAME: ''
    }
}

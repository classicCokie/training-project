module.exports = {
    testURL: 'http://localhost/',
    verbose: true,
    collectCoverage: true,
    testPathIgnorePatterns: [
        'node_modules',
        'build',
        'scripts',
    ],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '../../__mocks__/fileMock.js',
        '\\.(css|less)$': '../../__mocks__/styleMock.js'
    },
    collectCoverageFrom: [
        'app/**/*.{js,jsx}',
        'non-pwa/**/*.{js,jsx}',
        'worker/**/*.{js,jsx}',
        '!app/static/**',
        '!node_modules/**'
    ],
    coverageThreshold: {
        global: {
            statements: 10,
            branches: 5,
            functions: 10,
            lines: 10
        }
    },
    setupTestFrameworkScriptFile: './jest-setup.js'
}

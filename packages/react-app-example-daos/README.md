# Webapp example using the Solana DAO SDK

This is a very simple example of how you can use the Solana DAO SDK in you frontend.

## Moving to react-app-rewired

Due to a couple of issues we started using create-app-rewired.
This is because CRA doesn't handle .cjs files and inside the spl-governance dependency tree we have a few of them when compiled.
More info in this [Discord message](https://discord.com/channels/910194960941338677/910566058740568094/959837943265116250) and in this [react-app issue](https://github.com/facebook/create-react-app/pull/12021)

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Threaded Comments App

This project contains a Forge Threaded Comments app written in React that displays in a Jira issue panel. 

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

![Threaded App for Jira](./example.gif "Todo app for Jira")

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick Start

### Register the app
- Set Forge Environment:
```
read FORGE_EMAIL
# Enter email
read -s FORGE_API_TOKEN
# Enter API token (will not be displayed)
export FORGE_EMAIL FORGE_API_TOKEN
```
- Register the app by running:
```
forge register
```


### Frontend
- Change into the frontend directory by running:
```
cd ./static/comment
```

- Install your frontend dependencies by running:
```
npm install
```

- Build your frontend by running:
```
npm run build
```

### Deployment
For this section, ensure you have navigated back to the root of the repository.

- Install the forge dependencies by running:
```
npm install
```

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

### Alternative
- Change into the frontend directory by running:
```
cd ./static/comment
```

- Install your frontend dependencies by running:
```
npm install
```

ensure you have navigated back to the root of the repository.

- Install the forge dependencies by running:
```
npm install
```

- Build, deploy and install your app by running:
```
npm run deploy
```
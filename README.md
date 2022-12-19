# All-Tube Downloader Service

APIs to use [yt-dlp](https://github.com/yt-dlp/yt-dlp) as a service

## Setup

## Debugging

### Run and Debug in VSCode

Simply "Launch Server.js" in VSCode

### Run and Debug Docker container

1. Run `docker:dev` to build and deploy docker container. (make sure you have docker service running on your machine)
2. In VSCode lunch `Docker: Attach to Node`
3. Add breakpoint in the js files inside the dist folder (make sure to run `npm run build` if needed)

## Details

The service is using [youtube-dl-exec](https://www.npmjs.com/package/youtube-dl-exec) which is a Node.js wrapper for [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## Notice

Downloading videos from Youtube is not allowed in many cases. Make sure to follow youtube terms and conditions.

## Deployment Options

### Github Actions + AKS

Here are the steps needed to setup Github repo actions and Azure account to deploy to Azure Kubernetes service

1. Create an Azure Kubernetes cluster with a container registry
2. Follow these steps to setup Azure and add required secrets to Github actions secrets.

- [Configure a GitHub Action to create a container instance](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-github-action)

3. Add all the secrets to your [github repro secrets](https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md).
4. Generate an api key and add it to github action secrets with name "API_KEY"

### Github Actions + Azure AppService

'azureRelease.yml' Github action will deploy a docker container to Azure Container Registry (ACR)

1. Follow these steps to setup Azure and add required secrets to Github actions secrets.

- [Configure a GitHub Action to create a container instance](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-github-action)

2. Add all the secrets to your [github repro secrets](https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md).
3. Once the container is deployed to ACR, go to Azure portal > ACR > Repositories > alltubeapp and find the latest. Click on ... on the container and choose "Deploy to web app". This will create a new web app service and create CD for it.
4. Once App Service created open it and go to Configurations
5. Generate an api key and add it to configurations with key: `API_KEY`. This is the API-KEY your client should provide in the header to call to the service.
6. In Configurations also create PORT and set value to 80

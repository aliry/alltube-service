# All-Tube Downloader Service

APIs to use [yt-dlp](https://github.com/yt-dlp/yt-dlp) as a service

## Setup

## Service

## Details

The service is using [youtube-dl-exec](https://www.npmjs.com/package/youtube-dl-exec) which is a Node.js wrapper for [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## Notice

Downloading videos from Youtube is not allowed in many cases. Make sure to follow youtube terms and conditions.

## CI/CD

### Github Actions + AKS

Here are the steps needed to setup Github repo actions and Azure account to deploy to Azure Kubernetes service

1. Create an Azure Kubernetes cluster with a container registry
2. Follow these steps to setup Azure and add required secrets to Github actions secrets.

- [Configure a GitHub Action to create a container instance](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-github-action)

3. Add all the secrets to your [github repro secrets](https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md).
4. Generate an api key and add it to github action secrets with name "API_KEY"
